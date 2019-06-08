import React, { useContext } from 'react';
import Typography from '@material-ui/core/Typography';
import LoadingContext from '../contexts/LoadingContext';

const HomePage = () => {
  const { loading, setLoading } = useContext(LoadingContext);
  if (loading) {
    setLoading(false);
  }
  return (
    <Typography variant="h3" gutterBottom>
      Hello World
    </Typography>
  );
};

export default HomePage;
