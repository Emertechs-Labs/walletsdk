import { userService } from '../userService';

// Mock Firebase
jest.mock('../../lib/firebase', () => ({
  getFirestoreDb: jest.fn(() => ({}))
}));

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize correctly', () => {
    expect(userService).toBeDefined();
  });
});