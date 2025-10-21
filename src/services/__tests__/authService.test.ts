import { authService } from '../authService';

// Mock Firebase
jest.mock('../../lib/firebase', () => ({
  getFirebaseAuth: jest.fn(() => ({
    currentUser: null,
    onAuthStateChanged: jest.fn((callback) => {
      callback(null);
      return jest.fn();
    })
  }))
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize correctly', () => {
    expect(authService).toBeDefined();
  });

  it('should return null for current user when not authenticated', () => {
    const user = authService.getCurrentUser();
    expect(user).toBeNull();
  });
});