import React from 'react';
import { ToastContainer } from 'react-toastify';
import { Query } from 'react-apollo';

import { CURRENT_USER_QUERY } from '../../../api/users/constants';
import Layout from './Layout';
import Loading from './Loading';
import Routing from './Routing';
import CurrentUserContext from '../contexts/CurrentUserContext';

const Root = () => {
  const layout = Layout;
  return (
    <>
      <Query query={CURRENT_USER_QUERY}>
        {({ data, loading }) => {
          if (loading) {
            return <Loading />;
          }
          if (data) {
            const { currentUser } = data;
            return (
              <CurrentUserContext.Provider value={currentUser}>
                <Routing LayoutComponent={layout} />
              </CurrentUserContext.Provider>
            );
          } else {
            return null;
          }
        }}
      </Query>
      <ToastContainer autoClose={3000} />
    </>
  );
};

export default Root;
