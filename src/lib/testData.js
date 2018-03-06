const test_db_artist = {
  name: 'Hedonutopia',
  tags: ['dance', 'rock-n-roll', 'brit'],
  albums: [],
  accounts: [
    {
      id: 43,
      name: 'Bandcamp',
      uuid: '446202473',
      created_at: '2017-06-29T19:37:42.000Z',
      created_by: 'admin',
      updated_at: '2017-06-29T19:37:42.000Z',
      updated_by: null,
      ref_type: 'artists',
      ref_id: 5
    },
    {
      id: 44,
      name: 'Facebook',
      uuid: '156240887784405',
      created_at: '2017-06-29T19:37:50.000Z',
      created_by: 'admin',
      updated_at: '2017-06-29T19:37:50.000Z',
      updated_by: null,
      ref_type: 'artists',
      ref_id: 5
    },
    {
      id: 45,
      name: 'Soundcloud',
      uuid: '6287557',
      created_at: '2017-06-29T19:38:04.000Z',
      created_by: 'admin',
      updated_at: '2017-06-29T19:38:04.000Z',
      updated_by: null,
      ref_type: 'artists',
      ref_id: 5
    },
    {
      id: 46,
      name: 'Spotify',
      uuid: '1NyTJce3BbQslEhW8uWPc5',
      created_at: '2017-06-29T19:38:10.000Z',
      created_by: 'admin',
      updated_at: '2017-06-29T19:38:10.000Z',
      updated_by: null,
      ref_type: 'artists',
      ref_id: 5
    }
  ]
};
/*
normalde artist: {} ile başlıyor ama bu aşamasa bunu çıkarıyorum ki
diff.js içerisinde tekrar çıkarmak ile uğraşmayalım. Asıl mesele
gerçek data'yı gönderirken bunu düzeltmek.
 */
const test_new_artist = {
  name: 'Hedonutopia',
  tags: ['dance', 'rock'],
  accounts: [
    {
      name: 'Spotify',
      uuid: '1NyTJce3BbQslEhW8uWPc5',
      ref_type: 'artists'
    }
  ],
  albums: [
    {
      name: 'Ucube Dizayn',
      release_date: '2016-12-02',
      accounts: [
        {
          name: 'Spotify',
          uuid: '5zVLqbqdIKXXXsqYrCrYGn',
          ref_type: 'albums'
        }
      ],
      medium: [
        {
          type: 'text',
          category: 'label',
          text: 'Dokuz Sekiz M\u00fczik',
          ref_type: 'albums'
        },
        {
          type: 'image',
          category: 'album_cover',
          url:
            'https://i.scdn.co/image/1db4b69a50f5e8efd4eadaca926111272854001b',
          ref_type: 'albums'
        }
      ],
      tags: [],
      tracks: [
        {
          name: 'Lasido',
          disc_num: 1,
          track_num: 1,
          accounts: [
            {
              name: 'Spotify',
              uuid: '2FoJvypM1BCxryOt3zz4b5',
              ref_type: 'tracks'
            }
          ],
          medium: [
            {
              url:
                'https://p.scdn.co/mp3-preview/4e97a70e1a746be9a07a4acf37110a1ee4acda50?cid=dda596e92bd043ad8b6e7b70347e2fa3',
              type: 'audio',
              category: 'track',
              duration: 437034,
              ref_type: 'tracks'
            }
          ]
        },
        {
          name: 'Japon Orman',
          disc_num: 1,
          track_num: 2,
          accounts: [
            {
              name: 'Spotify',
              uuid: '7GiAdAJNp2VYxb3wwCyVYa',
              ref_type: 'tracks'
            }
          ],
          medium: [
            {
              url:
                'https://p.scdn.co/mp3-preview/15ccc44e273fdeb6d012178201ad94ada60d29a0?cid=dda596e92bd043ad8b6e7b70347e2fa3',
              type: 'audio',
              category: 'track',
              duration: 259653,
              ref_type: 'tracks'
            }
          ]
        },
        {
          name: 'Maymun Kral',
          disc_num: 1,
          track_num: 3,
          accounts: [
            {
              name: 'Spotify',
              uuid: '5baGVEU08dMZxH2j4WU59I',
              ref_type: 'tracks'
            }
          ],
          medium: [
            {
              url:
                'https://p.scdn.co/mp3-preview/95148a9067f264943c477b0aae883de49d16c575?cid=dda596e92bd043ad8b6e7b70347e2fa3',
              type: 'audio',
              category: 'track',
              duration: 288400,
              ref_type: 'tracks'
            }
          ]
        },
        {
          name: 'Eridin Amma',
          disc_num: 1,
          track_num: 4,
          accounts: [
            {
              name: 'Spotify',
              uuid: '4i9j2DDRDKqHBH46DIlfiE',
              ref_type: 'tracks'
            }
          ],
          medium: [
            {
              url:
                'https://p.scdn.co/mp3-preview/0dd2b99c6b86f9a67565a0f62dd892d398ff8197?cid=dda596e92bd043ad8b6e7b70347e2fa3',
              type: 'audio',
              category: 'track',
              duration: 217514,
              ref_type: 'tracks'
            }
          ]
        },
        {
          name: 'Blonde',
          disc_num: 1,
          track_num: 5,
          accounts: [
            {
              name: 'Spotify',
              uuid: '1uiWjuQz8QF4QBlVmeFHMJ',
              ref_type: 'tracks'
            }
          ],
          medium: [
            {
              url:
                'https://p.scdn.co/mp3-preview/183f5602c9c857d6e0cc3b5f317d061085b74ee6?cid=dda596e92bd043ad8b6e7b70347e2fa3',
              type: 'audio',
              category: 'track',
              duration: 294826,
              ref_type: 'tracks'
            }
          ]
        },
        {
          name: 'Mayalar',
          disc_num: 1,
          track_num: 6,
          accounts: [
            {
              name: 'Spotify',
              uuid: '4aXk0SA8FNXpwNuIObTGxt',
              ref_type: 'tracks'
            }
          ],
          medium: [
            {
              url:
                'https://p.scdn.co/mp3-preview/ebede756487d700991cf5fd467dcf45aaaf20497?cid=dda596e92bd043ad8b6e7b70347e2fa3',
              type: 'audio',
              category: 'track',
              duration: 419840,
              ref_type: 'tracks'
            }
          ]
        },
        {
          name: 'Sar',
          disc_num: 1,
          track_num: 7,
          accounts: [
            {
              name: 'Spotify',
              uuid: '6ENN6pxSbR3WeQaNj3wn36',
              ref_type: 'tracks'
            }
          ],
          medium: [
            {
              url:
                'https://p.scdn.co/mp3-preview/0e37b23a045cf35a472c7fa371d02e60b2663a29?cid=dda596e92bd043ad8b6e7b70347e2fa3',
              type: 'audio',
              category: 'track',
              duration: 494165,
              ref_type: 'tracks'
            }
          ]
        }
      ]
    }
  ]
};

export { test_db_artist, test_new_artist };
