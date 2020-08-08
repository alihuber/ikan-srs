import React from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/client';
import { Modal } from 'semantic-ui-react';
import { toast } from 'react-toastify';
import SimpleSchema from 'simpl-schema';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import { AutoForm } from 'uniforms-semantic';
import { UPDATE_USER_MUTATION } from '../../../../api/users/constants';

const editUserSchema = new SimpleSchema({
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
    optional: true,
  },
  admin: {
    type: Boolean,
    optional: true,
  },
});

const bridge = new SimpleSchema2Bridge(editUserSchema);

const handleSubmit = (values, userId, updateUser, refetch) => {
  const { username, password, admin } = values;
  const update = {
    userId,
    username,
    password,
    admin: admin || false,
  };
  updateUser({ variables: update })
    .then(() => {
      refetch();
      toast.success('Update successful!', {
        position: toast.POSITION.BOTTOM_CENTER,
      });
    })
    .catch((error) => {
      console.log(error);
      toast.error('Update error!', {
        position: toast.POSITION.BOTTOM_CENTER,
      });
    });
};

const EditUserModal = ({ userId, username, admin, refetch }) => {
  const [updateUser, _] = useMutation(UPDATE_USER_MUTATION);
  const model = { username, admin };
  return (
    <Modal.Content>
      <AutoForm schema={bridge} onSubmit={(doc) => handleSubmit(doc, userId, updateUser, refetch)} model={model} />
    </Modal.Content>
  );
};

EditUserModal.propTypes = {
  refetch: PropTypes.func.isRequired,
  admin: PropTypes.bool,
  username: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
};

export default EditUserModal;
