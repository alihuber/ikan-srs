/* eslint-disable react/no-unused-state */
import React, { useContext } from 'react';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { ToastContainer } from 'react-toastify';
import { Query } from 'react-apollo';

import { CURRENT_USER_QUERY } from '../../../api/users/constants';
import Layout from './Layout.js';
import Routing from './Routing.js';
import CurrentUserContext from '../contexts/CurrentUserContext';
import LoadingContext from '../contexts/LoadingContext';

const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#80d6ff',
      main: '#42a5f5',
      dark: '#007c2',
      contrastText: '#fff',
    },
    secondary: {
      light: '#bfffff',
      main: '#80deea',
      dark: '#4bacb8',
      contrastText: '#000',
    },
    typography: {
      usenextvariants: true,
    },
  },
});

const Root = () => {
  const layout = Layout;
  const { setLoading } = useContext(LoadingContext);
  return (
    <MuiThemeProvider theme={theme}>
      <Query query={CURRENT_USER_QUERY}>
        {({ data }) => {
          if (data) {
            const { currentUser } = data;
            return (
              <CurrentUserContext.Provider value={currentUser}>
                <Routing LayoutComponent={layout} />
              </CurrentUserContext.Provider>
            );
          } else {
            setLoading(true);
            return null;
          }
        }}
      </Query>
      <ToastContainer autoClose={3000} />
    </MuiThemeProvider>
  );
};

export default Root;
