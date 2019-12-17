import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import moment from 'moment';
import { useQuery } from '@apollo/react-hooks';
import { Divider, Label, Card, Container, Grid, Header, Modal, Button } from 'semantic-ui-react';
import AnimContext from '../contexts/AnimContext';
import CurrentUserContext from '../contexts/CurrentUserContext';
import { DECKS_QUERY } from '../../../api/decks/constants';
import LoadingIndicator from './LoadingIndicator';
import AddDeckModal from './AddDeckModal';
import AddCardModal from './AddCardModal';

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
                    <Button name="addDeckButton" size="small" primary>
                      Add Deck
                    </Button>
                  }
                >
                  <AddDeckModal refetch={refetch} />
                </Modal>
                {data.decks.length !== 0 ? (
                  <Modal
                    trigger={
                      <Button name="addDeckButton" size="small" secondary floated="right">
                        Add Card
                      </Button>
                    }
                  >
                    <AddCardModal decks={data.decks} refetch={refetch} />
                  </Modal>
                ) : null}
                <Divider />
                <Card.Group>
                  {data.decks.map(deck => (
                    <Card key={deck._id}>
                      <Card.Content>
                        <Button floated="right" onClick={() => handleEdit(deck._id, history)}>
                          Edit
                        </Button>
                        <Card.Header>{deck.name}</Card.Header>
                        <Card.Meta>{moment(deck.createdAt).format('DD.MM.YYYY HH:mm')}</Card.Meta>
                        <Card.Meta>
                          Interval modifier:&nbsp;
                          {deck.intervalModifier}%
                        </Card.Meta>
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
                            <Label.Detail>{deck.relearningCards}</Label.Detail>
                          </Label>
                          <br />
                          <Label color="brown">
                            Due Graduated Cards
                            <Label.Detail>{deck.graduatedCards}</Label.Detail>
                          </Label>
                        </Card.Description>
                      </Card.Content>
                      <Card.Content extra>
                        <Button basic color="green" onClick={() => handleLearn(deck._id, history)}>
                          Learn now
                        </Button>
                      </Card.Content>
                    </Card>
                  ))}
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
