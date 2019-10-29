import React from 'react';
import { ToastContainer } from 'react-toastify';
import { Query } from 'react-apollo';

import { CURRENT_USER_QUERY } from '../../../api/users/constants';
import Layout from './Layout';
import Loading from './Loading';
import Routing from './Routing';
import CurrentUserContext from '../contexts/CurrentUserContext';
import AnimContext from '../contexts/AnimContext';

const Root = () => {
  const layout = Layout;
  const animClass = window.innerWidth > 860 ? 'ract-transition fade-in' : 'ract-transition swipe-right';
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
              <AnimContext.Provider value={animClass}>
                <CurrentUserContext.Provider value={currentUser}>
                  <Routing LayoutComponent={layout} />
                </CurrentUserContext.Provider>
              </AnimContext.Provider>
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
