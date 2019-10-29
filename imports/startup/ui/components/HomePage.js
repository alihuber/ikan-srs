import React, { useContext } from 'react';
import AnimContext from '../contexts/AnimContext';

const HomePage = () => {
  const animClass = useContext(AnimContext);
  return (
    <div className={animClass}>
      <h3>Hello World</h3>
    </div>
  );
};

export default HomePage;
