/* globals cordova */
/* eslint-disable react/no-unused-state,indent */
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
import 'react-toastify/dist/ReactToastify.min.css';
import 'uniforms-bridge-simple-schema-2';
import './react-transitions.css';
import addMinutes from 'date-fns/addMinutes';
import Root from '../ui/Root';

import {
  DECK_NOTIFICATIONS_QUERY,
  FETCHED_NOTIFICATION_MUTATION,
} from '../../api/deckNotifications/constants';

const graphqlUri =
  process.env.NODE_ENV === 'development'
    ? 'http://192.168.0.11:3000/graphql'
    : `${Meteor.absoluteUrl()}graphql`;
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

const fetchBackgroundTask = async () => {
  const { data: notificationsData } = await client.query({
    query: DECK_NOTIFICATIONS_QUERY,
  });
  if (notificationsData && notificationsData.deckNotifications) {
    notificationsData.deckNotifications.forEach((not) => {
      let notDate = not.dueDate;
      if (not.dueDate < new Date()) {
        notDate = addMinutes(new Date(), 2);
      }
      cordova.plugins.notification.local.schedule({
        title: 'Deck to learn!',
        text: 'You have due cards...',
        trigger: { at: new Date(notDate) },
      });
      client.mutate({
        mutation: FETCHED_NOTIFICATION_MUTATION,
        variables: { notificationId: not._id },
      });
    });
  }
};

Meteor.startup(() => {
  if (Meteor.isCordova) {
    const BackgroundFetch = window.BackgroundFetch;
    BackgroundFetch.configure(
      {
        minimumFetchInterval: 15,
      },
      async (taskId) => {
        console.log('[BackgroundFetch] taskId: ', taskId);
        switch (taskId) {
          case 'com.transistorsoft.fetchNotifications':
            console.log('Received fetchNotifications task');
            await fetchBackgroundTask();
            break;
          default:
            console.log('Default fetch task');
        }
        // Finish, providing received taskId.
        BackgroundFetch.finish(taskId);
      },
      (taskId) => {
        console.log('[BackgroundFetch] TIMEOUT taskId: ', taskId);
        BackgroundFetch.finish(taskId);
      }
    );

    BackgroundFetch.scheduleTask({
      taskId: 'com.transistorsoft.fetchNotifications',
      forceAlarmManager: true,
      delay: 5000,
      periodic: true,
    });
  }
});
