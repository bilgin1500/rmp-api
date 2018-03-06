// Import globals
import cors from 'cors';
import express from 'express';
import moment from 'moment';
import favicon from 'serve-favicon';
import bodyParser from 'body-parser';
import cookieSession from 'cookie-session';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import { makeExecutableSchema } from 'graphql-tools';

// Import locals
import config from 'config';
import Schema from 'gql/schema';
import Resolvers from 'gql/resolvers';
import { Artist, Album, Track, Account } from 'db/models';

// Starters
const PORT = config.port;
const app = express();

// Session
const session = cookieSession({
  name: config.cookie.name,
  secret: config.cookie.secret,
  cookie: {
    secure: true,
    httpOnly: true,
    domain: config.domain + ':' + config.port,
    expires: moment().add(30, 'm')
  }
});

// Graphql schema definition
const schema = makeExecutableSchema({
  typeDefs: Schema,
  resolvers: Resolvers
});

// Graphql server
const gqlServer = graphqlExpress(req => {
  const query = req.query.query || req.body.query;

  if (query && query.length > 2000) {
    throw new Error('Query too large.');
  }

  const Session = req.session;

  return {
    debug: true,
    schema,
    context: { Session, Artist, Album, Track, Account }
  };
});

// Graphiql interface
const graphi = graphiqlExpress({
  endpointURL: config.gqlServerPath
});

// Generic error handling
const handleErrors = (err, req, res, next) => {
  if (err.status == 404) {
    next(err);
  }
  res.send(err);
};

// 404
const handleNotFounds = (req, res) => {
  res.send(config.msg.notFound);
};

// Home
const homePage = (req, res) => {
  res.send(config.msg.welcome);
};

app.use(session);
app.use(favicon('dist/favicon.ico'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(config.gqlServerPath, gqlServer);
app.use(config.graphiqlPath, graphi);
app.get('/', homePage);
app.use(handleErrors);
app.use(handleNotFounds);
app.listen(PORT);
