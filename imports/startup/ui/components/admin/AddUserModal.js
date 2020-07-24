import React from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/client';
import { Modal } from 'semantic-ui-react';
import { toast } from 'react-toastify';
import SimpleSchema from 'simpl-schema';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import { AutoForm } from 'uniforms-semantic';
import { CREATE_USER_MUTATION } from '../../../../api/users/constants';

const addUserSchema = new SimpleSchema({
  username: {
    type: String,
    min: 3,
  },
  password: {
    type: String,
    min: 8,
    uniforms: {
      type: 'password',
    },
  },
  admin: {
    type: Boolean,
    optional: true,
  },
});

const bridge = new SimpleSchema2Bridge(addUserSchema);

const handleSubmit = (values, createUser, refetch, setPageNum, onClose) => {
  const admin = values.admin || false;
  const { username, password } = values;
  if (username && password) {
    createUser({ variables: { username, password, admin } })
      .then(() => {
        refetch();
        setPageNum(0);
        onClose();
        toast.success('Creation successful!', {
          position: toast.POSITION.BOTTOM_CENTER,
        });
      })
      .catch((error) => {
        console.log(error);
        toast.error('Creation error!', {
          position: toast.POSITION.BOTTOM_CENTER,
        });
      })
      .finally(() => {
        setPageNum(0);
      });
  }
};

const AddUserModal = ({ refetch, setPageNum, open, onClose }) => {
  const [createUser, _] = useMutation(CREATE_USER_MUTATION);
  return (
    <Modal size="small" open={open} onClose={onClose}>
      <Modal.Header>Add user</Modal.Header>
      <Modal.Content>
        <AutoForm schema={bridge} onSubmit={(doc) => handleSubmit(doc, createUser, refetch, setPageNum, onClose)} />
      </Modal.Content>
    </Modal>
  );
};

AddUserModal.propTypes = {
  refetch: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  setPageNum: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

export default AddUserModal;
