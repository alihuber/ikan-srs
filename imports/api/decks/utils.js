import addMinutes from 'date-fns/addMinutes';
import addDays from 'date-fns/addDays';
import { Decks, Cards } from './constants';

const updateDeckNewCardsToday = (state, deckId) => {
  if (state === 'NEW') {
    Decks.update(
      { _id: deckId },
      {
        $set: { 'newCardsToday.date': new Date() },
        $inc: { 'newCardsToday.numCards': 1 },
      }
    );
  }
};

export const updateCard = (settings, card, answer, deckId) => {
  if (answer === 'again') {
    if (card.state === 'RELEARNING') {
      // show again in lapseSettings minutes, increase lapseCount
      const stepInMinutes = settings.lapseSettings.stepInMinutes;
      const lapseCountBefore = card.lapseCount;
      // TODO: handle leeches due to settings, if lapseCount > leechThreshold: tag or suspend
      Cards.update(
        { _id: card._id },
        {
          $set: {
            lapseCount: lapseCountBefore + 1,
            dueDate: addMinutes(new Date(), stepInMinutes),
          },
        }
      );
    }
    if (card.state === 'NEW' || card.state === 'LEARNING') {
      // Again: Will move the card to first step, show again in one minute (sets in minutes setting)
      const stepsInMinutes = settings.learningSettings.stepsInMinutes;
      const stateBefore = card.state;
      const newState = stateBefore === 'NEW' ? 'LEARNING' : stateBefore;
      Cards.update(
        { _id: card._id },
        {
          $set: {
            state: newState,
            currentStep: 0,
            dueDate: addMinutes(new Date(), stepsInMinutes[0]),
          },
        }
      );
      updateDeckNewCardsToday(card.state, deckId);
    }
    if (card.state === 'GRADUATED') {
      // goes to "relearning" state  and the easeFactor is reduced.
      // new easeFactor -0.20
      // The easeFactor can not get lower than 1.3
      // will be shown again in lapseSetting stepInMinutes
      // sets currentInterval to 0 again
      const stepInMinutes = settings.lapseSettings.stepInMinutes;
      const currentEaseFactor = card.easeFactor;
      let newEaseFactor = currentEaseFactor;
      if (currentEaseFactor - 0.15 >= 1.3) {
        newEaseFactor = currentEaseFactor - 0.2;
      } else {
        newEaseFactor = 1.3;
      }
      Cards.update(
        { _id: card._id },
        {
          $set: {
            state: 'RELEARNING',
            dueDate: addMinutes(new Date(), stepInMinutes),
            easeFactor: newEaseFactor,
            currentInterval: 1,
          },
        }
      );
    }
  }
  if (answer === 'hard' && card.state === 'GRADUATED') {
    // newInterval = currentInterval * 1.2 * intervalModifier (1.2 is fixed)
    // newEaseFactor = -0.15
    // The easeFactor can not get lower than 1.3
    // we checked that the deck belongs to user before
    const foundDeck = Decks.findOne({ _id: deckId });
    const currentInterval = card.currentInterval;
    const currentEaseFactor = card.easeFactor;
    const intervalModifier = foundDeck.intervalModifier;
    const newInterval = currentInterval * 1.2 * intervalModifier;
    let newEaseFactor = currentEaseFactor;
    if (currentEaseFactor - 0.15 >= 1.3) {
      newEaseFactor = currentEaseFactor - 0.15;
    } else {
      newEaseFactor = 1.3;
    }
    Cards.update(
      { _id: card._id },
      {
        $set: {
          currentInterval: newInterval,
          dueDate: addMinutes(new Date(), newInterval * 1440),
          easeFactor: newEaseFactor,
        },
      }
    );
  }
  if (answer === 'good') {
    if (card.state === 'RELEARNING') {
      const currentInterval = card.currentInterval;
      const newIntervalSetting = settings.lapseSettings.newInterval;
      const newInterval = currentInterval * newIntervalSetting;
      Cards.update(
        { _id: card._id },
        {
          $set: {
            state: 'GRADUATED',
            currentStep: 0,
            lapseCount: 0,
            currentInterval: newInterval,
            dueDate: addMinutes(new Date(), newInterval * 1440),
          },
        }
      );
    }
    if (card.state === 'NEW' || card.state === 'LEARNING') {
      // Good: Will move the card to the next step. If the step was the last step,
      //       the card graduates and its currentInterval is set to graduating inverval setting
      const stepsInMinutes = settings.learningSettings.stepsInMinutes;
      const graduatingIntervalInDays =
        settings.learningSettings.graduatingIntervalInDays;
      if (card.currentStep === stepsInMinutes.length - 1) {
        Cards.update(
          { _id: card._id },
          {
            $set: {
              state: 'GRADUATED',
              currentStep: 0,
              currentInterval: graduatingIntervalInDays,
              dueDate: addDays(new Date(), graduatingIntervalInDays),
            },
          }
        );
      } else {
        const stepBefore = card.currentStep;
        const nextStep = stepBefore + 1;
        const stateBefore = card.state;
        const newState = stateBefore === 'NEW' ? 'LEARNING' : stateBefore;
        Cards.update(
          { _id: card._id },
          {
            $set: {
              state: newState,
              currentStep: nextStep,
              dueDate: addMinutes(new Date(), stepsInMinutes[nextStep]),
            },
          }
        );
      }
      updateDeckNewCardsToday(card.state, deckId);
    }
    if (card.state === 'GRADUATED') {
      // we checked that the deck belongs to user before
      const foundDeck = Decks.findOne({ _id: deckId });
      const currentInterval = card.currentInterval;
      const currentEaseFactor = card.easeFactor;
      const intervalModifier = foundDeck.intervalModifier;
      const newInterval =
        currentInterval * currentEaseFactor * intervalModifier;
      Cards.update(
        { _id: card._id },
        {
          $set: {
            currentInterval: newInterval,
            dueDate: addMinutes(new Date(), newInterval * 1440),
          },
        }
      );
    }
  }
  if (answer === 'easy') {
    const easyIntervalInDays = settings.learningSettings.easyIntervalInDays;
    if (card.state === 'RELEARNING') {
      const currentInterval = card.currentInterval;
      const newIntervalSetting = settings.lapseSettings.newInterval;
      const newInterval = currentInterval * newIntervalSetting;
      Cards.update(
        { _id: card._id },
        {
          $set: {
            state: 'GRADUATED',
            currentStep: 0,
            lapseCount: 0,
            currentInterval: newInterval,
            dueDate: addMinutes(new Date(), newInterval * 1440),
          },
        }
      );
    }
    if (card.state === 'NEW' || card.state === 'LEARNING') {
      // Easy: The card graduates immediately and its currentInterval will be set to easyIntervalInDays
      Cards.update(
        { _id: card._id },
        {
          $set: {
            state: 'GRADUATED',
            currentStep: 0,
            currentInterval: easyIntervalInDays,
            dueDate: addDays(new Date(), easyIntervalInDays),
          },
        }
      );
      updateDeckNewCardsToday(card.state, deckId);
    }
    if (card.state === 'GRADUATED') {
      // we checked that the deck belongs to user before
      const foundDeck = Decks.findOne({ _id: deckId });
      const currentInterval = card.currentInterval;
      const currentEaseFactor = card.easeFactor;
      const intervalModifier = foundDeck.intervalModifier;
      const easyBonus = 1.3; // fixed value
      const newInterval =
        currentInterval * currentEaseFactor * intervalModifier * easyBonus;
      const newEaseFactor = currentEaseFactor + 0.15;
      Cards.update(
        { _id: card._id },
        {
          $set: {
            currentInterval: newInterval,
            dueDate: addMinutes(new Date(), newInterval * 1440),
            easeFactor: newEaseFactor,
          },
        }
      );
    }
  }
};

export const collectCardStats = (deck) => {
  const foundCards = Cards.find({ deckId: deck._id }).fetch();
  const numCards = foundCards.length;
  const now = new Date();
  const newCards = foundCards.filter(
    (c) => c.state === 'NEW' && c.dueDate < now
  ).length;
  const learningCards = foundCards.filter(
    (c) => c.state === 'LEARNING' && c.dueDate < now
  ).length;
  const relearningCards = foundCards.filter(
    (c) => c.state === 'RELEARNING' && c.dueDate < now
  ).length;
  const graduatedCards = foundCards.filter(
    (c) => c.state === 'GRADUATED' && c.dueDate < now
  ).length;
  deck.cards = foundCards;
  deck.numCards = numCards;
  deck.newCards = newCards;
  deck.learningCards = learningCards;
  deck.relearningCards = relearningCards;
  deck.graduatedCards = graduatedCards;
  return deck;
};
