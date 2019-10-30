/* eslint-disable react/no-unused-state */
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import React from 'react';
import { render } from 'react-dom';
import 'react-toastify/dist/ReactToastify.min.css';
import Root from '../ui/components/Root';
import 'semantic-ui-css/semantic.min.css';
import 'uniforms-bridge-simple-schema-2';
import './react-transitions.css';

const client = new ApolloClient({
  uri: '/graphql',
  request: (operation) => operation.setContext(() => ({
    headers: {
      authorization: Accounts._storedLoginToken(),
    },
  })),
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
