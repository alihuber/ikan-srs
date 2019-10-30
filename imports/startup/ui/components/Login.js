import { Meteor } from 'meteor/meteor';
import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { AutoFields, AutoForm, ErrorsField, SubmitField } from 'uniforms-semantic';
import { Grid, Header, Segment } from 'semantic-ui-react';
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

const handleHome = (history) => {
  history.push('/');
};

const handleSubmit = (values, history) => {
  if (values.username && values.password) {
    Meteor.loginWithPassword(values.username, values.password, (err) => {
      if (err) {
        console.log(err);
        toast.error('Login error!', {
          position: toast.POSITION.BOTTOM_CENTER,
        });
      } else {
        toast.success('Login successful!', {
          position: toast.POSITION.BOTTOM_CENTER,
        });
        handleHome(history);
      }
    });
  }
};

const Login = () => {
  const animClass = useContext(AnimContext);
  const history = useHistory();
  return (
    <div className={animClass}>
      <Grid textAlign="center" style={{ height: '50vh' }} verticalAlign="middle">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h2" color="teal" textAlign="center">
            Log in
          </Header>
          <Segment>
            <AutoForm schema={bridge} onSubmit={(doc) => handleSubmit(doc, history)}>
              <AutoFields />
              <ErrorsField />
              <br />
              <SubmitField />
            </AutoForm>
          </Segment>
        </Grid.Column>
      </Grid>
    </div>
  );
};

export default Login;
