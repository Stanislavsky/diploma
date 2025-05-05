import React from 'react';
import './Skeleton.css';

const Skeleton = ({ width, height, className = '' }) => {
  return (
    <div 
      className={`skeleton ${className}`}
      style={{ width, height }}
    />
  );
};

export default Skeleton; 