import { arr, num, optional, rec, Reify, str } from './serialization';

export type Complexity = Reify<typeof complexity>;
const complexity = rec('complexity', {
  complexity: num('complexity'),
  complexityName: optional(str('complexityName')),
});

export type PDMap = Reify<typeof serializeMap>;
export const [serializeMap, deserializeMap] = rec('map', {
  id: str('id'),
  title: str('title'),
  artist: str('artist'),
  author: str('author'),
  uploader: str('uploader'),
  albumArt: optional(str('albumArt')),
  complexities: arr('complexities', complexity),
  description: optional(str('description')),
  downloadLink: str('downloadLink'),
});
