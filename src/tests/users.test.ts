import * as bson from 'bson';
import { deserializeUser, serializeUser, User } from '../users';

describe('users', () => {
  it('can serialize a user', () => {
    const deps = {
      bson,
      buffer: Buffer,
    };
    const user: User = {
      id: 'UAAAAAA1',
      username: 'alice',
      email: 'alice@example.com',
    };
    const serialized = serializeUser(deps, user);
    const deserialized = deserializeUser(deps, serialized);
    expect(deserialized).toEqual(user);
  });
});
