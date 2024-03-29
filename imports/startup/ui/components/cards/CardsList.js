import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { Button, Divider, Segment, Modal, Confirm } from 'semantic-ui-react';
import sift from 'sift';
import debounce from 'lodash/debounce';
import TableFilter from '../TableFilter';
import CardsTable from './CardsTable';
import LoadingIndicator from '../../LoadingIndicator';
import AddCardModal from './AddCardModal';
import RenameDeckModal from '../decks/RenameDeckModal';
import {
  CARDS_FOR_DECK_QUERY,
  DELETE_DECK_MUTATION,
  DELETE_CARD_MUTATION,
  RESET_CARD_MUTATION,
  RESET_DECK_MUTATION,
} from '../../../../api/decks/constants';

const CardsList = ({ deck }) => {
  const navigate = useNavigate();
  const params = useParams();
  const deckId = params.deckId;
  const [pageNum, setPageNum] = useState(1);
  const { data, loading, refetch, fetchMore } = useQuery(CARDS_FOR_DECK_QUERY, {
    notifyOnNetworkStatusChange: true,
    variables: { deckId },
  });
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState('asc');
  const [limit, setLimit] = useState(10);
  const [q, setQ] = useState('');
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteCardConfirmOpen, setDeleteCardConfirmOpen] = useState(false);
  const [deleteCardId, setDeleteCardId] = useState('');
  const [resetCardConfirmOpen, setResetCardConfirmOpen] = useState(false);
  const [resetCardId, setResetCardId] = useState('');
  const [resetDeckConfirmOpen, setResetDeckConfirmOpen] = useState(false);
  const [resetDeckId, setResetDeckId] = useState('');
  const [deleteDeckConfirmOpen, setDeleteDeckConfirmOpen] = useState(false);
  const [deleteDeckId, setDeleteDeckId] = useState('');

  const [cardsList, setCardsList] = useState(
    data?.cardsForDeck?.cardsList || []
  );

  useEffect(() => {
    if (data && data.cardsForDeck && data.cardsForDeck.cardsList) {
      if (q.length !== 0) {
        const filtered = data.cardsForDeck.cardsList.filter(
          sift({
            $or: [{ front: { $regex: q } }, { back: { $regex: q } }],
          })
        );
        setCardsList(filtered);
      } else {
        setCardsList(data.cardsForDeck.cardsList);
      }
    }
  }, [JSON.stringify(data?.cardsForDeck?.cardsList)]);

  const directionConverter = (ord) => {
    if (ord === 'asc') {
      return 'ascending';
    } else if (ord === 'desc') {
      return 'descending';
    } else {
      return null;
    }
  };

  const handleSort = (clickedColumn) => {
    let newOrder = order === 'asc' ? 'desc' : 'asc';
    if (sort !== clickedColumn) {
      newOrder = 'asc';
    }
    fetchMore({
      variables: {
        perPage: parseInt(limit, 10),
        q,
        order: newOrder,
        sort: clickedColumn,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return fetchMoreResult;
      },
    });
    setOrder(newOrder);
    setSort(clickedColumn);
  };

  const submitFilter = (filter) => {
    if (filter !== q) {
      fetchMore({
        variables: {
          perPage: parseInt(limit, 10),
          q: filter,
          order,
          sort,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return fetchMoreResult;
        },
      });
    }
    setQ(filter);
  };
  const onSubmitFilter = debounce(submitFilter, 500);

  const onChangeLimit = (event, dt) => {
    if (parseInt(dt.value, 10) !== limit) {
      fetchMore({
        variables: {
          perPage: parseInt(dt.value, 10),
          q,
          order,
          sort,
          pageNum,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return fetchMoreResult;
        },
      });
      setLimit(parseInt(dt.value, 10));
    }
  };

  const handleChangePage = (_, dt) => {
    fetchMore({
      variables: {
        perPage: parseInt(limit, 10),
        q: q || '',
        order,
        sort,
        pageNum: dt.activePage,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return fetchMoreResult;
      },
    });
    setPageNum(dt.activePage);
  };

  // eslint-disable-next-line no-unused-vars
  const [deleteDeck, _] = useMutation(DELETE_DECK_MUTATION);
  const handleDeleteDeck = (dckId) => {
    setDeleteDeckConfirmOpen(true);
    setDeleteDeckId(dckId);
  };
  const handleDeleteDeckConfirm = () => {
    const dckId = deleteDeckId;
    deleteDeck({ variables: { deckId: dckId } }).then(() => {
      refetch();
      setDeleteDeckConfirmOpen(false);
      setDeleteDeckId('');
      navigate('/decks');
      toast.success('Deletion successful!', {
        position: toast.POSITION.BOTTOM_CENTER,
      });
    });
  };
  const handleCancelDeleteDeckConfirm = () => {
    setDeleteDeckConfirmOpen(false);
    setDeleteDeckId('');
  };

  // eslint-disable-next-line no-unused-vars
  const [deleteCard, __] = useMutation(DELETE_CARD_MUTATION);
  const handleDeleteCard = (cardId) => {
    setDeleteCardConfirmOpen(true);
    setDeleteCardId(cardId);
  };
  const handleDeleteCardConfirm = () => {
    const cardId = deleteCardId;
    deleteCard({ variables: { cardId } }).then(() => {
      refetch();
      setPageNum(0);
      onChangeLimit(null, { value: 10 });
      setDeleteCardConfirmOpen(false);
      setDeleteCardId('');
      submitFilter('');
      setQ('');
      toast.success('Deletion successful!', {
        position: toast.POSITION.BOTTOM_CENTER,
      });
    });
  };
  const handleCancelDeleteCardConfirm = () => {
    setDeleteCardConfirmOpen(false);
    setDeleteCardId('');
  };

  // eslint-disable-next-line no-unused-vars
  const [resetCard, ___] = useMutation(RESET_CARD_MUTATION);
  const handleResetCard = (cardId) => {
    setResetCardConfirmOpen(true);
    setResetCardId(cardId);
  };
  const handleResetCardConfirm = () => {
    const cardId = resetCardId;
    resetCard({ variables: { cardId } }).then(() => {
      refetch();
      setPageNum(0);
      setResetCardConfirmOpen(false);
      setResetCardId('');
      toast.success('Card reset successful!', {
        position: toast.POSITION.BOTTOM_CENTER,
      });
    });
  };
  const handleCancelResetCardConfirm = () => {
    setResetCardConfirmOpen(false);
    setResetCardId('');
  };

  // eslint-disable-next-line no-unused-vars
  const [resetDeck, ____] = useMutation(RESET_DECK_MUTATION);
  const handleResetDeck = (dckId) => {
    setResetDeckConfirmOpen(true);
    setResetDeckId(dckId);
  };
  const handleResetDeckConfirm = () => {
    const dckId = resetDeckId;
    resetDeck({ variables: { deckId: dckId } }).then(() => {
      refetch();
      setPageNum(0);
      onChangeLimit(null, { value: 10 });
      setResetDeckConfirmOpen(false);
      setResetDeckId('');
      toast.success('Deck reset successful!', {
        position: toast.POSITION.BOTTOM_CENTER,
      });
    });
  };
  const handleCancelResetDeckConfirm = () => {
    setResetDeckConfirmOpen(false);
    setResetDeckId('');
  };

  const onAddClose = () => {
    setPageNum(0);
    onChangeLimit(null, { value: 10 });
  };

  if (data) {
    const cardsCount = data.cardsForDeck?.cardsCount;
    return (
      <>
        <div style={{ height: '33px' }}>
          <AddCardModal onClose={onAddClose} deck={deck} refetch={refetch} />
          <Modal
            open={renameOpen}
            onOpen={() => setRenameOpen(true)}
            onClose={() => setRenameOpen(false)}
            trigger={
              <Button compact name="renameDeckButton" size="small" primary>
                Rename Deck
              </Button>
            }
          >
            <RenameDeckModal
              deckId={deck._id}
              refetch={refetch}
              setRenameOpen={setRenameOpen}
            />
          </Modal>
          <Button
            name={'deleteDeck_' + deck._id}
            compact
            secondary
            floated="right"
            size="small"
            onClick={() => handleDeleteDeck(deck._id)}
          >
            Delete Deck
          </Button>
        </div>
        <Divider />
        <Segment>
          <TableFilter
            filter={q}
            totalCount={cardsList.length}
            onSubmitFilter={onSubmitFilter}
            loading={loading}
          />
          <Divider />
          {!loading ? (
            <CardsTable
              handleDeleteCard={handleDeleteCard}
              handleResetCard={handleResetCard}
              handleResetDeck={handleResetDeck}
              deckId={deck._id}
              refetch={refetch}
              setPageNum={setPageNum}
              cardsList={cardsList}
              totalCount={cardsCount}
              totalPages={Math.ceil(cardsCount / limit)}
              currentPage={pageNum}
              onChangePage={handleChangePage}
              column={sort}
              direction={directionConverter(order)}
              handleSort={handleSort}
              onChangeLimit={onChangeLimit}
              limit={limit.toString()}
            />
          ) : (
            <LoadingIndicator />
          )}
        </Segment>
        <Confirm
          open={deleteCardConfirmOpen}
          onCancel={handleCancelDeleteCardConfirm}
          onConfirm={handleDeleteCardConfirm}
          content={`Delete card with id ${deleteCardId}?`}
        />
        <Confirm
          open={resetCardConfirmOpen}
          onCancel={handleCancelResetCardConfirm}
          onConfirm={handleResetCardConfirm}
          content={`Reset card with id ${resetCardId}?`}
        />
        <Confirm
          open={resetDeckConfirmOpen}
          onCancel={handleCancelResetDeckConfirm}
          onConfirm={handleResetDeckConfirm}
          content="Reset deck?"
        />
        <Confirm
          open={deleteDeckConfirmOpen}
          onCancel={handleCancelDeleteDeckConfirm}
          onConfirm={handleDeleteDeckConfirm}
          content="Delete deck?"
        />
      </>
    );
  } else {
    return <LoadingIndicator />;
  }
};

export default CardsList;
