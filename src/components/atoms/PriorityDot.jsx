import React from 'react';

const PriorityDot = ({ priority, className }) => {
  let colorClass = 'bg-gray-500';
  let animateClass = '';

  switch (priority) {
    case 3:
      colorClass = 'bg-error';
      animateClass = 'animate-pulse-gentle';
      break;
    case 2:
      colorClass = 'bg-warning';
      break;
    case 1:
      colorClass = 'bg-success';
      break;
    default:
      colorClass = 'bg-gray-500';
  }

  return (
    <div className={`w-2 h-2 rounded-full ${colorClass} ${animateClass} ${className || ''}`} />
  );
};

export default PriorityDot;