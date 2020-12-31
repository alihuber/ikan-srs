import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/client';
import { Modal, Button } from 'semantic-ui-react';
import { toast } from 'react-toastify';
import SimpleSchema from 'simpl-schema';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-light.css';
import { AutoForm, ErrorField, SelectField, SubmitField } from 'uniforms-semantic';
import { ADD_CARD_MUTATION } from '../../../api/decks/constants';

const addCardSchema = new SimpleSchema({
  deckId: {
    type: String,
    optional: true,
    label: 'Deck name',
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

const mdParser = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value;
      } catch (__) { /* nothing */ }
    }
    return '';
  },
});

const handleSubmit = (values, addCard, refetch, deck, onClose, setOpen, setModel) => {
  const { front, back } = values;
  let { deckId } = values;
  if (!deckId && deck) {
    deckId = deck._id;
  }
  if (front && back && deckId) {
    addCard({ variables: { deckId, front, back } })
      .then(() => {
        refetch();
        onClose && onClose();
        setOpen(false);
        setModel({ front: '', back: '', deckId: '' });
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

const AddCardModal = ({ refetch, decks, deck, onClose }) => {
  // eslint-disable-next-line no-unused-vars
  const [addCard, _] = useMutation(ADD_CARD_MUTATION);
  const location = useLocation();
  const onEditScreen = location.pathname.includes('editDeck');
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' });
  const [model, setModel] = useState({ front: '', back: '', deckId: '' });
  const [open, setOpen] = useState(false);
  const editorHeight = isTabletOrMobile ? '200px' : '300px';
  let deckOptions;
  if (decks) {
    deckOptions = decks.map((dk) => {
      return { label: dk.name, value: dk._id };
    });
  }
  const handleFrontChange = ({ text }) => {
    setModel({ ...model, front: text });
  };
  const handleBackChange = ({ text }) => {
    setModel({ ...model, back: text });
  };

  const handleImageUpload = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (data) => {
        resolve(data.target.result);
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <Modal
      open={open}
      onClose={() => { setOpen(false); setModel({ front: '', back: '' }); }}
      trigger={(
        onEditScreen ? (
          <Button
            compact
            name="addCardButton"
            size="small"
            primary
            floated="left"
            onClick={() => setOpen(true)}
          >
            Add Card
          </Button>
        ) : (
          <Button
            compact
            name="addCardButton"
            size="small"
            secondary
            floated="right"
            onClick={() => setOpen(true)}
          >
            Add Card
          </Button>
        )
      )}
    >
      <Modal.Content>
        <AutoForm schema={bridge} onSubmit={(doc) => handleSubmit(doc, addCard, refetch, deck, onClose, setOpen, setModel)} model={model}>
          <h4>Add card</h4>
          {deck ? null : <SelectField onChange={(v) => { setModel({ ...model, deckId: v }); }} name="deckId" options={deckOptions} value={model.deckId} />}
          <b>Front*</b>
          <MdEditor
            style={{ height: editorHeight }}
            renderHTML={(text) => mdParser.render(text)}
            onImageUpload={handleImageUpload}
            onChange={handleFrontChange}
            value={model.front}
          />
          <ErrorField name="front" errorMessage="Front is required" />
          <b>Back*</b>
          <MdEditor
            style={{ height: editorHeight }}
            renderHTML={(text) => mdParser.render(text)}
            onImageUpload={handleImageUpload}
            onChange={handleBackChange}
            value={model.back}
          />
          <ErrorField name="back" errorMessage="Back is required" />
          <br />
          <SubmitField value="Submit" />
        </AutoForm>
      </Modal.Content>
    </Modal>
  );
};

AddCardModal.propTypes = {
  refetch: PropTypes.func.isRequired,
  decks: PropTypes.array,
  deck: PropTypes.object,
  onClose: PropTypes.func,
};

export default AddCardModal;
