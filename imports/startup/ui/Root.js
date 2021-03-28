import React from 'react';
import { useQuery } from '@apollo/client';
import { toast } from 'react-toastify';

import { CURRENT_USER_QUERY } from '../../api/users/constants';
import Layout from './Layout';
import LoadingIndicator from './LoadingIndicator';
import Routing from './Routing';
import CurrentUserContext from './contexts/CurrentUserContext';
import AnimContext from './contexts/AnimContext';

toast.configure();

const Root = () => {
  const layout = Layout;
  const animClass =
    window.innerWidth > 860
      ? 'ract-transition fade-in'
      : 'ract-transition swipe-right';
  const { data, loading } = useQuery(CURRENT_USER_QUERY);
  let currentUser;
  if (data) {
    currentUser = data.currentUser;
  }
  return (
    <>
      {loading || !currentUser ? (
        <>
          <LoadingIndicator />
        </>
      ) : null}
      {currentUser ? (
        <>
          <AnimContext.Provider value={animClass}>
            <CurrentUserContext.Provider value={currentUser}>
              <Routing LayoutComponent={layout} />
            </CurrentUserContext.Provider>
          </AnimContext.Provider>
        </>
      ) : null}
    </>
  );
};

export default Root;
