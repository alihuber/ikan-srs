## Anki algorithm

### Card states

New, Learing, Relearning, Graduated

### Deck settings

- intervalModifier: Int (Default: 100%, better: )

### Lapse settings

- stepsInMinutes: Int (Default: 10, better: 20)
- newInterval: Int (Default: 0%, better: 70%)
- minimumIntervalInDays: Int (Default: 1 day, better: 2 days)
- leechThreshold: Int (Default: 8 lapses)
- leechAction: LeechAction (Default: 'SUSPEND', better: 'TAG')

### Learning settings

This does apply only to cards in LEARNING state!

- stepsInMinutes: [Int] (Default: [1 10], better: [15 1440 8640])
- newCardsOrder: NewCardsOrder (Default: 'ADDED', better: 'RANDOM')
- newCardsPerDay: Int (Default: 20, better: 1000)
- graduatingIntervalInDays: Int (Default: 1 day, better: 15 days)
- easyIntervalInDays: Int (Default 4 days, better: 60 days)
- startingEase: Int (Default: 250%)
