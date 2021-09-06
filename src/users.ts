import { apiError, apiSuccess } from './api';
import { extend, optional, rec, Reify, str, union } from 'schema-bob';

/* Structs */
export type User = Reify<typeof serializeUser>;
const user = rec('user', {
  id: str('id'),
  username: str('username'),
  email: str('email'),
});
export const {
  serialize: serializeUser,
  deserialize: deserializeUser,
} = user;

export type GetUserResponse = Reify<typeof serializeGetUserResponse>;
export const getUserSuccess = extend('getUserSuccess', apiSuccess, {
  user,
});
export const {
  serialize: serializeGetUserResponse,
  deserialize: deserializeGetUserResponse,
} = union(
    'getUserResponse',
    'success',
    [getUserSuccess, apiError],
);

export type UserSession = Reify<typeof serializeUserSession>;
export const {
  serialize: serializeUserSession,
  deserialize: deserializeUserSession,
} = rec('userSession', {
  id: str('id'),
  username: str('username'),
  accountStatus: str('accountStatus'),
  email: str('email'),
});

/* Login */
export type LoginRequest = Reify<typeof serializeLoginRequest>;
export const {
  serialize: serializeLoginRequest,
  deserialize: deserializeLoginRequest,
} = rec('loginRequest', {
  username: str('username'),
  password: str('password'),
});
export type LoginError = Reify<typeof loginError>;
const loginError = extend('loginError', apiError, {});
export type LoginResponse = Reify<typeof serializeLoginResponse>;
export const {
  serialize: serializeLoginResponse,
  deserialize: deserializeLoginResponse,
} = union(
    'loginResponse',
    'success',
    [apiSuccess, loginError],
);

/* Signup */
export type SignupRequest = Reify<typeof serializeSignupRequest>;
export const {
  serialize: serializeSignupRequest,
  deserialize: deserializeSignupRequest,
} = rec('signupRequest', {
  username: str('username'),
  email: str('email'),
  password: str('password'),
});
export type SignupError = Reify<typeof signupError>;
const signupError = extend('signupError', apiError, {
  username: optional(str('username')),
  email: optional(str('email')),
  password: optional(str('password')),
});
export type SignupResponse = Reify<typeof serializeSignupResponse>;
export const {
  serialize: serializeSignupResponse,
  deserialize: deserializeSignupResponse,
} = union(
    'signupResponse',
    'success',
    [apiSuccess, signupError],
);
