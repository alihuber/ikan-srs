import React from 'react';
import { ScaleLoader } from 'react-spinners';

const Loading = () => {
  return (
    <div className="loading">
      <ScaleLoader color="#030e21" loading />
    </div>
  );
};
export default Loading;
