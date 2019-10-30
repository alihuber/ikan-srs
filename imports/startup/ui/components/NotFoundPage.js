import React, { useContext } from 'react';
import AnimContext from '../contexts/AnimContext';

const NotFoundPage = () => {
  const animClass = useContext(AnimContext);
  return (
    <div className={animClass}>
      <h3>404 - Not found</h3>
    </div>
  );
};

export default NotFoundPage;
