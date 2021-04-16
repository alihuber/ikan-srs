import React from 'react';
import { Button, Table, Modal, Icon } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import format from 'date-fns/format';
import EditUserModal from './EditUserModal';

export const UserRow = ({ user, handleDelete, refetch, setPageNum }) => {
  return (
    <Table.Row>
      <Table.Cell>{user._id}</Table.Cell>
      <Table.Cell>{user.username}</Table.Cell>
      <Table.Cell>
        {format(new Date(user.createdAt), 'dd.MM.yyyy HH:mm')}
      </Table.Cell>
      <Table.Cell>{user.admin ? <Icon name="check" /> : ''}</Table.Cell>
      <Table.Cell collapsing textAlign="right">
        <Modal
          trigger={
            <Button compact size="mini" primary name={'editUser_' + user._id}>
              Edit
            </Button>
          }
        >
          <EditUserModal
            userId={user._id}
            username={user.username}
            admin={user.admin}
            refetch={refetch}
            setPageNum={setPageNum}
          />
        </Modal>
        <Button
          name={'deleteUser_' + user._id}
          compact
          size="mini"
          secondary
          onClick={() => handleDelete(user._id)}
        >
          Delete
        </Button>
      </Table.Cell>
    </Table.Row>
  );
};

UserRow.propTypes = {
  user: PropTypes.object.isRequired,
  handleDelete: PropTypes.func.isRequired,
  refetch: PropTypes.func.isRequired,
  setPageNum: PropTypes.func.isRequired,
};
