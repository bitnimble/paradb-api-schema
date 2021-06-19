import { rec, Reify, str } from './serialization';

export type SignupRequest = Reify<typeof serializeSignupRequest>;
export const [serializeSignupRequest, deserializeSignupRequest] = rec('signupRequest', {
  username: str('username'),
  email: str('email'),
  password: str('password'),
});

export type User = Reify<typeof serializeUser>;
export const [serializeUser, deserializeUser] = rec('user', {
  id: str('id'),
  username: str('username'),
  email: str('email'),
});
