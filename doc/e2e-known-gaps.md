# E2E Known Gaps (negative scenarios)

_Last updated: 2025-10-16_

The newly added negative Playwright specs surface genuine product gaps. The tests are currently marked with `test.fixme` until the application implements the corresponding behaviour.

## Error handling

- `error-handling.spec.ts › should handle groups API timeout gracefully`
  - UI must surface a timeout message when the groups endpoint stalls.
- `error-handling.spec.ts › should allow retry after network error`
  - Design and implement a retry UX following a failed fetch.
- `error-handling.spec.ts › should handle 500 Internal Server Error`
  - Display a friendly message for 5xx responses on groups fetch.
- `error-handling.spec.ts › should handle 404 Not Found for missing group`
  - Provide a dedicated "group not found" screen.
- `error-handling.spec.ts › should handle 503 Service Unavailable`
  - Add maintenance mode banner/message for 503 responses.
- `error-handling.spec.ts › should show loading state during slow API calls`
  - Render an explicit loading indicator while fetching groups.
- `error-handling.spec.ts › should not break UI with slow poll creation`
  - Disable submit or show progress until poll creation completes.
- `error-handling.spec.ts › should detect and notify when going offline`
  - Display an offline notification when the browser loses connectivity.

## Permissions and authentication

- `permissions.spec.ts › should redirect to login when accessing protected routes`
  - Guard `/groups` and other protected routes when no session exists.
- `permissions.spec.ts › should redirect to login when accessing group detail`
  - Secure `/groups/:id` page for anonymous visitors.
- `permissions.spec.ts › should show login page for unauthenticated API calls`
  - API must return 401 for requests without a valid token.
- `permissions.spec.ts › should not show create poll button for non-members`
  - Hide poll creation UI when the user is not a group member.
- `permissions.spec.ts › should return 403 when non-member tries to vote via API`
  - Enforce membership check in the vote endpoint.
- `permissions.spec.ts › should not expose member details to non-members`
  - Prevent leakage of private group membership data in API responses.
- `permissions.spec.ts › should reject expired or invalid tokens`
  - Redirect users with invalid tokens back to the login flow.
- `permissions.spec.ts › should allow group creator to manage group`
  - Expose management (edit/settings) controls to creators or adjust expectation.

## Form validation

- `form-validation.spec.ts › should reject poll title over maximum length`
  - Enforce a 200-character limit (or chosen value) on poll titles.
- `form-validation.spec.ts › should allow removing added dates`
  - Expose UI controls to remove previously added poll dates.
- `form-validation.spec.ts › should mark invalid fields with aria-invalid`
  - Apply `aria-invalid="true"` on invalid inputs for accessibility.

## Edge cases

- `edge-cases.spec.ts › should handle rapid successive votes`
  - Debounce/tolerate double clicks so the vote state stays consistent.
- `edge-cases.spec.ts › should handle concurrent user voting on same poll`
  - Ensure vote counts remain accurate with concurrent updates.
- `polls.spec.ts › should allow member to create multiple polls in same group`
  - Support more than one active poll per group or clarify the intended limitation.

## Next steps

1. Prioritise which gaps to address first (security/perms and API status suggested).
2. Implement the necessary UX/API changes.
3. Remove the corresponding `test.fixme` calls so the tests rejoin the main suite.
