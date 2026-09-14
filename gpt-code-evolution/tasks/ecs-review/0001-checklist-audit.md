# 0001 — ECS checklist and first audit

Status: Done
Role: reviewer
Scope: user-requested process improvement and review only. **No source/test refactoring authorized or performed.** Not a replacement for square task 0015.

## Checklist applied to existing code

| Check | Result | Evidence / consequence |
|---|---|---|
| Systems do not know one another | Pass | RenderSystem imports ECS/schema/port, not other systems; Composition constructs and invokes it |
| Single system policy | Pass with readability finding | RenderSystem owns one projection-reconciliation policy; synchronize embeds several named operations |
| Reads/writes explicit | Pass after documentation | Reads Position/Square; no ECS writes; new system card records external effects |
| Reuse via values/components | Pass | Game config supplies size; query handles Position + Square. No new tags needed for the square |
| Independent test setup | Finding | Fake renderer and Node environment are good, but RenderSystem test always constructs Game's square fixture; system isolation from entity initialization is incomplete |
| No duplicate game model | Pass | renderedEntities stores IDs only; no cached position/size in RenderSystem |
| Matching / non-matching entities | Test gap | Existing test only covers the default matching square; unrelated entities are untested |
| Enter / stay / entity deletion | Pass | Existing test covers initial create, repeated sync, changed values, deletion, and no duplicate removal |
| Component removal / re-entry | Test gap | No test removes Position or Square while keeping entity alive; no test restores membership |
| Live-resource teardown | Test gap | RenderSystem.dispose is tested only after entity deletion emptied the membership cache; populated disposal, repeated disposal, and subsequent synchronize are untested at system level |
| Recycled ID semantics | Not verified | No explicit test or documented bitECS identity-reuse check; do not claim an observed bug or add generation machinery without evidence |
| Phase ownership | Pass | Composition owns initialize → synchronize → draw and RenderSystem → adapter → Game teardown |
| Cadence / dirty tracking | Not applicable | Static square needs no simulation loop, command queue, or dirty tags |

## Proposed changes—not applied

### E1 — Name reconciliation operations (readability, not correctness blocker)

Current `RenderSystem.synchronize()` performs query collection, create/update dispatch, stale-resource removal, and membership replacement inline. The removal loop highlighted by the user is a separate operation within the same lifecycle policy.

Recommended shape (illustrative names, not a required API):

```text
RenderSystem.synchronize()
  currentIds = synchronizeMatchingEntities()
  removeDepartedEntities(currentIds)
  rememberCurrentEntities(currentIds)
```

Each helper has one operation; RenderSystem retains one coherent responsibility. Only extract `rememberCurrentEntities` if the named step is clearer than a simple assignment. Do not create three systems merely to distribute this cache across them.

Acceptance for a future authorized repair: same create/update/remove behavior; existing tests pass; responsibility card remains accurate; no new global state or system-to-system references.

### E2 — Isolate system tests and close lifecycle gaps (test-quality finding)

Construct the minimal world/components directly in RenderSystem tests; keep separate Game initialization tests. Add cases for non-matching entities, component removal and re-entry, disposal while a graphic is tracked, repeated disposal, and synchronize after disposal. Inspect actual entity-ID reuse behavior and test it if reuse can occur between synchronization calls.

This is proposed work, not claimed coverage. Existing green tests do not establish these cases.

### E3 — Do not add speculative tags/systems (no change)

Position + Square already selects the current renderables. Different size/position uses component values. A visibility tag is justified only if a feature needs independent visibility while retaining shape data. New shapes need a real feature and an architect decision, not a generic catalog now.

## Loop handoff

- Planner/architect/implementer/reviewer now link the extended ECS checklist conditionally.
- Square review task 0015 must revisit E1/E2 and classify dispositions (repair, justified defer, or no issue). This audit does not auto-authorize refactoring or insert a repair into the runner list.
- E1 is a readability suggestion, not proof that lifecycle reconciliation violates single responsibility.
- If the review finds a blocker or consequential boundary choice, the runner stops. A bounded repair is planned explicitly; no silent acceptance weakening.
- After an authorized repair, compare behavior/test evidence and keep only rules that helped. No universal rule to split every loop.

## Validation

- `npm run test:unit && npm run test:e2e && npm run typecheck && npm run build` — passed: 14 unit tests, 1 Chromium test, typecheck, production build. These results do not cover the newly identified test gaps.
- Python SHA-256 comparison against pre-review hashes — all 21 source/test/runner files unchanged.
- Python pathlib/Markdown-link scan — 28 Markdown files, zero broken local links.

Documentation follow-up: replaced the field/method-style system catalog with a boundary/rationale map and code/test links; added project map and documentation checklist. Earlier references in this audit to a system card are historical: the canonical artifact is now the system map. Python link scan passed for 30 Markdown files. Reran `npm run test:unit && npm run test:e2e && npm run typecheck && npm run build`: 14 unit tests, 1 browser test, typecheck and build passed. No source/test edits in this follow-up.

- **Format follow-up.** Applied `- **Short title.** Details.` to shared docs/checklists; removed repetition and obvious advice. Task evidence and acceptance criteria preserved; source/tests unchanged.
- **Checks.** Markdown link scan: 30 files, zero broken links. `npm run test:unit && npm run test:e2e && npm run typecheck && npm run build`: passed (14 unit tests, 1 browser test, typecheck, build).

Process/checklist delivery and this audit are complete; proposed code/test repairs remain unapplied. Square feature remains In progress with task 0014 next.
