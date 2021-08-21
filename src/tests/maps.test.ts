import { deserializeMap, PDMap, serializeMap } from '../maps';

describe('maps', () => {
  it('can serialize a map', () => {
    const map: PDMap = {
      id: '1',
      submissionDate: '2021-06-01T00:00:00',
      title: 'All Star',
      artist: 'Smash Mouth',
      author: 'Alice',
      uploader: 'Alice',
      albumArt: undefined,
      complexities: [
        { complexity: 1, complexityName: 'Easy' },
        { complexity: 5, complexityName: 'Hard' },
      ],
      description: 'Best song ever',
    };
    const serialized = serializeMap(map);
    const deserialized = deserializeMap(serialized);
    expect(deserialized).toEqual(map);
  });
});
