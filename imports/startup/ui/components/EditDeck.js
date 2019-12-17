import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { Container, Grid, Header, Modal, Button } from 'semantic-ui-react';
import { toast } from 'react-toastify';
import AnimContext from '../contexts/AnimContext';
import CurrentUserContext from '../contexts/CurrentUserContext';
import { DECK_QUERY, DELETE_DECK_MUTATION } from '../../../api/decks/constants';
import LoadingIndicator from './LoadingIndicator';
import AddCardModal from './AddCardModal';
import CardsTable from './CardsTable';

const EditDeck = () => {
  const animClass = useContext(AnimContext);
  const history = useHistory();
  const deckId = history.location.pathname.split('/')[2];
  const currentUser = useContext(CurrentUserContext);
  const { data, loading, refetch } = useQuery(DECK_QUERY, {
    notifyOnNetworkStatusChange: true,
    variables: { deckId },
  });
  // eslint-disable-next-line no-unused-vars
  const [deleteDeck, _] = useMutation(DELETE_DECK_MUTATION);

  const handleDelete = (deckId, deleteDeckFunc, reFetch) => {
    deleteDeckFunc({ variables: { deckId } }).then(() => {
      reFetch();
      toast.success('Deletion successful!', {
        position: toast.POSITION.BOTTOM_CENTER,
      });
    });
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
                  Deck {data.deckQuery.name}
                </Header>
                <CardsTable deckId={deckId} />
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

export default EditDeck;
