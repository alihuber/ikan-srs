import { Meteor } from 'meteor/meteor';
import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { AutoFields, AutoForm, ErrorsField, SubmitField } from 'uniforms-semantic';
import { Container, Grid, Header, Segment } from 'semantic-ui-react';
import { toast } from 'react-toastify';
import SimpleSchema from 'simpl-schema';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import AnimContext from '../contexts/AnimContext';

const loginSchema = new SimpleSchema({
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
});

const bridge = new SimpleSchema2Bridge(loginSchema);

const handleLogin = (history) => {
  history.push('/login');
};

const handleDecks = (history) => {
  history.push('/decks');
};

const handleSubmit = (values, history) => {
  if (values.username && values.password) {
    Meteor.loginWithPassword(values.username, values.password, (err) => {
      if (err) {
        console.log(err);
        toast.error('Login error!', {
          position: toast.POSITION.BOTTOM_CENTER,
        });
        handleLogin(history);
      } else {
        toast.success('Login successful!', {
          position: toast.POSITION.BOTTOM_CENTER,
        });
        handleDecks(history);
      }
    });
  }
};

const Login = () => {
  const animClass = useContext(AnimContext);
  const history = useHistory();
  return (
    <div className={animClass}>
      <Container text style={{ paddingTop: '4em' }}>
        <Grid verticalAlign="middle">
          <Grid.Column width={2} only="computer" />
          <Grid.Column computer={12} mobile={16} tablet={16}>
            <Header size="large" color="teal" textAlign="center">
              Log in
            </Header>
            <Segment>
              <AutoForm schema={bridge} onSubmit={(doc) => handleSubmit(doc, history)}>
                <AutoFields />
                <ErrorsField />
                <br />
                <SubmitField value="Submit" />
              </AutoForm>
            </Segment>
          </Grid.Column>
          <Grid.Column width={2} only="computer" />
        </Grid>
      </Container>
    </div>
  );
};

export default Login;
