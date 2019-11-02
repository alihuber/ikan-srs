import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { ToastContainer } from 'react-toastify';

import { CURRENT_USER_QUERY } from '../../../api/users/constants';
import Layout from './Layout';
import Loading from './Loading';
import Routing from './Routing';
import CurrentUserContext from '../contexts/CurrentUserContext';
import AnimContext from '../contexts/AnimContext';

const Root = () => {
  const layout = Layout;
  const animClass = window.innerWidth > 860 ? 'ract-transition fade-in' : 'ract-transition swipe-right';
  const { data, loading } = useQuery(CURRENT_USER_QUERY);
  let currentUser;
  if (data) {
    currentUser = data.currentUser;
  }
  return (
    <>
      {loading || !currentUser ? (
        <>
          <Loading />
          <ToastContainer autoClose={3000} />
        </>
      ) : null}
      {currentUser ? (
        <>
          <AnimContext.Provider value={animClass}>
            <CurrentUserContext.Provider value={currentUser}>
              <Routing LayoutComponent={layout} />
            </CurrentUserContext.Provider>
          </AnimContext.Provider>
          <ToastContainer autoClose={3000} />
        </>
      ) : null}
    </>
  );
};

export default Root;
