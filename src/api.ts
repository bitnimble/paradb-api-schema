import { bool, num, rec, Reify, str, union } from './serialization';

export type ApiSuccess = Reify<typeof apiSuccess>;
export const apiSuccess = rec('apiSuccess', {
  success: bool('success', true),
});

export type ApiError = Reify<typeof serializeApiError>;
export const apiError = rec('apiError', {
  success: bool('success', false),
  statusCode: num('statusCode'),
  errorMessage: str('errorMessage'),
});
export const [serializeApiError, deserializeApiError] = apiError;

export const apiResponse = union('apiResponse', 'success', [apiSuccess, apiError]);
