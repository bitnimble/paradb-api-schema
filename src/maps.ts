import { apiError, apiSuccess } from './api';
import { extend, list, num, optional, rec, Reify, str, u8array, union } from './serialization';

/* Structs */
export type Complexity = Reify<typeof complexity>;
const complexity = rec('complexity', {
  complexity: num('complexity'),
  complexityName: optional(str('complexityName')),
});

export type PDMap = Reify<typeof serializeMap>;
const pdMap = rec('map', {
  id: str('id'),
  submissionDate: str('submissionDate'),
  title: str('title'),
  artist: str('artist'),
  author: optional(str('author')),
  uploader: str('uploader'),
  albumArt: optional(str('albumArt')),
  complexities: list('complexities', complexity),
  description: optional(str('description')),
});
export const [serializeMap, deserializeMap] = pdMap;

/* GET getMap */
export type GetMapResponse = Reify<typeof serializeGetMapResponse>;
const getMapSuccess = extend('getMapSuccess', apiSuccess, {
  map: pdMap,
});
export const [serializeGetMapResponse, deserializeGetMapResponse] = union(
    'getMapResponse',
    'success',
    [getMapSuccess, apiError],
);

/* GET deleteMap */
export type DeleteMapResponse = Reify<typeof serializeDeleteMapResponse>;
const deleteMapSuccess = extend('deleteMapSuccess', apiSuccess, {});
export const [serializeDeleteMapResponse, deserializeDeleteMapResponse] = union(
    'deleteMapResponse',
    'success',
    [deleteMapSuccess, apiError],
);

/* GET findMaps */
export type FindMapsResponse = Reify<typeof serializeFindMapsResponse>;
const findMapsSuccess = extend('findMapsSuccess', apiSuccess, {
  maps: list('maps', pdMap),
});
export const [serializeFindMapsResponse, deserializeFindMapsResponse] = union(
    'findMapsResponse',
    'success',
    [findMapsSuccess, apiError],
);

/* POST submitMap */
export type SubmitMapRequest = Reify<typeof serializeSubmitMapRequest>;
export const [serializeSubmitMapRequest, deserializeSubmitMapRequest] = rec('submitMapRequest', {
  mapData: u8array('mapData'),
});

export type SubmitMapSuccess = Reify<typeof submitMapSuccess>;
const submitMapSuccess = extend('submitMapSuccess', apiSuccess, {
  id: str('id'),
});

const submitMapError = extend('submitMapError', apiError, {});
export const [serializeSubmitMapError, deserializeSubmitMapError] = submitMapError;
export type SubmitMapResponse = Reify<typeof serializeSubmitMapResponse>;
export const [serializeSubmitMapResponse, deserializeSubmitMapResponse] = union(
    'submitMapResponse',
    'success',
    [submitMapSuccess, submitMapError],
);
