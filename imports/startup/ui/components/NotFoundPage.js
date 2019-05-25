import React, { setGlobal } from 'reactn';
import Typography from '@material-ui/core/Typography';

const NotFoundPage = () => {
  setGlobal({ loading: false });
  return (
    <Typography variant="h3" gutterBottom>
      404 - Not found
    </Typography>
  );
};

export default NotFoundPage;
