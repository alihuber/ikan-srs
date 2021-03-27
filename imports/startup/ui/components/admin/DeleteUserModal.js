import React from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { Button, Modal } from 'semantic-ui-react';

const DeleteUserModal = ({
  setPageNum,
  userToDelete,
  open,
  onClose,
  deleteUserFunc,
  refetch,
}) => {
  const onDelete = () => {
    deleteUserFunc({ variables: { userId: userToDelete } }).then(() => {
      refetch();
      setPageNum(0);
      toast.success('Deletion successful!', {
        position: toast.POSITION.BOTTOM_CENTER,
      });
    });
    onClose();
  };

  return (
    <Modal size="mini" open={open} onClose={onClose}>
      <Modal.Header>Delete user</Modal.Header>
      <Modal.Content>
        <p>Are you sure you want to delete this user?</p>
      </Modal.Content>
      <Modal.Actions>
        <Button negative onClick={onClose}>
          No
        </Button>
        <Button name="deleteUserOk" positive onClick={onDelete}>
          Yes
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

DeleteUserModal.propTypes = {
  userToDelete: PropTypes.string,
  refetch: PropTypes.func.isRequired,
  setPageNum: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  deleteUserFunc: PropTypes.func.isRequired,
};

export default DeleteUserModal;
