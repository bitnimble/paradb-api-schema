import { deserializeUser, serializeUser, User } from '../users';

describe('users', () => {
  it('can serialize a user', () => {
    const user: User = {
      id: 'UAAAAAA1',
      username: 'alice',
      email: 'alice@example.com',
    };
    const serialized = serializeUser(user);
    const deserialized = deserializeUser(serialized);
    expect(deserialized).toEqual(user);
  });
});
