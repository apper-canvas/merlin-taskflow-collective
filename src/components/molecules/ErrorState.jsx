import React from 'react';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const ErrorState = ({ message, onRetry, className }) => {
  return (
    <div className={`p-8 flex items-center justify-center h-full ${className || ''}`}>
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-error-100 to-error-200 rounded-2xl flex items-center justify-center shadow-soft mb-6">
          <ApperIcon name="AlertCircle" className="w-8 h-8 text-error-500" />
        </div>
        <h3 className="text-xl font-display font-bold text-slate-800 mb-3">Failed to load data</h3>
        <p className="text-slate-600 mb-6 leading-relaxed">{message}</p>
        <Button
          onClick={onRetry}
          className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/25 font-semibold"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
};

export default ErrorState;