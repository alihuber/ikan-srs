## Anki algorithm

### Card states

New, Learing, Relearning, Graduated

### Deck settings

- intervalModifier: Int (Default: 100%, better: ??)

### Lapse settings

- stepsInMinutes: [Int] (Default: 10, better: 20)
- newInterval: Int (Default: 0%, better: 70%)
- minimumIntervalInDays: Int (Default: 1 day, better: 2 days)
- leechThreshold: Int (Default: 8 lapses)
- leechAction: LeechAction (Default: 'SUSPEND', better: 'TAG')

### Learning settings

This does apply only to cards in LEARNING state!

- stepsInMinutes: [Int] (Default: [1, 10], better: [15, 1440, 8640])
- newCardsOrder: NewCardsOrder (Default: 'ADDED', better: 'RANDOM')
- newCardsPerDay: Int (Default: 20, better: 1000)
- graduatingIntervalInDays: Int (Default: 1 day, better: 15 days)
- easyIntervalInDays: Int (Default 4 days, better: 60 days)
- startingEase: Int (Default: 250%)

The scheduler calculates the new interval of a card.  
Cards can be in states new, learning, relearning, graduated.  

#### Graduated cards  

How is the new interval of _graduated_ cards calculated?  
`newInterval = currentInterval * easeFactor * intervalModifier`  
The default easeFactor is 2.5   
The default intervalModifier is 1  
Example: currentInterval is 10 Days so 10 * 2.5 * 1 = 25 days  

Answering _graduated_ cards alters the easeFactor of a card:  
Good = unchanged  
Again = -0.20  
Hard = -0.15  
Easy= +0.15  
The easeFactor can not get lower than 1.3  

Answering _graduated_ cards modifies the currentInterval of the card:  
Good = standard case: currentInterval * easeFactor * intervalModifier  
Again = goes to "relearning" state  and the easeFactor is reduced.  
- If it is marked correct the next time, its new interval is multiplied with "new interval" setting,
- if not: lapse card  

Hard = currentInterval * 1.2 * intervalModifier
Easy = currentInterval * easeFactor * intervalModifier * easyBonus
The default value of easyBonus is 1.3, and 1.2 for answering hard is fixed.

What does mark as "lapse" do to the card? It is altered according to the default lapse configuration:
steps in minutes: 10 minutes
new interval: 0
minimum interval: 1 day
leech threshold: 8 lapses
leech action: suspend / tag only

What does a lapse mean?
1. It will reappear in 10 minutes (steps setting)
   If it is answered correctly then, it moves to "graduated",
   the new interval is set to 0 (new inverval setting)
2. It will reappear after one day (minimum interval setting)
3. after 8 wrong answers the card is suspended (leech threshold setting)

#### Learning cards  

When cards are in learning mode, all mistakes do NOT affect its easeFactor.  
There is no lapse for learning cards.  
The learning phase will not "punish" you for forgetting the card.  

What do the learning settings mean?  
steps in minutes: 1 10  
order: show new cards in order added / random order  
new cards/day: 20  
graduating interval: 1 day  
easy interval: 4 days  
starting ease: 2.5  

new card is displayed:  
Again: Will move the card to first step, show again in one minute (steps in minutes setting)  
Good: Will move the card to the next step. If the step was the last step, the card graduates and its currentInterval is set to one day (graduating inverval setting)  
Easy: The card graduates immediately and its currentInterval will be set to 4 days  

```js
const lapseSettings = {
  newInterval: 0,
  minimumIntervalInDays: 1,
  leechThreshold: 8,
  leechAction: 'suspend', // suspend / tag
};

const learningSettings = {
  stepsInMinutes: [1, 10],
  newCardsOrder: 'added', // added / random
  newCardsPerDay: 20,
  graduatingIntervalInDays: 1,
  easyIntervalInDays: 4,
  startingEase: 2.5,
};
```