/* eslint-disable react/no-unused-state */
import React, { useGlobal } from 'reactn';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { ToastContainer } from 'react-toastify';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

import Layout from './Layout.js';
import Routing from './Routing.js';
import CurrentUserContext from '../contexts/CurrentUserContext';

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

const USER_QUERY = gql`
  query {
    currentUser {
      _id
      admin
      username
    }
  }
`;

const Root = () => {
  const layout = Layout;
  const [loading, setLoading] = useGlobal('loading');
  return (
    <MuiThemeProvider theme={theme}>
      <Query query={USER_QUERY}>
        {({ data }) => {
          if (data) {
            const { currentUser } = data;
            return (
              <CurrentUserContext.Provider value={currentUser}>
                <Routing LayoutComponent={layout} />
              </CurrentUserContext.Provider>
            );
          } else {
            setLoading({ loading: true });
            return null;
          }
        }}
      </Query>
      <ToastContainer autoClose={3000} />
    </MuiThemeProvider>
  );
};

export default Root;
