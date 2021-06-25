import { apiError, apiSuccess } from './api';
import { extend, list, num, optional, rec, Reify, str, union } from './serialization';

/* Structs */
export type Complexity = Reify<typeof complexity>;
const complexity = rec('complexity', {
  complexity: num('complexity'),
  complexityName: optional(str('complexityName')),
});

export type PDMap = Reify<typeof serializeMap>;
const pdMap = rec('map', {
  id: str('id'),
  title: str('title'),
  artist: str('artist'),
  author: optional(str('author')),
  uploader: str('uploader'),
  albumArt: optional(str('albumArt')),
  complexities: list('complexities', complexity),
  description: optional(str('description')),
  downloadLink: str('downloadLink'),
});
export const [serializeMap, deserializeMap] = pdMap;

/* Get */
export type GetMapRequest = Reify<typeof serializeGetMapRequest>;
export const [serializeGetMapRequest, deserializeGetMapRequest] = rec('getMapRequest', {
  id: str('id'),
});
export type GetMapResponse = Reify<typeof serializeGetMapResponse>;
const getMapSuccess = extend('getMapSuccess', apiSuccess, {
  map: pdMap,
});
export const [serializeGetMapResponse, deserializeGetMapResponse] = union('getMapResponse', 'success', [getMapSuccess, apiError]);

/* Find */
export type FindMapsRequest = Reify<typeof serializeFindMapsRequest>;
export const [serializeFindMapsRequest, deserializeFindMapsRequest] = rec('findMapsRequest', {
  // TODO: filters, search
});
export type FindMapsResponse = Reify<typeof serializeFindMapsResponse>;
const findMapsSuccess = extend('findMapsSuccess', apiSuccess, {
  maps: list('maps', pdMap),
});
export const [serializeFindMapsResponse, deserializeFindMapsResponse] = union('findMapsResponse', 'success', [findMapsSuccess, apiError]);
