# GlowUp Firestore Security Specification

## 1. Data Invariants
- All user account, skin profile, routine, journal, and demonstration analysis documents live strictly under `/users/{userId}` and are accessible ONLY when `request.auth != null`, `request.auth.uid == userId`, and `request.auth.token.email_verified == true`.
- Every document containing an ownership key (`uid` or `ownerId`) must equal `request.auth.uid` on create and remain immutable on update.
- All `createdAt` / `savedAt` / `updatedAt` timestamps must equal `request.time`.
- Every string and array field is strictly bounded in size to prevent resource exhaustion attacks.
- Ghost/shadow fields are rejected via `keys().hasOnly(...)` and `affectedKeys().hasOnly(...)`.

## 2. Adversarial Payloads ("Dirty Dozen")
1. Unauthenticated read of `/users/userA` -> `PERMISSION_DENIED`
2. Unverified email user writing `/users/userA/beauty/skinProfile` -> `PERMISSION_DENIED`
3. Authenticated User B reading User A's `/users/userA/journal/j1` -> `PERMISSION_DENIED`
4. User A attempting to create `/users/userA/journal/j1` with `ownerId: "userB"` -> `PERMISSION_DENIED`
5. User A attempting to inject shadow field `isAdmin: true` into `/users/userA` -> `PERMISSION_DENIED`
6. User A attempting to mutate immutable `createdAt` or `uid` on update -> `PERMISSION_DENIED`
7. User A attempting to forge client timestamp `updatedAt` != `request.time` -> `PERMISSION_DENIED`
8. User A attempting to list `/users` root collection -> `PERMISSION_DENIED`
9. User A submitting oversized `note` (> 1500 chars) in `/users/userA/journal/j1` -> `PERMISSION_DENIED`
10. User A submitting invalid `skinType: "invalid-type"` -> `PERMISSION_DENIED`
11. User A submitting out-of-range `hydrationRating: 99` -> `PERMISSION_DENIED`
12. User A using oversized/invalid document ID (`../bad` or >128 chars) -> `PERMISSION_DENIED`
