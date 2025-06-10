import React from 'react';
import ApperIcon from '@/components/ApperIcon';

const Checkbox = ({ checked, onChange, className, disabled = false, ...props }) => {
  return (
    <label className={`
      relative flex items-center justify-center cursor-pointer 
      group transition-all duration-200 ease-smooth
      ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:scale-105 active:scale-95'}
      ${className || ''}
    `}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
        {...props}
      />
      <div className={`
        w-5 h-5 rounded-lg border-2 
        transition-all duration-300 ease-smooth
        shadow-soft hover:shadow-medium
        flex items-center justify-center
        ${checked 
          ? 'bg-gradient-to-br from-primary-500 to-primary-600 border-primary-500 scale-105 shadow-lg shadow-primary-500/25' 
          : 'bg-white/90 border-slate-300 group-hover:border-slate-400 group-hover:bg-white'
        }
        ${disabled ? 'bg-slate-100 border-slate-200' : ''}
      `}>
        {checked && (
          <ApperIcon 
            name="Check" 
            className="w-3 h-3 text-white drop-shadow-sm animate-scale-in" 
          />
        )}
      </div>
    </label>
  );
};

export default Checkbox;