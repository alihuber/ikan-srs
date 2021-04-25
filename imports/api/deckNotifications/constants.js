import { Mongo } from 'meteor/mongo';
import { gql } from '@apollo/client';

export const DeckNotification = new Mongo.Collection('deckNotifications');

export const DECK_NOTIFICATIONS_QUERY = gql`
  query {
    deckNotifications {
      _id
      dueDate
    }
  }
`;

export const FETCHED_NOTIFICATION_MUTATION = gql`
  mutation markAsFetched($notificationId: String!) {
    markAsFetched(notificationId: $notificationId)
  }
`;
