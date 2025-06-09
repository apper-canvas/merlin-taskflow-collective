import React from 'react';
import ApperIcon from '@/components/ApperIcon';

const FormField = ({ label, children, required, error, labelClassName, className, ...props }) => {
  return (
    <div className={className} {...props}>
      <label className={`block text-sm font-medium ${error ? 'text-red-700' : 'text-gray-700'} mb-2 ${labelClassName || ''}`}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <div className="mt-1 flex items-center space-x-1">
          <ApperIcon name="AlertCircle" className="w-4 h-4 text-red-500" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

export default FormField;