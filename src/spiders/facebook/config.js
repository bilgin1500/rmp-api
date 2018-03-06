export default {
  appId: '1551214395182968',
  appSecret: 'cea52e4834f60f1988f0de5627bb3b6d',
  fields_basic: ['id', 'name'],
  fields_page: [
    'about',
    'link',
    'category',
    'username',
    'description',
    'fan_count',
    'picture.type(large){url}'
  ],
  fields_events: [
    'id',
    'name',
    'description',
    'start_time',
    'end_time',
    'ticket_uri',
    'place'
  ],
  fields_photos: ['name', 'picture', 'album'],
  fields_place: [
    'phone',
    'place_type',
    'were_here_count',
    'hours',
    'food_styles',
    'parking',
    'overall_star_rating'
  ]
};
