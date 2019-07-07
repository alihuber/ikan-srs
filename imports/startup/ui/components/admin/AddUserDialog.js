import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { toast } from 'react-toastify';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import AutoForm from 'uniforms-material/AutoForm';
import SimpleSchema from 'simpl-schema';

const styles = theme => ({
  boxContainer: {
    padding: theme.spacing.unit * 3,
  },
});

const addUserSchema = new SimpleSchema({
  username: {
    type: String,
    min: 3,
  },
  password: {
    type: String,
    min: 8,
  },
  admin: {
    type: Boolean,
    optional: true,
  },
});

const handleSubmit = (values, createUser, refetch, onClose, setPageNum) => {
  const admin = values.admin || false;
  const { username, password } = values;
  if (username && password) {
    createUser({ variables: { username, password, admin } })
      .then(() => {
        refetch();
        setPageNum(0);
        toast.success('Creation successful!', {
          position: toast.POSITION.BOTTOM_CENTER,
        });
      })
      .catch((error) => {
        console.log(error);
        toast.error('Creation error!', {
          position: toast.POSITION.BOTTOM_CENTER,
        });
      })
      .finally(() => {
        onClose();
      });
  }
};

const AddUserDialog = (props) => {
  const { onClose, open, classes, createUser, refetch, setPageNum } = props;
  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle id="simple-dialog-title">Add user</DialogTitle>
      <div className={classes.boxContainer}>
        <AutoForm schema={addUserSchema} onSubmit={doc => handleSubmit(doc, createUser, refetch, onClose, setPageNum)} />
      </div>
    </Dialog>
  );
};

AddUserDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  createUser: PropTypes.func.isRequired,
  refetch: PropTypes.func.isRequired,
  setPageNum: PropTypes.func.isRequired,
};

export default withStyles(styles)(AddUserDialog);
