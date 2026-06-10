# NEOLO capped agents -- seed

The LibreChat cost-control setup forces all chat through three capped agents
(NEOLO Assistant / ChatGPT / Gemini). Those agents live **only in MongoDB** --
`librechat.yaml` (repo root) references them by `agent_id` but does not define
them. This directory is their version-controlled backup.

## Files
- `restore-neolo-agents.js` -- self-contained mongosh script. Embeds the 3 agent
  documents + their ACL entries (owner + public-viewer) and upserts them by `_id`
  (idempotent). Run against the LibreChat `test` db to recreate the agents.

## When to use
- **DB loss / restore from old backup** -> run the script; agents return and the
  modelSpecs `agent_id` references resolve again.
- **After editing agent config in the DB** (model, maxContextTokens, tools,
  instructions) -> re-export and regenerate this file so git stays source of truth.

## Current agents (2026-06-09)
| Spec | agent_id | Model | maxContextTokens | Tools |
|---|---|---|---|---|
| NEOLO Assistant | agent_N2AY02yFV92f15ZNCM1p6G | claude-sonnet-4-6 | 256000 | 91 |
| ChatGPT (GPT-5.2) | agent_pf3h5Hg6KPxpJSbajgeHJ0 | gpt-5.2-2025-12-11 | 256000 | 91 |
| Gemini 3.5 Flash | agent_FLiwwIMe7Y1zXVmce9Ruu6 | gemini-3.5-flash | 256000 | 91 |
