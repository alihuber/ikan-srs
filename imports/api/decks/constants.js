import { Mongo } from 'meteor/mongo';
import gql from 'graphql-tag';

export const Decks = new Mongo.Collection('decks');
export const Cards = new Mongo.Collection('cards');

export const DECKS_QUERY = gql`
  query {
    decks {
      _id
      userId
      name
      createdAt
      intervalModifier
      cards
      newCards
      learningCars
      relearningCards
      graduatedCards
      newCardsToday {
        date
        numCards
      }
    }
  }
`;

export const NEXT_CARD_FOR_LEARNING_QUERY = gql`
  query nextCardForLearning($deckId: String!) {
    nextCardForLearning(deckId: $deckId) {
      front
      back
      state
      easeFactor
      currentInterval
      dueDate
      currentStep
      createdAt
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
      cards
      newCards
      learningCars
      relearningCards
      graduatedCards
      newCardsToday {
        date
        numCards
      }
    }
  }
`;

export const DELETE_DECK_MUTATION = gql`
  mutation deleteDeck($deckId: String!) {
    deleteDeck(deckId: $deckId)
  }
`;

export const ADD_CARD_MUTATION = gql`
  mutation addCard($deckId: String!, $front: String!, $back: String!) {
    addCard(deckId: $deckId, front: $front, back: $back) {
      _id
      name
      userId
      createdAt
      cards
      newCards
      learningCars
      relearningCards
      graduatedCards
      newCardsToday {
        date
        numCards
      }
    }
  }
`;
