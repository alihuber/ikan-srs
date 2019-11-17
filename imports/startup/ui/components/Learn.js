import React, { useContext, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { Divider, Card, Container, Grid, Header, Button } from 'semantic-ui-react';
import AnimContext from '../contexts/AnimContext';
import CurrentUserContext from '../contexts/CurrentUserContext';
import { NEXT_CARD_FOR_LEARNING_QUERY } from '../../../api/decks/constants';
import LoadingIndicator from './LoadingIndicator';

const Learn = () => {
  const animClass = useContext(AnimContext);
  const history = useHistory();
  const currentUser = useContext(CurrentUserContext);
  const { deckId } = useParams();
  // const [answerCard, _] = useMutation(ANSWER_CARD_MUTATION);
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

  const rateAnswer = cardState => {
    if (cardState === 'NEW') {
      return (
        <>
          <Button basic color="red" onClick={() => console.log('again')}>
            Again
          </Button>
          <Button basic color="blue" onClick={() => console.log('good')}>
            Good
          </Button>
          <Button basic color="green" onClick={() => console.log('easy')}>
            Easy
          </Button>
        </>
      );
    } else {
      return (
        <>
          <Button basic color="red" onClick={() => console.log('again')}>
            Again
          </Button>
          <Button basic color="yellow" onClick={() => console.log('hard')}>
            Hard
          </Button>
          <Button basic color="blue" onClick={() => console.log('good')}>
            Good
          </Button>
          <Button basic color="green" onClick={() => console.log('easy')}>
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
                <Card>
                  <Card.Content>
                    <Card.Description>{card.front}</Card.Description>
                    <Divider />
                    {answerShown ? <Card.Description>{card.back}</Card.Description> : null}
                  </Card.Content>
                  <Card.Content extra>{answerShown ? rateAnswer(card.state) : showAnswer}</Card.Content>
                </Card>
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
