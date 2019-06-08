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
    margin: theme.spacing.unit * 3,
  },
});

const editUserSchema = new SimpleSchema({
  username: {
    type: String,
    min: 3,
  },
  password: {
    type: String,
    min: 8,
    optional: true,
  },
  admin: {
    type: Boolean,
    optional: true,
  },
});

const handleSubmit = (values, userId, updateUser, refetch, onClose) => {
  const { username, password, admin } = values;
  updateUser({ variables: { userId, username, password, admin } })
    .then(() => {
      refetch();
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
      onClose();
    });
};

const EditUserDialog = (props) => {
  const { userId, username, admin, onClose, open, classes, updateUser, refetch } = props;
  const editUserForm = ({ model }) => (
    <AutoForm schema={editUserSchema} onSubmit={doc => handleSubmit(doc, userId, updateUser, refetch, onClose)} model={model} />
  );
  editUserForm.propTypes = {
    model: PropTypes.object.isRequired,
  };
  const model = { username, admin };
  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle id="simple-dialog-title">Edit user</DialogTitle>
      <div className={classes.boxContainer}>{editUserForm({ model })}</div>
    </Dialog>
  );
};

EditUserDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  admin: PropTypes.bool,
  username: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  updateUser: PropTypes.func.isRequired,
  refetch: PropTypes.func.isRequired,
};

export default withStyles(styles)(EditUserDialog);
