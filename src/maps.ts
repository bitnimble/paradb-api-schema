import { extend, list, num, optional, rec, Reify, str, u8array, union } from 'schema-bob';
import { apiError, apiSuccess } from './api';

/* Structs */
export type Difficulty = Reify<typeof difficulty>;
const difficulty = rec('difficulty', {
  difficulty: optional(num('difficulty')),
  // Difficulty name is temporarily `optional` while we perform the migration and rescan all rlrr's.
  difficultyName: optional(str('difficultyName')),
});

export type PDMap = Reify<typeof serializeMap>;
export const pdMap = rec('map', {
  id: str('id'),
  submissionDate: str('submissionDate'),
  title: str('title'),
  artist: str('artist'),
  author: optional(str('author')),
  uploader: str('uploader'),
  albumArt: optional(str('albumArt')),
  // complexity is temporarily `optional` while we perform the migration and rescan all rlrr's.
  complexity: optional(num('complexity')),
  difficulties: list('difficulties', difficulty),
  description: optional(str('description')),
  favorites: num('favorites'),
});
export const {
  serialize: serializeMap,
  deserialize: deserializeMap,
} = pdMap;

/* GET getMap */
export type GetMapResponse = Reify<typeof serializeGetMapResponse>;
const getMapSuccess = extend('getMapSuccess', apiSuccess, {
  map: pdMap,
});
export const {
  serialize: serializeGetMapResponse,
  deserialize: deserializeGetMapResponse,
} = union(
  'getMapResponse',
  'success',
  [getMapSuccess, apiError],
);

/* GET deleteMap */
export type DeleteMapResponse = Reify<typeof serializeDeleteMapResponse>;
const deleteMapSuccess = extend('deleteMapSuccess', apiSuccess, {});
export const {
  serialize: serializeDeleteMapResponse,
  deserialize: deserializeDeleteMapResponse,
} = union(
  'deleteMapResponse',
  'success',
  [deleteMapSuccess, apiError],
);

/* GET findMaps */
export type FindMapsResponse = Reify<typeof serializeFindMapsResponse>;
const findMapsSuccess = extend('findMapsSuccess', apiSuccess, {
  maps: list('maps', pdMap),
});
export const {
  serialize: serializeFindMapsResponse,
  deserialize: deserializeFindMapsResponse,
} = union(
  'findMapsResponse',
  'success',
  [findMapsSuccess, apiError],
);

/* POST submitMap */
export type SubmitMapRequest = Reify<typeof serializeSubmitMapRequest>;
export const {
  serialize: serializeSubmitMapRequest,
  deserialize: deserializeSubmitMapRequest,
} = rec('submitMapRequest', {
  mapData: u8array('mapData'),
});

export type SubmitMapSuccess = Reify<typeof submitMapSuccess>;
const submitMapSuccess = extend('submitMapSuccess', apiSuccess, {
  id: str('id'),
});

const submitMapError = extend('submitMapError', apiError, {});
export const {
  serialize: serializeSubmitMapError,
  deserialize: deserializeSubmitMapError,
} = submitMapError;
export type SubmitMapResponse = Reify<typeof serializeSubmitMapResponse>;
export const {
  serialize: serializeSubmitMapResponse,
  deserialize: deserializeSubmitMapResponse,
} = union(
  'submitMapResponse',
  'success',
  [submitMapSuccess, submitMapError],
);
