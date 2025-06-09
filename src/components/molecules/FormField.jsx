import React from 'react';

const FormField = ({ label, children, required, labelClassName, className, ...props }) => {
  return (
    <div className={className} {...props}>
      <label className={`block text-sm font-medium text-gray-700 mb-2 ${labelClassName || ''}`}>
        {label} {required && '*'}
      </label>
      {children}
    </div>
  );
};

export default FormField;