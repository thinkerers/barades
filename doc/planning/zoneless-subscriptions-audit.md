# Zoneless Migration - Manual `.subscribe()` Audit

_As of 2025-10-20_

The following occurrences of imperative `.subscribe()` calls remain in the frontend application. They are recorded here to guide Phase 2 refactors when we replace remaining subscriptions with signal-friendly patterns or helper utilities.

## Production Code

- `apps/frontend/src/app/features/groups/groups-list.ts`
  - `cancel$.subscribe(...)` is used to cancel the auto-retry timer when the retry state changes.
  - `timer(1000).subscribe(...)` schedules countdown ticks inside a `PendingTasks.run()` block.
- `apps/frontend/src/app/features/groups/group-detail.ts`
  - Same pattern as the list view: `cancel$.subscribe(...)` to teardown retries and `timer(1000).subscribe(...)` for countdown updates.
- `apps/frontend/src/app/features/locations/locations-list.ts`
  - `timer(delay).subscribe(...)` drives deferred map interactions; `cancel$.subscribe(...)` ensures pending timers can be cancelled during teardown.

These cases likely need to be converted to `toSignal`, `firstValueFrom`, or custom helpers that encapsulate the timer logic without manual subscriptions.

## Test Code (Informational Only)

- `apps/frontend/src/app/features/sessions/session-card.spec.ts`
- `apps/frontend/src/app/core/services/users.service.spec.ts`

The `.subscribe()` usage in specs is acceptable for arranging observable responses during tests, but they are listed for completeness.
