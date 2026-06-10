/**
 * Extended prompt-cache TTL for the direct Anthropic API path.
 *
 * `@librechat/agents` hardcodes `cache_control: { type: 'ephemeral' }` (no `ttl`)
 * when it applies prompt caching, and exposes no configuration for it (the
 * upstream `promptCacheTtl` work in danny-avila/agents#123 / LibreChat#12875 is
 * Bedrock-only). Anthropic's 1-hour cache duration is GA (no beta header):
 * blocks simply carry `cache_control: { type: 'ephemeral', ttl: '1h' }`.
 *
 * Rather than patching the dependency, this module injects a `fetch` wrapper via
 * the Anthropic SDK's `clientOptions.fetch` (the same plumbing the existing
 * `defaultHeaders` / proxy `fetchOptions` support uses). The wrapper rewrites the
 * outgoing JSON body, stamping `ttl` onto every `cache_control` block that does
 * not already declare one. Operating at the HTTP boundary keeps this resilient
 * to `@librechat/agents` version bumps.
 *
 * Why 1h: translators pause between segments; the default 5m cache expires
 * during those pauses and the next turn re-writes the whole prefix at 1.25x.
 * The 1h cache survives the pauses and its TTL refreshes at no cost on every
 * hit, so it stays warm across a full workday of active use.
 *
 * Pricing note: 1h cache writes bill at 2x base input (vs 1.25x for 5m); reads
 * stay 0.1x. LibreChat's internal token accounting (api/models/tx.js) only
 * knows the 1.25x write rate, so per-user balance tracking slightly undercounts
 * 1h writes - acceptable for a guardrail, and total writes drop sharply because
 * pause-expiry re-writes disappear.
 *
 * Enabled via env: ANTHROPIC_PROMPT_CACHE_TTL=1h (unset / any other value =
 * current default behavior, no rewrite).
 */

export type AnthropicCacheTtl = '1h';

/** Parses the ANTHROPIC_PROMPT_CACHE_TTL env value; only '1h' activates the rewrite. */
export function parseAnthropicCacheTtl(value?: string | null): AnthropicCacheTtl | undefined {
  return value != null && value.trim().toLowerCase() === '1h' ? '1h' : undefined;
}

function walkCacheControl(node: unknown, ttl: AnthropicCacheTtl, state: { count: number }): void {
  if (node == null || typeof node !== 'object') {
    return;
  }
  if (Array.isArray(node)) {
    for (const item of node) {
      walkCacheControl(item, ttl, state);
    }
    return;
  }
  const record = node as Record<string, unknown>;
  const cacheControl = record.cache_control;
  if (
    cacheControl != null &&
    typeof cacheControl === 'object' &&
    !Array.isArray(cacheControl) &&
    (cacheControl as Record<string, unknown>).type === 'ephemeral' &&
    (cacheControl as Record<string, unknown>).ttl == null
  ) {
    (cacheControl as Record<string, unknown>).ttl = ttl;
    state.count += 1;
  }
  for (const value of Object.values(record)) {
    walkCacheControl(value, ttl, state);
  }
}

/**
 * Adds `ttl` to every `cache_control: { type: 'ephemeral' }` block in a JSON
 * request body that does not already declare a ttl. Returns the (possibly
 * rewritten) body and the number of blocks stamped. Non-JSON or cache-free
 * bodies pass through untouched.
 */
export function addTtlToCacheControl(
  body: string,
  ttl: AnthropicCacheTtl,
): { body: string; count: number } {
  if (!body.includes('"cache_control"')) {
    return { body, count: 0 };
  }
  try {
    const parsed: unknown = JSON.parse(body);
    const state = { count: 0 };
    walkCacheControl(parsed, ttl, state);
    if (state.count === 0) {
      return { body, count: 0 };
    }
    return { body: JSON.stringify(parsed), count: state.count };
  } catch {
    return { body, count: 0 };
  }
}

type FetchInit = { body?: unknown } & Record<string, unknown>;
type FetchLike = (input: unknown, init?: FetchInit) => Promise<unknown>;

/**
 * Wraps a fetch implementation so outgoing string bodies get their
 * cache_control blocks stamped with the extended ttl before sending.
 */
export function createCacheTtlFetch(
  ttl: AnthropicCacheTtl,
  log?: (message: string) => void,
  baseFetch?: FetchLike,
): FetchLike {
  const underlying: FetchLike =
    baseFetch ?? (globalThis.fetch as unknown as FetchLike);
  return async (input: unknown, init?: FetchInit) => {
    if (init != null && typeof init.body === 'string') {
      const { body, count } = addTtlToCacheControl(init.body, ttl);
      if (count > 0) {
        init = { ...init, body };
        log?.(`[anthropic] applied prompt-cache ttl=${ttl} to ${count} cache_control block(s)`);
      }
    }
    return underlying(input, init);
  };
}

/**
 * Installs the ttl fetch wrapper on an Anthropic SDK client-options object,
 * chaining any fetch implementation already present.
 */
export function applyCacheTtlFetch(
  clientOptions: { fetch?: unknown } & Record<string, unknown>,
  ttl: AnthropicCacheTtl,
  log?: (message: string) => void,
): void {
  clientOptions.fetch = createCacheTtlFetch(
    ttl,
    log,
    clientOptions.fetch as FetchLike | undefined,
  );
}
