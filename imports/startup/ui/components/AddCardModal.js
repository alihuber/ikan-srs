import React, { useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/client';
import { Modal } from 'semantic-ui-react';
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
    // TODO: make dependent from where dialog is launched
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
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' });
  const [model, setModel] = useState({ front: '', back: '' });
  const editorHeight = isTabletOrMobile ? '200px' : '500px';
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
    <Modal.Content>
      <AutoForm schema={bridge} onSubmit={(doc) => handleSubmit(doc, addCard, refetch, deck)} model={model}>
        <h4>Add card</h4>
        {deck ? null : <SelectField name="deckId" options={deckOptions} />}
        <label><b>Front*</b></label>
        <MdEditor
          style={{ height: editorHeight }}
          renderHTML={(text) => mdParser.render(text)}
          onImageUpload={handleImageUpload}
          onChange={handleFrontChange}
          value={model.front}
        />
        <ErrorField name="front" errorMessage="Front is required" />
        <label><b>Back*</b></label>
        <MdEditor
          style={{ height: editorHeight }}
          renderHTML={(text) => mdParser.render(text)}
          onImageUpload={handleImageUpload}
          onChange={handleBackChange}
          value={model.back}
        />
        <ErrorField name="back" errorMessage="Back is required" />
        <br />
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
