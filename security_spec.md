# Security Specification for Booklon

## 1. Data Invariants
1. **User Identity Invariant**: A user can only read, create, and modify their own `/users/{userId}` document where `userId == request.auth.uid`. No user can tamper with another user's profile or preferences.
2. **Library Ownership Invariant**: Library entries in `/library/{libraryId}` must have `userId == request.auth.uid`. A user can only list, get, create, update, or delete their own library items.
3. **Collection Ownership Invariant**: Collections in `/collections/{collectionId}` must have `userId == request.auth.uid`. Users cannot read or manipulate another user's collections.
4. **Bookmark & Note Invariant**: Bookmarks and Notes must belong strictly to `request.auth.uid` (`userId == request.auth.uid`). Users can only access and modify their own notes and bookmarks.
5. **Reading Goals & Sessions Invariant**: Reading goals and sessions must have `userId == request.auth.uid` and can only be modified/deleted by the creator.
6. **No Blanket Reads**: All listing rules mandate relational filtering (`resource.data.userId == request.auth.uid`), preventing any query scraping.
7. **Size & Type Hardening**: All string fields have bounded `.size()` checks. IDs match `^[a-zA-Z0-9_\-]+$`.
8. **Immutability Invariant**: Key identifier fields (`id`, `userId`, `bookId`, `createdAt`) cannot be mutated on update.

---

## 2. The "Dirty Dozen" Payloads (Adversarial Tests)

1. **Spoofed User Registration**:
   `POST /users/victim-uid-123` with `{ id: "victim-uid-123", email: "victim@example.com", displayName: "Attacker", createdAt: request.time, updatedAt: request.time }` by `attacker-uid`. -> **PERMISSION_DENIED**
2. **Library Item Hijack**:
   `POST /library/lib-123` with `{ userId: "victim-uid-123", bookId: "book-1", title: "Hacked", status: "finished" }` by `attacker-uid`. -> **PERMISSION_DENIED**
3. **List Foreign Library**:
   `GET /library` where `userId == 'victim-uid-123'` by `attacker-uid`. -> **PERMISSION_DENIED**
4. **Overly Long Title (Denial of Wallet)**:
   `POST /library/lib-456` with 50,000 character title. -> **PERMISSION_DENIED**
5. **Collection Theft**:
   `DELETE /collections/col-789` owned by `victim-uid-123` by `attacker-uid`. -> **PERMISSION_DENIED**
6. **Immutable Field Tampering on Library**:
   `UPDATE /library/lib-123` changing `userId` from `attacker-uid` to `victim-uid`. -> **PERMISSION_DENIED**
7. **Unauthenticated Read on Profile**:
   `GET /users/victim-uid-123` without auth token. -> **PERMISSION_DENIED**
8. **Invalid Enum in Status**:
   `POST /library/lib-999` with status `"hacked_status"`. -> **PERMISSION_DENIED**
9. **Bookmark Forgery**:
   `POST /bookmarks/bm-123` with `userId: "victim-uid-123"`. -> **PERMISSION_DENIED**
10. **Reading Session Data Injection**:
    `POST /readingSessions/rs-123` with non-numeric `durationSeconds: "lots"`. -> **PERMISSION_DENIED**
11. **Malicious ID Poisoning**:
    `POST /users/..%2F..%2Fhack` with invalid path characters. -> **PERMISSION_DENIED**
12. **Reading Goal Mutate CreatedAt**:
    `UPDATE /readingGoals/rg-1` attempting to alter `createdAt`. -> **PERMISSION_DENIED**
