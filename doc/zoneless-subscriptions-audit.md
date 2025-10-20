# Zoneless Migration - Manual `.subscribe()` Audit

_As of 2025-10-20_

The following list tracks imperative `.subscribe()` calls discovered during the migration. It is now limited to test helpers, as the production code has been refactored to rely on `firstValueFrom`, signals, or PendingTasks helpers.

## Production Code

- _None_. All production `.subscribe()` usages have been removed.

## Test Code (Informational Only)

- `apps/frontend/src/app/features/sessions/session-card.spec.ts`
- `apps/frontend/src/app/core/services/users.service.spec.ts`

The `.subscribe()` usage in specs is acceptable for arranging observable responses during tests, but they are listed for completeness.
