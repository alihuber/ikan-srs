import { Mongo } from 'meteor/mongo';
import { gql } from '@apollo/client';

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
      cards {
        front
        back
        state
        easeFactor
        currentInterval
        dueDate
        currentStep
        createdAt
      }
      numCards
      newCards
      learningCards
      relearningCards
      graduatedCards
      newCardsToday {
        date
        numCards
      }
    }
  }
`;

export const DECK_QUERY = gql`
  query deckQuery($deckId: String!) {
    deckQuery(deckId: $deckId) {
      _id
      userId
      name
      createdAt
      intervalModifier
      cards {
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
  }
`;

export const CARDS_FOR_DECK_QUERY = gql`
  query cardsForDeck($deckId: String!) {
    cardsForDeck(deckId: $deckId) {
      cardsList {
        _id
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
  }
`;

export const NEXT_CARD_FOR_LEARNING_QUERY = gql`
  query nextCardForLearning($deckId: String!) {
    nextCardForLearning(deckId: $deckId) {
      _id
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

export const DELETE_CARD_MUTATION = gql`
  mutation deleteCard($cardId: String!) {
    deleteCard(cardId: $cardId)
  }
`;

export const RESET_CARD_MUTATION = gql`
  mutation resetCard($cardId: String!) {
    resetCard(cardId: $cardId) {
      _id
      front
      back
      state
      easeFactor
      currentInterval
      dueDate
      currentStep
      createdAt
      lapseCount
    }
  }
`;

export const RESET_DECK_MUTATION = gql`
  mutation resetDeck($deckId: String!) {
    resetDeck(deckId: $deckId) {
      _id
      userId
      name
      createdAt
      intervalModifier
      cards {
        front
        back
        state
        easeFactor
        currentInterval
        dueDate
        currentStep
        createdAt
        lapseCount
      }
    }
  }
`;

export const ANSWER_CARD_MUTATION = gql`
  mutation answerCard($cardId: String!, $answer: String!) {
    answerCard(cardId: $cardId, answer: $answer) {
      _id
      front
      back
      state
      easeFactor
      currentInterval
      dueDate
      currentStep
      createdAt
      lapseCount
    }
  }
`;

export const UPDATE_CARD_MUTATION = gql`
  mutation updateCard($cardId: String!, $front: String!, $back: String!) {
    updateCard(cardId: $cardId, front: $front, back: $back) {
      front
      back
      state
      easeFactor
      currentInterval
      dueDate
      currentStep
      createdAt
      lapseCount
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
        currentStep
        createdAt
        lapseCount
      }
      numCards
      newCards
      learningCards
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
      cards {
        front
        back
        state
        easeFactor
        currentInterval
        dueDate
        currentStep
        createdAt
        lapseCount
      }
      numCards
      newCards
      learningCards
      relearningCards
      graduatedCards
      newCardsToday {
        date
        numCards
      }
    }
  }
`;
