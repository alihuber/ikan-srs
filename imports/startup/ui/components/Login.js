import { Meteor } from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';
import AutoForm from 'uniforms/AutoForm';
import TextField from 'uniforms-unstyled/TextField';
import ErrorField from 'uniforms-unstyled/ErrorField';
import SubmitField from 'uniforms-unstyled/SubmitField';
import { toast } from 'react-toastify';
import { Grid, Row, Col } from 'react-flexbox-grid';
import SimpleSchema from 'simpl-schema';

const loginSchema = new SimpleSchema({
  username: {
    type: String,
    min: 3,
  },
  password: {
    type: String,
    min: 8,
  },
});

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

const Login = ({ routeProps }) => {
  return (
    <Grid fluid>
      <Row center="xs">
        <Col xs={12} sm={12} md={6} lg={6}>
          <AutoForm schema={loginSchema} onSubmit={doc => handleSubmit(doc, routeProps.history)}>
            <h3>
              Login
            </h3>
            <TextField name="username" />
            <ErrorField name="username" />
            <TextField type="password" name="password" />
            <ErrorField name="password" />
            <div>
              <SubmitField
                type="submit" variant="contained" color="primary" onClick={handleSubmit} inputRef={ref => { }}
              />
            </div>
          </AutoForm>
        </Col>
      </Row>
    </Grid>
  );
};

Login.propTypes = {
  routeProps: PropTypes.object.isRequired,
};

export default Login;
