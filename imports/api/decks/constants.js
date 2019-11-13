import { Mongo } from 'meteor/mongo';
import gql from 'graphql-tag';

export const Decks = new Mongo.Collection('decks');

export const DECKS_QUERY = gql`
  query {
    decks {
      _id
      userId
      name
      createdAt
      cards {
        front
        back
        state
        easeFactor
        currentInterval
        dueDate
      }
    }
  }
`;

export const CREATE_DECK_MUTATION = gql`
  mutation createDeck($name: String!) {
    createDeck(name: $name) {
      _id
      name
      userId
      createdAt
      cards {
        front
        back
        state
        easeFactor
        currentInterval
        dueDate
      }
    }
  }
`;
