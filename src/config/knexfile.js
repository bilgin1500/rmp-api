export default {
  development: {
    client: 'mysql',
    connection: {
      host: '127.0.0.1',
      port: 3306,
      user: 'rmp',
      password: 'rmp',
      database: 'rmp'
    },
    useNullAsDefault: true
  },
  test: {},
  production: {}
};
