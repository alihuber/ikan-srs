import React from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/react-hooks';
import { Modal } from 'semantic-ui-react';
import { toast } from 'react-toastify';
import SimpleSchema from 'simpl-schema';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import { AutoForm, ErrorField, LongTextField, SubmitField } from 'uniforms-semantic';
import { UPDATE_CARD_MUTATION } from '../../../api/decks/constants';

const editCardSchema = new SimpleSchema({
  front: {
    type: String,
    min: 1,
  },
  back: {
    type: String,
    min: 1,
  },
});

const bridge = new SimpleSchema2Bridge(editCardSchema);

const handleSubmit = (values, updateCard, refetch, cardId) => {
  const { front, back } = values;
  if (front && back && cardId) {
    updateCard({ variables: { cardId, front, back } })
      .then(() => {
        refetch();
        toast.success('Card updated!', {
          position: toast.POSITION.BOTTOM_CENTER,
        });
      })
      .catch((error) => {
        console.log(error);
        toast.error('Card update error!', {
          position: toast.POSITION.BOTTOM_CENTER,
        });
      });
  } else {
    toast.error('Card update error!', {
      position: toast.POSITION.BOTTOM_CENTER,
    });
  }
};

const EditCardModal = ({ refetch, card }) => {
  const [updateCard, _] = useMutation(UPDATE_CARD_MUTATION);
  const model = { front: card.front, back: card.back };
  return (
    <Modal.Content>
      <AutoForm schema={bridge} onSubmit={(doc) => handleSubmit(doc, updateCard, refetch, card._id)} model={model}>
        <h4>Edit card</h4>
        <LongTextField name="front" />
        <ErrorField name="front" errorMessage="Front is required" />
        <LongTextField name="back" />
        <ErrorField name="back" errorMessage="Back is required" />
        <SubmitField />
      </AutoForm>
    </Modal.Content>
  );
};

EditCardModal.propTypes = {
  refetch: PropTypes.func.isRequired,
  card: PropTypes.object.isRequired,
};

export default EditCardModal;
