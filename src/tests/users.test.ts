import * as packer from 'msgpackr';
import { deserializeUser, serializeUser, User } from '../users';

describe('users', () => {
  it('can serialize a user', () => {
    const deps = {
      packer,
    };
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
