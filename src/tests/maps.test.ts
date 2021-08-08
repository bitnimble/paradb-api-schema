import { deserializeMap, serializeMap } from '../maps';

describe('maps', () => {
  it('can serialize a map', () => {
    expect(serializeMap({
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
    })).toEqual('{"id":"1","submissionDate":"2021-06-01T00:00:00","title":"All Star","artist":"Smash Mouth","author":"Alice","uploader":"Alice","complexities":[{"complexity":1,"complexityName":"Easy"},{"complexity":5,"complexityName":"Hard"}],"description":"Best song ever"}');
  });

  it('can deserialize / validate a map', () => {
    expect(deserializeMap(JSON.parse('{"id":"1","submissionDate":"2021-06-01T00:00:00","title":"All Star","artist":"Smash Mouth","author":"Bob","uploader":"Bob","albumArt":"example.org","complexities":[{"complexity":1,"complexityName":"Easy"},{"complexity":5,"complexityName":"Hard"}],"description":"Best song ever"}'))).toEqual({
      id: '1',
      submissionDate: '2021-06-01T00:00:00',
      title: 'All Star',
      artist: 'Smash Mouth',
      author: 'Bob',
      uploader: 'Bob',
      albumArt: 'example.org',
      complexities: [
        { complexity: 1, complexityName: 'Easy' },
        { complexity: 5, complexityName: 'Hard' },
      ],
      description: 'Best song ever',
    });
  });
});
