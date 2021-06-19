import { serializeSignupRequest } from '../users';

describe('users', () => {
  it('can serialize a user', () => {
    expect(serializeSignupRequest({
      username: 'alice',
      email: 'alice@example.com',
      password: '12345678',
    })).toEqual('{"username":"alice","email":"alice@example.com","password":"12345678"}');
  });
});
