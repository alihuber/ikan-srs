import { Meteor } from 'meteor/meteor';
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { Form, Field, withFormik } from 'formik';
import { TextField } from 'formik-material-ui';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import { Grid, Row, Col } from 'react-flexbox-grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import * as Yup from 'yup';
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

const Login = ({ classes, isSubmitting, handleSubmit }) => {
  const { loading, setLoading } = useContext(LoadingContext);
  if (loading) {
    setLoading(false);
  }
  return (
    <Grid fluid>
      <Row center="xs">
        <Col xs={12} sm={12} md={6} lg={6}>
          <Paper className={classes.paper}>
            <Form>
              <Typography variant="h3" gutterBottom>
                Login
              </Typography>
              <Field
                type="username" name="username" placeholder="Username" component={TextField}
                className={classes.control}
              />
              <Field
                type="password" name="password" placeholder="Password" component={TextField}
                className={classes.control}
              />
              <div className={classes.buttonContainer}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  className={classes.button}
                >
                  Login
                </Button>
              </div>
            </Form>
          </Paper>
        </Col>
      </Row>
    </Grid>
  );
};

const handleHome = (history) => {
  // TODO: setLoading(true);
  history.push('/');
};

Login.propTypes = {
  isSubmitting: PropTypes.bool.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
};

const login = withFormik({
  mapPropsToValues({ username, password, routeProps }) {
    return {
      username: username || '',
      password: password || '',
      routeProps,
    };
  },
  validationSchema: Yup.object().shape({
    username: Yup.string()
      .min(3)
      .required(),
    password: Yup.string()
      .min(8)
      .required(),
  }),
  handleSubmit(values, { setSubmitting, resetForm }) {
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
        resetForm();
        handleHome(values.routeProps.history);
      }
      setSubmitting(false);
    });
  },
})(Login);

export default withStyles(styles)(login);
