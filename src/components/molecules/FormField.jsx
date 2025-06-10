import React from 'react';
import ApperIcon from '@/components/ApperIcon';

const FormField = ({ label, children, required, error, labelClassName, className, ...props }) => {
  return (
    <div className={className} {...props}>
      <label className={`
        block text-sm font-semibold mb-3
        ${error ? 'text-error-700' : 'text-slate-700'} 
        ${labelClassName || ''}
      `}>
        {label} 
        {required && <span className="text-error-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <div className="mt-2 flex items-start space-x-2">
          <ApperIcon name="AlertCircle" className="w-4 h-4 text-error-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-error-600 leading-relaxed">{error}</p>
        </div>
      )}
    </div>
  );
};

export default FormField;