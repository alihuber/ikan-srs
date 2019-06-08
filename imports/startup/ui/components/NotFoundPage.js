import React, { useContext } from 'react';
import Typography from '@material-ui/core/Typography';
import LoadingContext from '../contexts/LoadingContext';

const NotFoundPage = () => {
  const { loading, setLoading } = useContext(LoadingContext);
  if (loading) {
    setLoading(false);
  }
  return (
    <Typography variant="h3" gutterBottom>
      404 - Not found
    </Typography>
  );
};

export default NotFoundPage;
