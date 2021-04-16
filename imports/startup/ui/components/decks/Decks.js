import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import format from 'date-fns/format';
import isBefore from 'date-fns/isBefore';
import { useQuery } from '@apollo/client';
import {
  Divider,
  Label,
  Card,
  Container,
  Grid,
  Header,
  Modal,
  Button,
} from 'semantic-ui-react';
import AnimContext from '../../contexts/AnimContext';
import CurrentUserContext from '../../contexts/CurrentUserContext';
import { DECKS_QUERY } from '../../../../api/decks/constants';
import LoadingIndicator from '../../LoadingIndicator';
import AddDeckModal from './AddDeckModal';
import AddCardModal from '../cards/AddCardModal';

const Decks = () => {
  const animClass = useContext(AnimContext);
  const history = useHistory();
  const currentUser = useContext(CurrentUserContext);
  const { data, loading, refetch } = useQuery(DECKS_QUERY, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'no-cache',
  });

  const handleLearn = (deckId, hist) => {
    hist.push(`/learn/${deckId}`);
  };

  const handleEdit = (deckId, hist) => {
    hist.push(`/editDeck/${deckId}`);
  };

  if (currentUser && (!currentUser._id || currentUser.admin)) {
    history.push('/');
    return null;
  } else {
    if (loading) {
      return <LoadingIndicator />;
    }
    if (data) {
      return (
        <div className={animClass}>
          <Container text style={{ paddingTop: '4em' }}>
            <Grid verticalAlign="middle">
              <Grid.Column>
                <Header size="large" color="teal" textAlign="center">
                  Decks
                </Header>
                <Modal
                  trigger={
                    <Button compact name="addDeckButton" size="small" primary>
                      Add Deck
                    </Button>
                  }
                >
                  <AddDeckModal refetch={refetch} />
                </Modal>
                {data.decks.length !== 0 ? (
                  <AddCardModal decks={data.decks} refetch={refetch} />
                ) : null}
                <Divider />
                <Card.Group>
                  {data.decks.map((deck) => {
                    const cardsLength = (deck.cards && deck.cards.length) || 0;
                    const learnDisabled =
                      deck.newCards === 0 &&
                      deck.learningCards === 0 &&
                      deck.relearningCards === 0 &&
                      deck.graduatedCards === 0;
                    const nextDueDate =
                      (cardsLength !== 0 &&
                        Array.from(deck.cards).sort((a, b) => {
                          return (
                            new Date(a.dueDate).getTime() -
                            new Date(b.dueDate).getTime()
                          );
                        })[0].dueDate) ||
                      null;
                    return (
                      <Card fluid key={deck._id}>
                        <Card.Content>
                          <Button
                            floated="right"
                            onClick={() => handleEdit(deck._id, history)}
                          >
                            Edit
                          </Button>
                          <Card.Header>{deck.name}</Card.Header>
                          <Card.Meta>
                            Interval modifier:&nbsp;
                            {deck.intervalModifier}%
                          </Card.Meta>
                          {nextDueDate ? (
                            <Card.Meta>
                              Next due card: &nbsp;
                              {isBefore(nextDueDate, new Date()) ? (
                                <b style={{ color: 'red' }}>
                                  {format(nextDueDate, 'dd.MM.yyyy HH:mm')}
                                </b>
                              ) : (
                                format(nextDueDate, 'dd.MM.yyyy HH:mm')
                              )}
                            </Card.Meta>
                          ) : null}
                          <Card.Description>
                            <Label>
                              All Cards
                              <Label.Detail>{deck.numCards}</Label.Detail>
                            </Label>
                            <br />
                            <Label color="green">
                              Due New Cards
                              <Label.Detail>{deck.newCards}</Label.Detail>
                            </Label>
                            <br />
                            <Label color="teal">
                              Due Learning Cards
                              <Label.Detail>{deck.learningCards}</Label.Detail>
                            </Label>
                            <br />
                            <Label color="blue">
                              Due Relearning Cards
                              <Label.Detail>
                                {deck.relearningCards}
                              </Label.Detail>
                            </Label>
                            <br />
                            <Label color="brown">
                              Due Graduated Cards
                              <Label.Detail>{deck.graduatedCards}</Label.Detail>
                            </Label>
                          </Card.Description>
                        </Card.Content>
                        <Card.Content extra>
                          <Button
                            disabled={learnDisabled}
                            basic
                            color="green"
                            onClick={() => handleLearn(deck._id, history)}
                          >
                            Learn now
                          </Button>
                        </Card.Content>
                      </Card>
                    );
                  })}
                </Card.Group>
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

export default Decks;
