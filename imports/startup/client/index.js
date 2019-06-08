/* eslint-disable react/no-unused-state */
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import React from 'react';
import { render } from 'react-dom';
import 'react-toastify/dist/ReactToastify.min.css';
import LoadingContext from '../ui/contexts/LoadingContext';
import Root from '../ui/components/Root';
import 'uniforms-bridge-simple-schema-2';

const client = new ApolloClient({
  uri: '/graphql',
  request: operation => operation.setContext(() => ({
    headers: {
      authorization: Accounts._storedLoginToken(),
    },
  })),
});

class ApolloApp extends React.Component {
  constructor(props) {
    super(props);
    this.setLoading = (value) => {
      this.setState({
        loading: value,
      });
    };

    this.state = {
      loading: false,
      setLoading: this.setLoading,
    };
  }

  render() {
    return (
      <ApolloProvider client={client}>
        <LoadingContext.Provider value={this.state}>
          <Root />
        </LoadingContext.Provider>
      </ApolloProvider>
    );
  }
}

Meteor.startup(() => {
  render(<ApolloApp />, document.getElementById('render-target'));
});

Accounts.onLogout(function () {
  return client.resetStore(); // make all active queries re-run when the log-out process completed
});

Accounts.onLogin(function () {
  return client.resetStore(); // make all active queries re-run when the log-in process completed
});
