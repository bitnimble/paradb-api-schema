import { arr, num, optional, rec, Reify, str } from 'serialization';

export type PDMap = Reify<typeof serializeMap>;
export const [serializeMap, deserializeMap] = rec('map', {
  id: str('id'),
  title: str('title'),
  artist: str('artist'),
  author: str('author'),
  uploader: str('uploader'),
  albumArt: optional(str('albumArt')),
  complexities: arr('complexities', rec('complexity', {
    complexity: num('complexity'),
    complexityName: str('complexityName'),
  })),
  description: optional(str('description')),
  downloadLink: str('downloadLink'),
});
