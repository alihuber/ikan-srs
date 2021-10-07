/* globals cordova */
/* eslint-disable react/no-unused-state,indent */
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import {
  InMemoryCache,
  ApolloProvider,
  ApolloClient,
  ApolloLink,
} from '@apollo/client';
import { MeteorAccountsLink } from 'meteor/apollo';
import { BatchHttpLink } from '@apollo/client/link/batch-http';
import React from 'react';
import { render } from 'react-dom';
import 'semantic-ui-css/components/icon.min.css';
import 'semantic-ui-css/semantic.min.css';
import 'react-toastify/dist/ReactToastify.min.css';
import 'uniforms-bridge-simple-schema-2';
import './react-transitions.css';
import addMinutes from 'date-fns/addMinutes';
import Root from '../ui/Root';

const graphqlUri =
  process.env.NODE_ENV === 'development'
    ? 'http://192.168.0.13:3000/graphql'
    : `${Meteor.absoluteUrl()}graphql`;

const link = ApolloLink.from([
  MeteorAccountsLink(),
  new BatchHttpLink({
    uri: graphqlUri,
  }),
]);

const cache = new InMemoryCache().restore(window.__APOLLO_STATE__);
const client = new ApolloClient({
  uri: graphqlUri,
  cache,
  link,
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

export const scheduleNotificationForDeck = (dueDate) => {
  cordova.plugins.notification.local.schedule({
    title: 'Deck to learn!',
    text: 'You have due cards...',
    trigger: { at: new Date(dueDate) },
  });
};

export const scheduleNotificationForCard = () => {
  const date = addMinutes(new Date(), 15);
  cordova.plugins.notification.local.schedule({
    title: 'Card to learn!',
    text: 'You have due cards...',
    trigger: { at: date },
  });
};
