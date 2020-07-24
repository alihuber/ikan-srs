/* eslint-disable react/no-unused-state */
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { ApolloClient, createHttpLink, ApolloProvider, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import React from 'react';
import { render } from 'react-dom';
import Root from '../ui/components/Root';
import 'react-toastify/dist/ReactToastify.min.css';
import 'semantic-ui-css/semantic.min.css';
import 'uniforms-bridge-simple-schema-2';
import './react-transitions.css';
import './service-worker.js';

const httpLink = createHttpLink({
  uri: '/graphql',
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
