import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import format from 'date-fns/format';
import isBefore from 'date-fns/isBefore';
import { useQuery } from '@apollo/client';
import {
  Input,
  Checkbox,
  Pagination,
  Divider,
  Label,
  Card,
  Container,
  Grid,
  Header,
  Modal,
  Button,
} from 'semantic-ui-react';
import debounce from 'lodash/debounce';
import AnimContext from '../../contexts/AnimContext';
import CurrentUserContext from '../../contexts/CurrentUserContext';
import { DECKS_QUERY } from '../../../../api/decks/constants';
import LoadingIndicator from '../../LoadingIndicator';
import AddDeckModal from './AddDeckModal';
import AddCardModal from '../cards/AddCardModal';

const Decks = () => {
  const animClass = useContext(AnimContext);
  const navigate = useNavigate();
  const currentUser = useContext(CurrentUserContext);
  const [addOpen, setAddOpen] = useState(false);
  const [q, setQ] = useState('');
  const [order, setOrder] = useState('desc');
  const [pageNum, setPageNum] = useState(1);
  const { data, loading, refetch } = useQuery(DECKS_QUERY, {
    variables: { q, order, pageNum },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'no-cache',
  });

  const handleLearn = (deckId, nav) => {
    nav(`/learn/${deckId}`);
  };

  const handleEdit = (deckId, nav) => {
    nav(`/editDeck/${deckId}`);
  };

  useEffect(() => {
    if (currentUser && (!currentUser._id || currentUser.admin)) {
      navigate('/');
    }
  }, [currentUser]);

  if (currentUser && (!currentUser._id || currentUser.admin)) {
    return null;
  } else {
    const showPagination = data && data.decks && data.decks.decksCount / 5 > 1;
    const setQuery = debounce(
      (value) => {
        setQ(value);
      },
      500,
      { leading: true }
    );

    return (
      <div className={animClass}>
        <Container text style={{ paddingTop: '4em' }}>
          <Grid verticalAlign="middle">
            <Grid.Column>
              <Header size="large" color="teal" textAlign="center">
                Decks
              </Header>
              <Modal
                open={addOpen}
                onClose={() => {
                  setAddOpen(false);
                }}
                onOpen={() => {
                  setAddOpen(true);
                }}
                trigger={
                  <Button compact name="addDeckButton" size="small" primary>
                    Add Deck
                  </Button>
                }
              >
                <AddDeckModal refetch={refetch} setAddOpen={setAddOpen} />
              </Modal>
              {data && data.decks && data.decks.decksCount !== 0 ? (
                <AddCardModal decks={data.decks.decksList} refetch={refetch} />
              ) : null}
              <Divider />
              <div
                style={{
                  display: 'flex',
                  marginBottom: '14px',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Input
                  onChange={(evt) => setQuery(evt.target.value)}
                  icon="search"
                  placeholder="Search deck name"
                  value={q}
                />
                <Checkbox
                  style={{ justifyContent: 'center' }}
                  toggle
                  checked={order === 'desc'}
                  onChange={() => {
                    order === 'desc' ? setOrder('asc') : setOrder('desc');
                  }}
                  label={order}
                />
              </div>
              <div
                style={{
                  marginBottom: '14px',
                }}
              >
                <Pagination
                  onPageChange={(e, dt) => {
                    setPageNum(dt.activePage);
                  }}
                  ellipsisItem={null}
                  disabled={!showPagination}
                  defaultActivePage={1}
                  totalPages={Math.ceil(
                    data && data.decks && data.decks.decksCount / 5
                  )}
                />
              </div>
              {loading ? (
                <LoadingIndicator />
              ) : (
                <Card.Group>
                  {data &&
                    data.decks &&
                    data.decks.decksList.map((deck) => {
                      const cardsLength =
                        (deck.cards && deck.cards.length) || 0;
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
                              onClick={() => handleEdit(deck._id, navigate)}
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
                                <Label.Detail>
                                  {deck.learningCards}
                                </Label.Detail>
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
                                <Label.Detail>
                                  {deck.graduatedCards}
                                </Label.Detail>
                              </Label>
                            </Card.Description>
                          </Card.Content>
                          <Card.Content extra>
                            <Button
                              disabled={learnDisabled}
                              basic
                              color="green"
                              onClick={() => handleLearn(deck._id, navigate)}
                            >
                              Learn now
                            </Button>
                          </Card.Content>
                        </Card>
                      );
                    })}
                </Card.Group>
              )}
            </Grid.Column>
          </Grid>
        </Container>
      </div>
    );
  }
};

export default Decks;
