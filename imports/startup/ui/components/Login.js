import { Meteor } from 'meteor/meteor';
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import AutoForm from 'uniforms-material/AutoForm';
import TextField from 'uniforms-material/TextField';
import ErrorField from 'uniforms-material/ErrorField';
import SubmitField from 'uniforms-material/SubmitField';
import { toast } from 'react-toastify';
import { withStyles } from '@material-ui/core/styles';
import { Grid, Row, Col } from 'react-flexbox-grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import SimpleSchema from 'simpl-schema';
import LoadingContext from '../contexts/LoadingContext';

const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
  buttonContainer: {
    textAlign: 'left',
  },
  root: {
    flexGrow: 1,
  },
  control: {
    padding: theme.spacing.unit * 2,
    width: '100%',
  },
  paper: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
  },
});

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

const handleHome = (history, setLoading) => {
  setLoading(true);
  history.push('/');
};

const handleSubmit = (values, history, setLoading) => {
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
        handleHome(history, setLoading);
      }
    });
  }
};

const Login = ({ classes, routeProps }) => {
  const { loading, setLoading } = useContext(LoadingContext);
  if (loading) {
    setLoading(false);
  }
  return (
    <Grid fluid>
      <Row center="xs">
        <Col xs={12} sm={12} md={6} lg={6}>
          <Paper className={classes.paper}>
            <AutoForm schema={loginSchema} onSubmit={doc => handleSubmit(doc, routeProps.history, setLoading)}>
              <Typography variant="h3" gutterBottom>
                Login
              </Typography>
              <TextField name="username" />
              <ErrorField name="username" />
              <TextField type="password" name="password" />
              <ErrorField name="password" />
              <div className={classes.buttonContainer}>
                <SubmitField
                  type="submit" variant="contained" color="primary" onClick={handleSubmit}
                  className={classes.button}
                >
                  Login
                </SubmitField>
              </div>
            </AutoForm>
          </Paper>
        </Col>
      </Row>
    </Grid>
  );
};

Login.propTypes = {
  classes: PropTypes.object.isRequired,
  routeProps: PropTypes.object.isRequired,
};

export default withStyles(styles)(Login);
