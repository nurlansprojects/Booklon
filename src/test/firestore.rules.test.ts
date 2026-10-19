/**
 * Test runner asserting the "Dirty Dozen" security invariants from security_spec.md
 */

export interface DirtyDozenTestCase {
  id: string;
  description: string;
  path: string;
  operation: 'create' | 'get' | 'list' | 'update' | 'delete';
  payload: any;
  userAuth: { uid: string; email?: string } | null;
  expectedResult: 'PERMISSION_DENIED' | 'ALLOWED';
}

export const dirtyDozenTests: DirtyDozenTestCase[] = [
  {
    id: 'DD-1',
    description: 'Spoofed User Registration for victim uid',
    path: 'users/victim-uid-123',
    operation: 'create',
    payload: { id: 'victim-uid-123', email: 'victim@example.com', displayName: 'Attacker', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    userAuth: { uid: 'attacker-uid' },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 'DD-2',
    description: 'Library Item Hijack for foreign user',
    path: 'library/lib-123',
    operation: 'create',
    payload: { id: 'lib-123', userId: 'victim-uid-123', bookId: 'b-1', title: 'Hacked', status: 'finished', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    userAuth: { uid: 'attacker-uid' },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 'DD-3',
    description: 'List Foreign Library',
    path: 'library',
    operation: 'list',
    payload: null,
    userAuth: { uid: 'attacker-uid' },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 'DD-4',
    description: 'Denial of Wallet with 50KB title',
    path: 'library/lib-456',
    operation: 'create',
    payload: { id: 'lib-456', userId: 'attacker-uid', bookId: 'b-2', title: 'x'.repeat(50000), status: 'finished', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    userAuth: { uid: 'attacker-uid' },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 'DD-5',
    description: 'Delete collection owned by another user',
    path: 'collections/col-789',
    operation: 'delete',
    payload: null,
    userAuth: { uid: 'attacker-uid' },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 'DD-6',
    description: 'Mutate immutable userId on library item',
    path: 'library/lib-123',
    operation: 'update',
    payload: { userId: 'victim-uid' },
    userAuth: { uid: 'attacker-uid' },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 'DD-7',
    description: 'Unauthenticated Read on Profile',
    path: 'users/victim-uid-123',
    operation: 'get',
    payload: null,
    userAuth: null,
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 'DD-8',
    description: 'Invalid enum in library status',
    path: 'library/lib-999',
    operation: 'create',
    payload: { id: 'lib-999', userId: 'attacker-uid', bookId: 'b-3', title: 'Valid', status: 'malicious_status', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    userAuth: { uid: 'attacker-uid' },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 'DD-9',
    description: 'Bookmark forgery for another user',
    path: 'bookmarks/bm-123',
    operation: 'create',
    payload: { id: 'bm-123', userId: 'victim-uid-123', bookId: 'b-1', bookTitle: 'Book', location: 'ch1', createdAt: new Date().toISOString() },
    userAuth: { uid: 'attacker-uid' },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 'DD-10',
    description: 'Reading session invalid data injection',
    path: 'readingSessions/rs-123',
    operation: 'create',
    payload: { id: 'rs-123', userId: 'attacker-uid', bookId: 'b-1', bookTitle: 'Book', durationSeconds: 'invalid-string', createdAt: new Date().toISOString() },
    userAuth: { uid: 'attacker-uid' },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 'DD-11',
    description: 'Malicious path traversal ID poisoning',
    path: 'users/..%2F..%2Fhack',
    operation: 'create',
    payload: {},
    userAuth: { uid: 'attacker-uid' },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 'DD-12',
    description: 'Reading goal mutate immutable createdAt',
    path: 'readingGoals/rg-1',
    operation: 'update',
    payload: { createdAt: '2020-01-01T00:00:00Z' },
    userAuth: { uid: 'attacker-uid' },
    expectedResult: 'PERMISSION_DENIED'
  }
];
