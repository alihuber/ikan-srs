import React from 'react';
import { Button, Table, Modal, Icon } from 'semantic-ui-react';
import truncate from 'lodash/truncate';
import PropTypes from 'prop-types';
import moment from 'moment';
import EditCardModal from './EditCardModal';

export const CardRow = ({ card, handleDeleteCard, deleteCard, handleResetCard, resetCard, refetch }) => {
  return (
    <Table.Row>
      <Table.Cell>{truncate(card._id, { length: 6 })}</Table.Cell>
      <Table.Cell>{truncate(card.front, { length: 50 })}</Table.Cell>
      <Table.Cell>{truncate(card.back, { length: 50 })}</Table.Cell>
      <Table.Cell>{moment(card.dueDate).format('DD.MM.YYYY HH:mm:ss')}</Table.Cell>
      <Table.Cell>{card.state}</Table.Cell>
      <Table.Cell>{card.tags}</Table.Cell>
      <Table.Cell>
        <Modal
          trigger={(
            <Button
              compact
              size="mini"
              icon
              primary
              name={'editCard' + card._id}
            >
              <Icon name="edit" />
            </Button>
          )}
        >
          <EditCardModal card={card} refetch={refetch} />
        </Modal>
        <Button
          name={'deleteCard_' + card._id}
          icon
          compact
          size="mini"
          color="red"
          onClick={() => handleDeleteCard(card._id, deleteCard, refetch)}
        >
          <Icon name="trash" />
        </Button>
        <Button
          name={'resetCard_' + card._id}
          icon
          compact
          size="mini"
          secondary
          onClick={() => handleResetCard(card._id, resetCard, refetch)}
        >
          <Icon name="history" />
        </Button>
      </Table.Cell>

    </Table.Row>
  );
};

CardRow.propTypes = {
  card: PropTypes.object.isRequired,
  handleDeleteCard: PropTypes.func.isRequired,
  deleteCard: PropTypes.func.isRequired,
  handleResetCard: PropTypes.func.isRequired,
  resetCard: PropTypes.func.isRequired,
  refetch: PropTypes.func.isRequired,
};
