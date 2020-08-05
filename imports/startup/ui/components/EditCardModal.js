import React, { useState } from 'react';
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
import { AutoForm, ErrorField, SubmitField } from 'uniforms-semantic';
import { UPDATE_CARD_MUTATION } from '../../../api/decks/constants';

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
  const [model, setModel] = useState(card);
  const handleFrontChange = ({ text }) => {
    setModel({ ...model, front: text });
  };
  const handleBackChange = ({ text }) => {
    setModel({ ...model, back: text });
  };

  return (
    <Modal.Content>
      <AutoForm schema={bridge} onSubmit={(doc) => handleSubmit(doc, updateCard, refetch, card._id)} model={model}>
        <h4>Edit card</h4>
        <label><b>Front*</b></label>
        <MdEditor
          style={{ height: '500px' }}
          renderHTML={(text) => mdParser.render(text)}
          onChange={handleFrontChange}
          value={model.front}
        />
        <ErrorField name="front" errorMessage="Front is required" />
        <label><b>Back*</b></label>
        <MdEditor
          style={{ height: '500px' }}
          renderHTML={(text) => mdParser.render(text)}
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

EditCardModal.propTypes = {
  refetch: PropTypes.func.isRequired,
  card: PropTypes.object.isRequired,
};

export default EditCardModal;
