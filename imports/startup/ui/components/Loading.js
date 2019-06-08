import React, { useState } from 'react';
import { ScaleLoader } from 'react-spinners';

const Loading = () => {
  const [loading] = useState(true);
  return (
    <div className="loading">
      <ScaleLoader color="#030e21" loading={loading} />
    </div>
  );
};
export default Loading;
