import React, { useContext, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import Markdown from 'markdown-to-jsx';
import { Divider, Card, Container, Grid, Header, Button } from 'semantic-ui-react';
import AnimContext from '../contexts/AnimContext';
import CurrentUserContext from '../contexts/CurrentUserContext';
import { NEXT_CARD_FOR_LEARNING_QUERY, ANSWER_CARD_MUTATION } from '../../../api/decks/constants';
import LoadingIndicator from './LoadingIndicator';

const Learn = () => {
  const animClass = useContext(AnimContext);
  const history = useHistory();
  const currentUser = useContext(CurrentUserContext);
  const { deckId } = useParams();
  const [answerCard, _] = useMutation(ANSWER_CARD_MUTATION);
  const { data, loading, refetch } = useQuery(NEXT_CARD_FOR_LEARNING_QUERY, {
    variables: { deckId },
    notifyOnNetworkStatusChange: true,
  });
  const [answerShown, setAnswerShown] = useState(false);

  const showAnswer = (
    <Button basic color="green" onClick={setAnswerShown}>
      Show answer
    </Button>
  );

  const handleAnswer = (cardId, answerCardFunc, answer, reFetch) => {
    answerCardFunc({ variables: { cardId, answer } }).then(() => {
      reFetch();
    });
  };

  const rateAnswer = (cardState, cardId) => {
    if (cardState === 'NEW') {
      return (
        <>
          <Button basic color="red" onClick={() => handleAnswer(cardId, answerCard, 'again', refetch)}>
            Again
          </Button>
          <Button basic color="blue" onClick={() => handleAnswer(cardId, answerCard, 'good', refetch)}>
            Good
          </Button>
          <Button basic color="green" onClick={() => handleAnswer(cardId, answerCard, 'easy', refetch)}>
            Easy
          </Button>
        </>
      );
    } else {
      return (
        <>
          <Button basic color="red" onClick={() => handleAnswer(cardId, answerCard, 'again', refetch)}>
            Again
          </Button>
          <Button basic color="yellow" onClick={() => handleAnswer(cardId, answerCard, 'hard', refetch)}>
            Hard
          </Button>
          <Button basic color="blue" onClick={() => handleAnswer(cardId, answerCard, 'good', refetch)}>
            Good
          </Button>
          <Button basic color="green" onClick={() => handleAnswer(cardId, answerCard, 'easy', refetch)}>
            Easy
          </Button>
        </>
      );
    }
  };

  if (currentUser && !currentUser._id) {
    history.push('/');
    return null;
  } else {
    if (loading) {
      return <LoadingIndicator />;
    }
    if (data) {
      const card = data.nextCardForLearning;
      return (
        <div className={animClass}>
          <Container text style={{ paddingTop: '4em' }}>
            <Grid verticalAlign="middle">
              <Grid.Column>
                <Header size="large" color="teal" textAlign="center">
                  Learn
                </Header>
                {card ? (
                  <Card fluid>
                    <Card.Content>
                      <Card.Description>
                        <Markdown>{card.front}</Markdown>
                      </Card.Description>
                      <Divider />
                      {answerShown ? (
                        <Card.Description>
                          <Markdown>{card.back}</Markdown>
                        </Card.Description>
                      ) : null}
                    </Card.Content>
                    <Card.Content extra>{answerShown ? rateAnswer(card.state, card._id, refetch) : showAnswer}</Card.Content>
                  </Card>
                ) : (
                    'No cards left :)'
                  )}
              </Grid.Column>
            </Grid>
          </Container>
        </div>
      );
    } else {
      return <LoadingIndicator />;
    }
  }
};

export default Learn;
