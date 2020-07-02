import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Markdown from 'markdown-to-jsx';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { toast } from 'react-toastify';
import { Table, Button, Modal, Responsive, Divider } from 'semantic-ui-react';
import moment from 'moment';
import truncate from 'lodash/truncate';
import LoadingIndicator from './LoadingIndicator';
import AddCardModal from './AddCardModal';
import EditCardModal from './EditCardModal';
import {
  CARDS_FOR_DECK_QUERY,
  DELETE_DECK_MUTATION,
  DELETE_CARD_MUTATION,
  RESET_CARD_MUTATION,
  RESET_DECK_MUTATION,
} from '../../../api/decks/constants';

const CardsTable = ({ deck }) => {
  const history = useHistory();
  const deckId = history.location.pathname.split('/')[2];
  const [pageNum, setPageNum] = useState(0);
  const { data, loading, refetch, fetchMore } = useQuery(CARDS_FOR_DECK_QUERY, {
    notifyOnNetworkStatusChange: true,
    variables: { deckId },
  });

  // eslint-disable-next-line no-unused-vars
  const [deleteDeck, _] = useMutation(DELETE_DECK_MUTATION);
  const handleDeleteDeck = (dkId, deleteDeckFunc, reFetch, hist) => {
    deleteDeckFunc({ variables: { deckId: dkId } }).then(() => {
      reFetch();
      hist.push('/');
      toast.success('Deletion successful!', {
        position: toast.POSITION.BOTTOM_CENTER,
      });
    });
  };

  // eslint-disable-next-line no-unused-vars
  const [deleteCard, __] = useMutation(DELETE_CARD_MUTATION);
  const handleDeleteCard = (cardId, deleteCardFunc, reFetch) => {
    deleteCardFunc({ variables: { cardId } }).then(() => {
      reFetch();
      setPageNum(0);
      toast.success('Deletion successful!', {
        position: toast.POSITION.BOTTOM_CENTER,
      });
    });
  };

  // eslint-disable-next-line no-unused-vars
  const [resetCard, ___] = useMutation(RESET_CARD_MUTATION);
  const handleResetCard = (cardId, resetCardFunc, reSetFetch) => {
    resetCardFunc({ variables: { cardId } }).then(() => {
      reSetFetch();
      setPageNum(0);
      toast.success('Card reset successful!', {
        position: toast.POSITION.BOTTOM_CENTER,
      });
    });
  };

  // eslint-disable-next-line no-unused-vars
  const [resetDeck, ____] = useMutation(RESET_DECK_MUTATION);
  const handleResetDeck = (deckId, resetDeckFunc, reSettFetch) => {
    resetDeckFunc({ variables: { deckId } }).then(() => {
      reSettFetch();
      setPageNum(0);
      toast.success('Deck reset successful!', {
        position: toast.POSITION.BOTTOM_CENTER,
      });
    });
  };

  const handleChangePage = (_, page, fetchmore) => {
    fetchmore({
      variables: {
        pageNum: page + 1,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return fetchMoreResult;
      },
    });
    setPageNum(page);
  };

  if (loading) {
    return <LoadingIndicator />;
  }
  if (data) {
    const { cardsList } = data.cardsForDeck;
    const tableHeader = (
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>ID</Table.HeaderCell>
          <Table.HeaderCell>Front</Table.HeaderCell>
          <Table.HeaderCell>Back</Table.HeaderCell>
          <Table.HeaderCell>Due date</Table.HeaderCell>
          <Table.HeaderCell>State</Table.HeaderCell>
          <Table.HeaderCell>Tags</Table.HeaderCell>
          <Table.HeaderCell colSpan="2" />
        </Table.Row>
      </Table.Header>
    );

    const tableFooter = (
      <Table.Footer fullWidth>
        <Table.Row>
          <Table.HeaderCell />
          <Table.HeaderCell colSpan="6">
            <Button size="small" onClick={() => handleResetDeck(deck._id, resetDeck, refetch)}>
              Reset All Cards
            </Button>
          </Table.HeaderCell>
        </Table.Row>
      </Table.Footer>
    );

    const tableBody = (
      <Table.Body>
        {cardsList
          && cardsList.map((card) => {
            return (
              <Table.Row key={card._id}>
                <Table.Cell>{truncate(card._id, { length: 6 })}</Table.Cell>
                <Table.Cell>{truncate(card.front, { length: 50 })}</Table.Cell>
                <Table.Cell>
                  <Markdown>{truncate(card.back, { length: 50 })}</Markdown>
                </Table.Cell>
                <Table.Cell>{moment(card.dueDate).format('DD.MM.YYYY HH:mm:ss')}</Table.Cell>
                <Table.Cell>{card.state}</Table.Cell>
                <Table.Cell>{card.tags}</Table.Cell>
                <Table.Cell textAlign="right">
                  <Modal
                    trigger={(
                      <Button compact size="mini" primary name={'editCard' + card._id}>
                        Edit
                      </Button>
                    )}
                  >
                    <EditCardModal card={card} refetch={refetch} />
                  </Modal>
                  <Button
                    name={'deleteCard_' + card._id}
                    compact
                    size="mini"
                    color="red"
                    onClick={() => handleDeleteCard(card._id, deleteCard, refetch)}
                  >
                    Delete
                  </Button>
                  <Button
                    name={'resetCard_' + card._id}
                    compact
                    size="mini"
                    secondary
                    onClick={() => handleResetCard(card._id, resetCard, refetch)}
                  >
                    Reset
                  </Button>
                </Table.Cell>
              </Table.Row>
            );
          })}
      </Table.Body>
    );

    return (
      <>
        <Modal
          trigger={(
            <Button name="addCardButton" size="small" primary>
              Add Card
            </Button>
          )}
        >
          <AddCardModal deck={deck} refetch={refetch} />
        </Modal>
        <Button
          name={'deleteDeck_' + deck._id}
          compact
          secondary
          floated="right"
          onClick={() => handleDeleteDeck(deck._id, deleteDeck, refetch, history)}
        >
          Delete Deck
        </Button>
        <Divider />
        <Responsive minWidth={768}>
          <Table celled striped compact>
            {tableHeader}
            {tableBody}
            {tableFooter}
          </Table>
        </Responsive>
        <Responsive maxWidth={768}>
          <Table celled striped compact>
            {tableBody}
            {tableFooter}
          </Table>
        </Responsive>
      </>
    );
  } else {
    return <LoadingIndicator />;
  }
};

export default CardsTable;
