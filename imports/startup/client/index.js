import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import React, { setGlobal } from 'reactn';
import { render } from 'react-dom';
import Root from '../ui/components/Root';
import 'react-toastify/dist/ReactToastify.min.css';

setGlobal({
  loadig: false,
});

const client = new ApolloClient({
  uri: '/graphql',
  request: operation => operation.setContext(() => ({
    headers: {
      authorization: Accounts._storedLoginToken(),
    },
  })),
});

const ApolloApp = () => (
  <ApolloProvider client={client}>
    <Root />
  </ApolloProvider>
);

Meteor.startup(() => {
  render(<ApolloApp />, document.getElementById('render-target'));
});

Accounts.onLogout(function () {
  return client.resetStore(); // make all active queries re-run when the log-out process completed
});

Accounts.onLogin(function () {
  return client.resetStore(); // make all active queries re-run when the log-in process completed
});
