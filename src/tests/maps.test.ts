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
      downloadCount: 3,
      albumArt: undefined,
      complexity: 2,
      difficulties: [
        { difficulty: undefined, difficultyName: 'Easy' },
        { difficulty: undefined, difficultyName: 'Hard' },
      ],
      description: 'Best song ever',
      favorites: 5,
      userProjection: undefined,
    };
    const serialized = serializeMap(map);
    const deserialized = deserializeMap(serialized);
    expect(deserialized).toEqual(map);
  });
});
