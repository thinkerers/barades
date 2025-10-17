# Poll E2E Cleanup Race Condition

_Last updated: 2025-10-17_

## Context

Our Playwright end-to-end suites under `apps/frontend-e2e` exercise the poll creation and management flows against the NestJS backend. Each spec shares the same deterministic seed data, so they rely on a helper (`apps/frontend-e2e/src/helpers/api-cleanup.ts`) to delete the poll fixtures before every test. Historically the suites (`polls.spec.ts`, `form-validation.spec.ts`, `edge-cases.spec.ts`, and parts of `error-handling.spec.ts` / `permissions.spec.ts`) were registered as fully parallel Playwright test files.

## What Was Going Wrong

1. **Shared cleanup target** – Every worker hits the `DELETE /api/polls/:id` endpoint for the same handful of seeded poll IDs.
2. **Backend behaviour under orphaned data** – The backend occasionally returned Prisma `P2025` errors (HTTP 500) when a poll referenced a group that had already been removed. We patched this to behave idempotently, but the cleanup endpoint still has to perform real work.
3. **File-based locking under contention** – We introduced a file lock to ensure only one worker removes the poll at a time. However, when multiple Playwright workers started the same suite concurrently, they all tried to take the lock in `beforeEach`. The waiting workers would sit in an exponential backoff loop that frequently exceeded the default 30s Jest timeout, causing `beforeEach hook timed out` failures.
4. **Retry storms after timeouts** – Once a worker hit the timeout, it aborted the test but left the lock file in place. Subsequent retries then saw an apparently stale lock, recreated it, and repeated the wait → timeout cycle.

The visible symptom was flakiness concentrated around poll specs: tests would fail in the first `beforeEach`, reporting that the cleanup helper could not acquire the lock within 30 seconds.

## Why Serialisation Fixes It

All poll-related suites exercise the same stateful workflow:
- they mutate the same poll/group fixtures;
- they depend on sequential steps (create poll → verify UI → delete poll) that are inherently order-sensitive; and
- their cleanup touches the same database records.

Running these specs in Playwright's parallel mode makes multiple workers contend for the same resources, forcing the lock helper to queue them. Serialising the suites (`test.describe.configure({ mode: 'serial' })`) ensures that only one worker executes the poll scenarios at a time. That removes the lock contention entirely—each spec acquires the file lock immediately, completes cleanup quickly, and releases it before the next test starts.

## Additional Hardening

While serialising was the decisive fix, we also hardened the cleanup helper to avoid stale locks:
- the lock file now records the creating process ID and timestamp;
- a TTL (default 60s) clears out locks left behind by crashed runs; and
- we verify that the originating process is still alive before trusting an existing lock.

These safeguards prevent a single failed run from blocking future suites, but they are not a substitute for avoiding parallel contention when the tests share state.

## Takeaways

- State-heavy Playwright suites (especially those that perform destructive backend cleanup) should run serially unless they use isolated fixtures per worker.
- File locking protects us from double-deletion, but it cannot overcome fundamental resource contention when many workers hit the same records simultaneously.
- When diagnosing `beforeEach` timeouts, inspect both the helper-level logs and the backend API behaviour—flakiness often stems from the interplay of frontend orchestration and backend idempotency.

## Restoring Parallelism Safely

Serial mode is our stopgap. To reclaim parallel speed without reintroducing flake, we should migrate toward isolated test data. The recommended path in 2025 prioritises:

1. **Test-scoped data creation (preferred):** Each test spins up its own poll (and dependent entities) in `beforeEach` and deletes it in `afterEach`. No shared cleanup, no contention.
2. **Worker-scoped database isolation:** Provision an isolated schema or container per Playwright worker via `globalSetup`/`globalTeardown`. Highest performance, higher operational cost.
3. **Worker namespacing:** Tag data with `testInfo.workerIndex` so each worker touches only its own records. Easier but still prone to orphaned data if a worker crashes.

The first option aligns with modern E2E practice: “create, don’t clean”. It gives us deterministic fixtures, explicit dependencies, and compatibility with unlimited parallelism.

## Broader 2025 Best Practices

- **Ephemeral environments:** Spin up the full stack (frontend, backend, DB) in disposable containers per CI run to guarantee a clean baseline.
- **Accessible selectors first:** Prefer `getByRole`/ARIA and user-visible text before falling back to `data-testid`, avoiding brittle CSS chains.
- **Balanced test portfolio:** Keep E2E lean and critical—lean on unit/integration tests (testing trophy model) for breadth.
- **Flake response plan:** Capture Playwright traces by default, allow a single CI retry for transient failures, and quarantine persistent flakes until fixed.

Adopting these practices alongside test-scoped data will let us turn parallel execution back on with confidence.
