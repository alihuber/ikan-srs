import React, { useContext, useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-light.css';
import {
  Divider,
  Card,
  Container,
  Grid,
  Header,
  Button,
} from 'semantic-ui-react';
import AnimContext from '../contexts/AnimContext';
import CurrentUserContext from '../contexts/CurrentUserContext';
import {
  NEXT_CARD_FOR_LEARNING_QUERY,
  ANSWER_CARD_MUTATION,
  NEXT_DUE_CARD_QUERY,
} from '../../../api/decks/constants';
import LoadingIndicator from '../LoadingIndicator';
import './learnCard.css';
import { scheduleNotificationForDeck } from '../../client';

const mdParser = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value;
      } catch (__) {
        /* nothing */
      }
    }
    return '';
  },
});

function renderHTML(text) {
  return mdParser.render(text);
}

const editorConfig = {
  view: {
    menu: false,
    md: false,
    html: true,
    fullScreen: false,
    hideMenu: true,
  },
  canView: {
    menu: false,
    md: false,
    html: true,
    fullScreen: false,
    hideMenu: true,
  },
};

const Learn = () => {
  const animClass = useContext(AnimContext);
  const navigate = useNavigate();
  const currentUser = useContext(CurrentUserContext);
  const { deckId } = useParams();
  // eslint-disable-next-line no-unused-vars
  const [answerCard, _] = useMutation(ANSWER_CARD_MUTATION);
  const { data, loading, refetch } = useQuery(NEXT_CARD_FOR_LEARNING_QUERY, {
    variables: { deckId },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'no-cache',
  });
  const {
    data: nextDueCardData,
    loading: nextDueCardLoading,
    refetch: nextDueCardRefetch,
  } = useQuery(NEXT_DUE_CARD_QUERY, {
    variables: { deckId },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'no-cache',
  });
  const [answerShown, setAnswerShown] = useState(false);

  const showAnswer = (
    <Button basic color="green" onClick={() => setAnswerShown(true)}>
      Show answer
    </Button>
  );

  const handleAnswer = (
    cardId,
    answerCardFunc,
    answer,
    reFetch,
    dueRefetch
  ) => {
    answerCardFunc({ variables: { cardId, answer } }).then(() => {
      reFetch();
      dueRefetch();
      setAnswerShown(false);
    });
  };

  const rateAnswer = (cardState, cardId) => {
    if (
      cardState === 'NEW' ||
      cardState === 'LEARNING' ||
      cardState === 'RELEARNING'
    ) {
      return (
        <>
          <Button
            basic
            color="red"
            onClick={() =>
              handleAnswer(
                cardId,
                answerCard,
                'again',
                refetch,
                nextDueCardRefetch
              )
            }
          >
            Again
          </Button>
          <Button
            basic
            color="blue"
            onClick={() =>
              handleAnswer(
                cardId,
                answerCard,
                'good',
                refetch,
                nextDueCardRefetch
              )
            }
          >
            Good
          </Button>
          <Button
            basic
            color="green"
            onClick={() =>
              handleAnswer(
                cardId,
                answerCard,
                'easy',
                refetch,
                nextDueCardRefetch
              )
            }
          >
            Easy
          </Button>
        </>
      );
    } else {
      return (
        <>
          <Button
            basic
            color="red"
            onClick={() =>
              handleAnswer(
                cardId,
                answerCard,
                'again',
                refetch,
                nextDueCardRefetch
              )
            }
          >
            Again
          </Button>
          <Button
            basic
            color="yellow"
            onClick={() =>
              handleAnswer(
                cardId,
                answerCard,
                'hard',
                refetch,
                nextDueCardRefetch
              )
            }
          >
            Hard
          </Button>
          <Button
            basic
            color="blue"
            onClick={() =>
              handleAnswer(
                cardId,
                answerCard,
                'good',
                refetch,
                nextDueCardRefetch
              )
            }
          >
            Good
          </Button>
          <Button
            basic
            color="green"
            onClick={() =>
              handleAnswer(
                cardId,
                answerCard,
                'easy',
                refetch,
                nextDueCardRefetch
              )
            }
          >
            Easy
          </Button>
        </>
      );
    }
  };

  useEffect(() => {
    if (currentUser && !currentUser._id) {
      navigate('/');
    }
  }, [currentUser]);

  if (currentUser && !currentUser._id) {
    return null;
  } else {
    if (loading || nextDueCardLoading) {
      return <LoadingIndicator />;
    }
    if (data) {
      const card = data.nextCardForLearning;
      if (
        Meteor.isCordova &&
        !card &&
        nextDueCardData &&
        nextDueCardData.nextDueCard
      ) {
        scheduleNotificationForDeck(nextDueCardData.nextDueCard.dueDate);
      }
      return (
        <div className={animClass}>
          <Container text style={{ paddingTop: '4em' }}>
            <Grid verticalAlign="middle">
              <Grid.Column>
                <Header size="large" color="teal" textAlign="center">
                  Learn
                </Header>
                {card ? (
                  <Card fluid>
                    <Card.Content>
                      <MdEditor
                        style={{ height: '200px' }}
                        renderHTML={() => renderHTML(card.front)}
                        readOnly
                        config={editorConfig}
                      />
                      <Divider />
                      {answerShown ? (
                        <MdEditor
                          style={{ height: '200px' }}
                          renderHTML={() => renderHTML(card.back)}
                          readOnly
                          config={editorConfig}
                        />
                      ) : null}
                    </Card.Content>
                    <Card.Content extra>
                      {answerShown
                        ? rateAnswer(card.state, card._id, refetch)
                        : showAnswer}
                    </Card.Content>
                  </Card>
                ) : (
                  'No cards left :)'
                )}
              </Grid.Column>
            </Grid>
          </Container>
        </div>
      );
    } else {
      return <LoadingIndicator />;
    }
  }
};

export default Learn;
