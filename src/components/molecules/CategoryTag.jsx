import React from 'react';

const CategoryTag = ({ category, className }) => {
  const defaultCategory = { name: 'Uncategorized', color: '#6B7280' };
  const { name, color } = category || defaultCategory;

return (
    <span
      className={`
        text-xs px-3 py-1.5 rounded-xl font-semibold
        border backdrop-blur-sm
        transition-all duration-200 hover:scale-105
        ${className || ''}
      `}
      style={{
        backgroundColor: `${color}15`,
        borderColor: `${color}30`,
        color: color
      }}
    >
      {name}
    </span>
  );
};

export default CategoryTag;