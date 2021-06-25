import { apiError, apiSuccess } from './api';
import { extend, optional, rec, Reify, str, union } from './serialization';

export type SignupRequest = Reify<typeof serializeSignupRequest>;
export const [serializeSignupRequest, deserializeSignupRequest] = rec('signupRequest', {
  username: str('username'),
  email: str('email'),
  password: str('password'),
});

export type SignupError = Reify<typeof signupError>;
export const signupError = extend('signupError', apiError, {
  username: optional(str('username')),
  email: optional(str('email')),
  password: optional(str('password')),
});
export type SignupResponse = Reify<typeof serializeSignupResponse>;
export const [serializeSignupResponse, deserializeSignupResponse] = union('signupResponse', 'success', [apiSuccess, signupError]);

export type User = Reify<typeof serializeUser>;
export const [serializeUser, deserializeUser] = rec('user', {
  id: str('id'),
  username: str('username'),
  email: str('email'),
});
