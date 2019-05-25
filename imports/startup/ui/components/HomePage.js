import React, { setGlobal } from 'reactn';
import Typography from '@material-ui/core/Typography';

const HomePage = () => {
  setGlobal({ loading: false });
  return (
    <Typography variant="h3" gutterBottom>
      Hello World
    </Typography>
  );
};

export default HomePage;
