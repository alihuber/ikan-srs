import React from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/client';
import { Modal } from 'semantic-ui-react';
import { toast } from 'react-toastify';
import SimpleSchema from 'simpl-schema';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import { AutoForm } from 'uniforms-semantic';
import submitField from '../CustomSubmitField';
import { RENAME_DECK_MUTATION } from '../../../../api/decks/constants';

const renameDeckSchema = new SimpleSchema({
  name: {
    type: String,
    min: 3,
  },
});

const bridge = new SimpleSchema2Bridge(renameDeckSchema);

const handleSubmit = (values, deckId, renameDeck, refetch, setRenameOpen) => {
  const name = values.name;
  if (name) {
    renameDeck({ variables: { deckId, name } })
      .then(() => {
        refetch();
        setRenameOpen(false);
        toast.success('Rename successful!', {
          position: toast.POSITION.BOTTOM_CENTER,
        });
      })
      .catch((error) => {
        console.log(error);
        toast.error('Rename error!', {
          position: toast.POSITION.BOTTOM_CENTER,
        });
      });
  }
};

const RenameDeckModal = ({ deckId, refetch, setRenameOpen }) => {
  // eslint-disable-next-line no-unused-vars
  const [renameDeck, _] = useMutation(RENAME_DECK_MUTATION);
  return (
    <Modal.Content>
      <AutoForm
        submitField={submitField}
        schema={bridge}
        onSubmit={(doc) =>
          handleSubmit(doc, deckId, renameDeck, refetch, setRenameOpen)
        }
      />
    </Modal.Content>
  );
};

RenameDeckModal.propTypes = {
  refetch: PropTypes.func.isRequired,
  setRenameOpen: PropTypes.func.isRequired,
  deckId: PropTypes.string.isRequired,
};

export default RenameDeckModal;
