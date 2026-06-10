import {
  parseAnthropicCacheTtl,
  addTtlToCacheControl,
  createCacheTtlFetch,
  applyCacheTtlFetch,
} from './cacheTtl';

describe('parseAnthropicCacheTtl', () => {
  it('returns "1h" for the 1h value (case/whitespace tolerant)', () => {
    expect(parseAnthropicCacheTtl('1h')).toBe('1h');
    expect(parseAnthropicCacheTtl(' 1H ')).toBe('1h');
  });

  it('returns undefined for unset, empty, 5m, or junk values', () => {
    expect(parseAnthropicCacheTtl(undefined)).toBeUndefined();
    expect(parseAnthropicCacheTtl(null)).toBeUndefined();
    expect(parseAnthropicCacheTtl('')).toBeUndefined();
    expect(parseAnthropicCacheTtl('5m')).toBeUndefined();
    expect(parseAnthropicCacheTtl('8h')).toBeUndefined();
  });
});

describe('addTtlToCacheControl', () => {
  it('stamps ttl on system, tools, and message-content cache_control blocks', () => {
    const body = JSON.stringify({
      model: 'claude-sonnet-4-6',
      system: [
        { type: 'text', text: 'instructions', cache_control: { type: 'ephemeral' } },
      ],
      tools: [
        { name: 'a', input_schema: {} },
        { name: 'b', input_schema: {}, cache_control: { type: 'ephemeral' } },
      ],
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'hello', cache_control: { type: 'ephemeral' } },
          ],
        },
      ],
    });
    const { body: rewritten, count } = addTtlToCacheControl(body, '1h');
    expect(count).toBe(3);
    const parsed = JSON.parse(rewritten);
    expect(parsed.system[0].cache_control).toEqual({ type: 'ephemeral', ttl: '1h' });
    expect(parsed.tools[1].cache_control).toEqual({ type: 'ephemeral', ttl: '1h' });
    expect(parsed.messages[0].content[0].cache_control).toEqual({
      type: 'ephemeral',
      ttl: '1h',
    });
    expect(parsed.tools[0].cache_control).toBeUndefined();
  });

  it('does not overwrite an existing ttl', () => {
    const body = JSON.stringify({
      system: [{ type: 'text', text: 'x', cache_control: { type: 'ephemeral', ttl: '5m' } }],
    });
    const { body: rewritten, count } = addTtlToCacheControl(body, '1h');
    expect(count).toBe(0);
    expect(rewritten).toBe(body);
  });

  it('ignores non-ephemeral cache_control and unrelated keys', () => {
    const body = JSON.stringify({
      system: [{ type: 'text', text: 'x', cache_control: { type: 'persistent' } }],
      metadata: { cache_control: 'not-an-object' },
    });
    const { count } = addTtlToCacheControl(body, '1h');
    expect(count).toBe(0);
  });

  it('passes through bodies without cache_control untouched', () => {
    const body = JSON.stringify({ model: 'claude-sonnet-4-6', messages: [] });
    const result = addTtlToCacheControl(body, '1h');
    expect(result.count).toBe(0);
    expect(result.body).toBe(body);
  });

  it('passes through invalid JSON untouched', () => {
    const body = 'not json but mentions "cache_control"';
    const result = addTtlToCacheControl(body, '1h');
    expect(result.count).toBe(0);
    expect(result.body).toBe(body);
  });
});

describe('createCacheTtlFetch', () => {
  it('rewrites string bodies and forwards to the base fetch', async () => {
    const seen: Array<{ input: unknown; init?: Record<string, unknown> }> = [];
    const baseFetch = async (input: unknown, init?: Record<string, unknown>) => {
      seen.push({ input, init });
      return 'response';
    };
    const logs: string[] = [];
    const wrapped = createCacheTtlFetch('1h', (m) => logs.push(m), baseFetch);

    const body = JSON.stringify({
      system: [{ type: 'text', text: 'x', cache_control: { type: 'ephemeral' } }],
    });
    const result = await wrapped('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      body,
    });

    expect(result).toBe('response');
    expect(seen).toHaveLength(1);
    const sentBody = JSON.parse(seen[0].init?.body as string);
    expect(sentBody.system[0].cache_control).toEqual({ type: 'ephemeral', ttl: '1h' });
    expect(logs).toHaveLength(1);
    expect(logs[0]).toContain('ttl=1h');
  });

  it('leaves non-string and cache-free bodies untouched (no log)', async () => {
    const seen: Array<Record<string, unknown> | undefined> = [];
    const baseFetch = async (_input: unknown, init?: Record<string, unknown>) => {
      seen.push(init);
      return 'ok';
    };
    const logs: string[] = [];
    const wrapped = createCacheTtlFetch('1h', (m) => logs.push(m), baseFetch);

    const plain = JSON.stringify({ messages: [] });
    await wrapped('url', { body: plain });
    await wrapped('url', undefined);

    expect(seen[0]?.body).toBe(plain);
    expect(seen[1]).toBeUndefined();
    expect(logs).toHaveLength(0);
  });
});

describe('applyCacheTtlFetch', () => {
  it('chains an existing fetch on clientOptions', async () => {
    const calls: string[] = [];
    const existingFetch = async (_input: unknown, init?: Record<string, unknown>) => {
      calls.push(init?.body as string);
      return 'ok';
    };
    const clientOptions: { fetch?: unknown } & Record<string, unknown> = {
      fetch: existingFetch,
    };
    applyCacheTtlFetch(clientOptions, '1h');
    expect(clientOptions.fetch).not.toBe(existingFetch);

    const body = JSON.stringify({
      system: [{ type: 'text', text: 'x', cache_control: { type: 'ephemeral' } }],
    });
    const wrapped = clientOptions.fetch as (
      input: unknown,
      init?: Record<string, unknown>,
    ) => Promise<unknown>;
    await wrapped('url', { body });

    expect(calls).toHaveLength(1);
    expect(JSON.parse(calls[0]).system[0].cache_control.ttl).toBe('1h');
  });
});
