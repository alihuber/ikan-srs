import React from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/client';
import { Modal } from 'semantic-ui-react';
import { toast } from 'react-toastify';
import SimpleSchema from 'simpl-schema';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import { AutoForm } from 'uniforms-semantic';
import submitField from '../CustomSubmitField';
import { CREATE_DECK_MUTATION } from '../../../../api/decks/constants';

const createDeckSchema = new SimpleSchema({
  name: {
    type: String,
    min: 3,
  },
});

const bridge = new SimpleSchema2Bridge(createDeckSchema);

const handleSubmit = (values, createDeck, refetch, setAddOpen) => {
  const name = values.name;
  if (name) {
    createDeck({ variables: { name } })
      .then(() => {
        refetch();
        setAddOpen(false);
        toast.success('Creation successful!', {
          position: toast.POSITION.BOTTOM_CENTER,
        });
      })
      .catch((error) => {
        console.log(error);
        toast.error('Creation error!', {
          position: toast.POSITION.BOTTOM_CENTER,
        });
      });
  }
};

const AddDeckModal = ({ refetch, setAddOpen }) => {
  // eslint-disable-next-line no-unused-vars
  const [createDeck, _] = useMutation(CREATE_DECK_MUTATION);
  return (
    <Modal.Content>
      <AutoForm
        submitField={submitField}
        schema={bridge}
        onSubmit={(doc) => handleSubmit(doc, createDeck, refetch, setAddOpen)}
      />
    </Modal.Content>
  );
};

AddDeckModal.propTypes = {
  refetch: PropTypes.func.isRequired,
  setAddOpen: PropTypes.func.isRequired,
};

export default AddDeckModal;
