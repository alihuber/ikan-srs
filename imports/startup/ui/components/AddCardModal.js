import React from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/react-hooks';
import { Modal } from 'semantic-ui-react';
import { toast } from 'react-toastify';
import SimpleSchema from 'simpl-schema';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import { AutoForm, ErrorField, LongTextField, SelectField, SubmitField } from 'uniforms-semantic';
import { ADD_CARD_MUTATION } from '../../../api/decks/constants';

const addCardSchema = new SimpleSchema({
  deckId: {
    type: String,
  },
  front: {
    type: String,
    min: 3,
  },
  back: {
    type: String,
    min: 3,
  },
});

const bridge = new SimpleSchema2Bridge(addCardSchema);

const handleSubmit = (values, addCard, refetch) => {
  const { front, back, deckId } = values;
  if (front && back && deckId) {
    addCard({ variables: { deckId, front, back } })
      .then(() => {
        refetch();
        toast.success('Card added!', {
          position: toast.POSITION.BOTTOM_CENTER,
        });
      })
      .catch((error) => {
        console.log(error);
        toast.error('Card add error!', {
          position: toast.POSITION.BOTTOM_CENTER,
        });
      });
  }
};

const AddCardModal = ({ refetch, decks }) => {
  const [addCard, _] = useMutation(ADD_CARD_MUTATION);
  const deckOptions = decks.map((deck) => {
    return { label: deck.name, value: deck._id };
  });
  return (
    <Modal.Content>
      <AutoForm schema={bridge} onSubmit={(doc) => handleSubmit(doc, addCard, refetch)}>
        <h4>Add card</h4>
        <SelectField name="deckId" options={deckOptions} />
        <LongTextField name="front" />
        <ErrorField name="front" errorMessage="Front is required" />
        <LongTextField name="back" />
        <ErrorField name="back" errorMessage="Back is required" />
        <SubmitField />
      </AutoForm>
    </Modal.Content>
  );
};

AddCardModal.propTypes = {
  refetch: PropTypes.func.isRequired,
  decks: PropTypes.array.isRequired,
};

export default AddCardModal;
