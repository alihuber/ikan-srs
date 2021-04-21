/* eslint-disable react/no-unused-state */
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import {
  ApolloClient,
  createHttpLink,
  ApolloProvider,
  InMemoryCache,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import React from 'react';
import { render } from 'react-dom';
import 'semantic-ui-css/components/icon.min.css';
import 'semantic-ui-css/semantic.min.css';
import Root from '../ui/Root';
import 'react-toastify/dist/ReactToastify.min.css';
import 'uniforms-bridge-simple-schema-2';
import './react-transitions.css';

const graphqlUri =
  process.env.NODE_ENV === 'development'
    ? 'http://192.168.0.11:3000/graphql'
    : 'http://ikansrs.herokuapp.com/graphql';
const httpLink = createHttpLink({
  uri: graphqlUri,
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      authorization: Accounts._storedLoginToken(),
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

const ApolloApp = () => {
  return (
    <ApolloProvider client={client}>
      <Root />
    </ApolloProvider>
  );
};

Meteor.startup(() => {
  render(<ApolloApp />, document.getElementById('render-target'));
});

Accounts.onLogout(function () {
  return client.resetStore(); // make all active queries re-run when the log-out process completed
});

Accounts.onLogin(function () {
  return client.resetStore(); // make all active queries re-run when the log-in process completed
});
