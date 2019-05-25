import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { toast } from 'react-toastify';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import { Form, Field, withFormik } from 'formik';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { TextField, Checkbox } from 'formik-material-ui';
import { Grid, Row, Col } from 'react-flexbox-grid';
import * as Yup from 'yup';

const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
  buttonContainer: {
    textAlign: 'left',
  },
  boxContainer: {
    margin: theme.spacing.unit,
  },
  control: {
    padding: theme.spacing.unit * 2,
    width: '100%',
    minWidth: 600,
  },
  dialog: {
    minWidth: 600,
  },
});

const EditUserDialog = (props) => {
  const { onClose, open, classes, isSubmitting, handleSubmit, values } = props;
  const { admin } = values;
  return (
    <Grid fluid>
      <Dialog onClose={onClose} open={open}>
        <DialogTitle id="simple-dialog-title">Edit user</DialogTitle>
        <Form>
          <Row center="xs">
            <Col xs={12} sm={12} md={12} lg={12}>
              <Field
                type="username" name="username" placeholder="Username" component={TextField}
                className={classes.control}
              />
            </Col>
          </Row>
          <Row center="xs">
            <Col xs={12} sm={12} md={12} lg={12}>
              <Field
                type="password" name="password" placeholder="Password" component={TextField}
                className={classes.control}
              />
            </Col>
          </Row>
          <div className={classes.boxContainer}>
            <FormControlLabel
              control={(
                <Field
                  type="checkbox" value={admin} checked={admin} name="admin"
                  label="Admin" component={Checkbox}
                />
              )}
              label="Admin"
            />
          </div>
          <div className={classes.buttonContainer}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className={classes.button}
            >
              Update
            </Button>
          </div>
        </Form>
      </Dialog>
    </Grid>
  );
};

const updateUserForm = withFormik({
  mapPropsToValues({ userId, username, password, admin, routeProps, updateUser, refetch, onClose }) {
    return {
      userId: userId || '',
      username: username || '',
      password: password || '',
      admin: admin || false,
      routeProps,
      updateUser,
      refetch,
      onClose,
    };
  },
  validationSchema: Yup.object().shape({
    username: Yup.string()
      .min(3)
      .required(),
    password: Yup.string().min(8),
    admin: Yup.bool(),
  }),
  handleSubmit(values, { setSubmitting, resetForm }) {
    const { userId, updateUser, username, password, admin, refetch, onClose } = values;
    updateUser({ variables: { userId, username, password, admin } })
      .then(() => {
        refetch();
        resetForm();
        toast.success('Update successful!', {
          position: toast.POSITION.BOTTOM_CENTER,
        });
      })
      .catch((error) => {
        console.log(error);
        toast.error('Update error!', {
          position: toast.POSITION.BOTTOM_CENTER,
        });
      })
      .finally(() => {
        setSubmitting(false);
        onClose();
      });
  },
})(EditUserDialog);

EditUserDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  values: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  handleSubmit: PropTypes.func.isRequired,
};

export default withStyles(styles)(updateUserForm);
