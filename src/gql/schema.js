export default `
  scalar Date

  input SearchQuery {
    isSelected: Int
  }

  type Pagination {
    page: Int
    pageSize: Int
    rowCount: Int
    pageCount: Int
  }

  type Artist {
    id: ID
    name: String
    albums: [Album]
    accounts: [Account]
    events: [Event]
    medium: [Media]
    tags: [Tag]
    created_at: Date
    created_by: String
    updated_at: Date
    updated_by: String
    is_selected: Boolean
  }

  type Album {
    id: ID
    name: String
    release_date: String
    artist: Artist
    accounts: [Account]
    medium: [Media]
    tags: [Tag]
    tracks: [Track]
    created_at: Date
    created_by: String
    updated_at: Date
    updated_by: String
    artist_id: Int
    is_selected: Boolean
  }

  type ArtistPage {
    pageInfo: Pagination!,
    artists: [Artist]
  }

  type Account {
    id: ID
    name: String
    uuid: String
    username: String
    url: String
    created_at: Date
    created_by: String
    updated_at: Date
    updated_by: String
    ref_id: Int
    ref_type: String
  }

  type Track {
    id: ID
    name: String
    disc_num: Int
    track_num: Int
    accounts: [Account]
    medium: [Media]
    created_at: Date
    created_by: String
    updated_at: Date
    updated_by: String
    album_id: Int
    is_selected: Boolean
  }

  type Event {
    id: ID
    name: String
    description: String
    start_time: Date
    end_time: Date
    ticket_url: String
    accounts: [Account]
    artist: Artist
    place: Place
    created_at: Date
    created_by: String
    updated_at: Date
    updated_by: String
    place_id: Int
    is_selected: Boolean
  }

  type Media {
    id: ID
    type: String
    category: String
    text: String
    duration: String
    url: String
    created_at: Date
    created_by: String
    updated_at: Date
    updated_by: String
    ref_id: Int
    ref_type: String
    is_selected: Boolean
  }

  type Place {
    id: ID
    name: String
    city: String
    country: String
    street: String
    zip: String
    latitude: Float
    longitude: Float
    phone: String
    accounts: [Account]
    created_at: Date
    created_by: String
    updated_at: Date
    updated_by: String
    is_selected: Boolean
  }

  type Tag {
    id: ID
    name: String
    created_at: Date
    created_by: String
    updated_at: Date
    updated_by: String
  }

  # Account search result
  type AccountSearchResult {
    id: ID
    name: String
    url: String
    image: String
    detail: String
    tags: [Tag]
  }

  # Account get result
  type AccountGetResult {
    artist: Artist
    album: Album
    track: Track
    event: Event
    place: Place
  }

  # A Facebook node with all possible fields
  type FacebookNode {
    id: ID
    name: String
    about: String
    link: String
    username: String
    category: String
    description: String
    fan_count: Int
    profile_picture: String
    events: [Event]
  }

  type Query {
    
    # Artist query by ID
    ArtistById(
      id: ID!
      columns: [String]
      withRelated: [String]
    ): Artist
    
    # Paged artist query
    ArtistsPaged(
      query: SearchQuery,
      order: String,
      sort: String,
      page: Int,
      pageSize: Int,
      columns: [String]
      withRelated: [String]
    ): ArtistPage

    # Searches accounts and returns the results
    SearchAccounts(
      account: String!
      keyword: String!
      type: String!
    ): [AccountSearchResult]

    # Get content of an account by UUID and returns the results
    GetAccountContent(
      account: String!
      uuid: ID!
      type: String!
    ): AccountGetResult
    
    # Diffs the account content with our content 
    DiffContents(
      account: String!
      uuid: ID!
      id: ID!
      type: String!
    ): AccountGetResult

  }

  type Mutation {

    ArtistCreate(
      name: String!
      created_at: Date
      created_by: String
      is_selected: Boolean
    ): Artist

    ArtistUpdate(
      id: ID!
      name: String!
      updated_at: Date
      updated_by: String
      is_selected: Boolean
    ): Artist

    AlbumCreate(
      name: String!
      release_date: String
      created_at: Date
      created_by: String
      artist_id: Int!
      is_selected: Boolean
    ): Album

    AlbumUpdate(
      id: ID!
      name: String
      release_date: String
      updated_at: Date
      updated_by: String
      artist_id: Int
      is_selected: Boolean
    ): Album

    AlbumDelete(
      id: ID!
    ): Album

    AccountCreate(
      name: String!
      uuid: String!
      created_at: Date
      created_by: String
      ref_id: Int!
      ref_type: String!
    ): Account

    AccountUpdate(
      id: ID!
      name: String
      uuid: String
      updated_at: Date
      updated_by: String
      ref_id: Int
      ref_type: String
    ): Account

    AccountDelete(
      id: ID!
    ): Account

    TrackCreate(
      name: String!
      track_num: Int!
      created_at: Date
      created_by: String
      album_id: Int!
      is_selected: Boolean
    ): Track

    TrackUpdate(
      id: ID!
      name: String
      track_num: Int
      updated_at: Date
      updated_by: String
      album_id: Int
      is_selected: Boolean
    ): Track

    TrackDelete(
      id: ID!
    ): Track

  }

  schema {
    query: Query
    mutation: Mutation
  }
  
`;
