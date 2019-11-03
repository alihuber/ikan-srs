import React from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/react-hooks';
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

const handleSubmit = (values, createUser, refetch, setPageNum) => {
  const admin = values.admin || false;
  const { username, password } = values;
  if (username && password) {
    createUser({ variables: { username, password, admin } })
      .then(() => {
        refetch();
        setPageNum(0);
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

const AddUserModal = ({ refetch, setPageNum }) => {
  const [createUser, _] = useMutation(CREATE_USER_MUTATION);
  return (
    <Modal.Content>
      <AutoForm schema={bridge} onSubmit={(doc) => handleSubmit(doc, createUser, refetch, setPageNum)} />
    </Modal.Content>
  );
};

AddUserModal.propTypes = {
  refetch: PropTypes.func.isRequired,
  setPageNum: PropTypes.func.isRequired,
};

export default AddUserModal;
