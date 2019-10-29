import { Accounts } from 'meteor/accounts-base';
import { ApolloServer } from 'apollo-server-express';
import { WebApp } from 'meteor/webapp';
import { getUser } from 'meteor/apollo';
import merge from 'lodash/merge';
import UserSchema from '../../api/users/User.graphql';
import UserResolver from '../../api/users/resolvers';

const { createLogger, transports, format } = require('winston');

const { combine, timestamp, label, printf } = format;

const loggerFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
  format: combine(label({ label: 'MeteorServer' }), timestamp(), loggerFormat),
  transports: [new transports.Console()],
});

const typeDefs = [UserSchema];

const resolvers = merge(UserResolver);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => ({
    user: await getUser(req.headers.authorization),
  }),
});

server.applyMiddleware({
  app: WebApp.connectHandlers,
  path: '/graphql',
});

WebApp.connectHandlers.use('/graphql', (req, res) => {
  if (req.method === 'GET') {
    res.end();
  }
});

Accounts.onLogin((loginObj) => {
  logger.info({ level: 'info', message: `successful login for user ${loginObj.user.username} with _id ${loginObj.user._id}` });
});

Accounts.onLogout((logoutObj) => {
  logger.info({ level: 'info', message: `successful logout for user ${logoutObj.user.username} with _id ${logoutObj.user._id}` });
});
