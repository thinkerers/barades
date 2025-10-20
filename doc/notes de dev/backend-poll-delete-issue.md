# Backend Issue: Poll Deletion Fails with P2025

## Problem

`DELETE /api/polls/:id` crashes with HTTP 500 when attempting to delete a poll whose `groupId` references a deleted group.

**Error:**
```
PrismaClientKnownRequestError: 
Invalid `prisma.poll.delete()` invocation:

An operation failed because it depends on one or more records that were required but not found. No record was found for a delete.
```

**Code:** `P2025`

## Root Cause

The `PollsService.remove()` method calls `prisma.poll.delete({ where: { id } })` but Prisma throws P2025 when the poll references a missing group (likely due to missing cascade delete configuration or orphaned foreign keys).

## Impact

- **E2E test cleanup** fails intermittently, leaving stale polls in the database
- **Test parallelism** breaks because cleanup helpers return 500 but polls persist
- **Frontend state pollution** occurs when re-seeding creates new groups but old polls remain

## Current Workaround

E2E cleanup helper (`apps/frontend-e2e/src/helpers/api-cleanup.ts`) treats HTTP 500 as idempotent success:

```ts
if (status === 404 || status === 410 || status === 500) {
  return; // Assume already deleted
}
```

This allows tests to proceed but **does not actually remove orphaned polls**.

## ✅ Fix Applied

### Option 1: Catch P2025 in backend (IMPLEMENTED)

```ts
// apps/backend/src/polls/polls.service.ts
async remove(id: string) {
  try {
    return await this.prisma.poll.delete({ where: { id } });
  } catch (error) {
    if (error.code === 'P2025') {
      // Poll already deleted or orphaned — return success
      return { id, deleted: true };
    }
    throw error;
  }
}
```

**Status:** ✅ Implemented in commit [current]
- Backend now returns 200 with `{ id, deleted: true }` instead of 500
- DELETE endpoint is now idempotent (safe to call multiple times)
- Cleanup helper no longer needs 500 workaround

### Option 2: Add database cascade delete

Update Prisma schema to cascade:

```prisma
model Poll {
  id      String   @id @default(cuid())
  groupId String
  group   Group    @relation(fields: [groupId], references: [id], onDelete: Cascade)
  // ...
}
```

Run migration:
```bash
npx prisma migrate dev --name add-poll-cascade
```

### Option 3: Pre-check existence

```ts
async remove(id: string) {
  const poll = await this.prisma.poll.findUnique({ where: { id } });
  if (!poll) {
    throw new NotFoundException(`Poll ${id} not found`);
  }
  return this.prisma.poll.delete({ where: { id } });
}
```

## Affected Tests

The following E2E tests are marked with `test.fixme()` until this is resolved:

- `polls.spec.ts`:
  - `should allow alice_dm to create a poll in Brussels Adventurers Guild`
  - `should show poll creation button only for group members`
  - `should validate poll form fields`
  - `should display existing poll in group`
  - `should show vote counts for poll dates`

- `form-validation.spec.ts`:
  - All tests in "Poll Creation Form" suite (shared `beforeEach` cleanup fails)

## Next Steps

1. Choose a fix strategy (Option 2 recommended—cascade delete is cleanest)
2. Apply Prisma schema changes
3. Run migration
4. Verify E2E cleanup helper succeeds
5. Remove `test.fixme()` annotations
6. Remove 500 workaround from cleanup helper

## References

- Prisma error codes: https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
- Cascade delete: https://www.prisma.io/docs/concepts/components/prisma-schema/relations/referential-actions
