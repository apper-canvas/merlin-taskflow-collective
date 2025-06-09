import React from 'react';

const CategoryTag = ({ category, className }) => {
  const defaultCategory = { name: 'Uncategorized', color: '#6B7280' };
  const { name, color } = category || defaultCategory;

  return (
    <span
      className={`text-xs px-2 py-1 rounded-full font-medium ${className || ''}`}
      style={{
        backgroundColor: `${color}20`,
        color: color
      }}
    >
      {name}
    </span>
  );
};

export default CategoryTag;