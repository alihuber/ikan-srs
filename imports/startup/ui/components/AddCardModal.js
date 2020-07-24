import React from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/client';
import { Modal } from 'semantic-ui-react';
import { toast } from 'react-toastify';
import SimpleSchema from 'simpl-schema';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import { AutoForm, ErrorField, LongTextField, SelectField, SubmitField } from 'uniforms-semantic';
import { ADD_CARD_MUTATION } from '../../../api/decks/constants';

const addCardSchema = new SimpleSchema({
  deckId: {
    type: String,
    optional: true,
  },
  front: {
    type: String,
    min: 1,
  },
  back: {
    type: String,
    min: 1,
  },
});

const bridge = new SimpleSchema2Bridge(addCardSchema);

const handleSubmit = (values, addCard, refetch, deck) => {
  const { front, back } = values;
  let { deckId } = values;
  if (!deckId && deck) {
    deckId = deck._id;
  }
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
  } else {
    toast.error('Card add error!', {
      position: toast.POSITION.BOTTOM_CENTER,
    });
  }
};

const AddCardModal = ({ refetch, decks, deck }) => {
  const [addCard, _] = useMutation(ADD_CARD_MUTATION);
  let deckOptions;
  if (decks) {
    deckOptions = decks.map((dk) => {
      return { label: dk.name, value: dk._id };
    });
  }
  return (
    <Modal.Content>
      <AutoForm schema={bridge} onSubmit={(doc) => handleSubmit(doc, addCard, refetch, deck)}>
        <h4>Add card</h4>
        {deck ? null : <SelectField name="deckId" options={deckOptions} />}
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
  decks: PropTypes.array,
  deck: PropTypes.object,
};

export default AddCardModal;
