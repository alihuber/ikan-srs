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

const Decks = () => {
  const animClass = useContext(AnimContext);
  const history = useHistory();
  const currentUser = useContext(CurrentUserContext);
  const { data, loading, refetch } = useQuery(DECKS_QUERY, {
    notifyOnNetworkStatusChange: true,
  });

  if (currentUser && !currentUser._id) {
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
            <Grid style={{ height: '50vh', marginTop: '0' }} verticalAlign="middle">
              <Grid.Column>
                <Header size="large" color="teal" textAlign="center">
                  Decks
                </Header>
                <Modal
                  trigger={(
                    <Button name="addDeckButton" size="small" primary>
                      Add Deck
                    </Button>
                  )}
                >
                  <AddDeckModal refetch={refetch} />
                </Modal>
                <Divider />
                <Card.Group>
                  {data.decks.map((deck) => (
                    <Card key={deck._id}>
                      <Card.Content>
                        <Button floated="right">Remove</Button>
                        <Card.Header>{deck.name}</Card.Header>
                        <Card.Meta>{moment(deck.createdAt).format('DD.MM.YYYY HH:mm')}</Card.Meta>
                        <Card.Description>
                          <Label>
                            Cards
                            <Label.Detail>{deck.cards.length}</Label.Detail>
                          </Label>
                          <br />
                          <Label color="green">
                            New Cards
                            <Label.Detail>{deck.newCards || 0}</Label.Detail>
                          </Label>
                          <br />
                          <Label color="teal">
                            Learning Cards
                            <Label.Detail>{deck.learningCars || 0}</Label.Detail>
                          </Label>
                          <br />
                          <Label color="blue">
                            Relearing Cards
                            <Label.Detail>{deck.relearingCards || 0}</Label.Detail>
                          </Label>
                          <br />
                          <Label color="brown">
                            Graduated Cards
                            <Label.Detail>{deck.graduated || 0}</Label.Detail>
                          </Label>
                        </Card.Description>
                      </Card.Content>
                      <Card.Content extra>
                        <Button basic color="green">
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
