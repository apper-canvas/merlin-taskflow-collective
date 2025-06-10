import React from 'react';

const Select = ({ value, onChange, children, error, className, ...props }) => {
const baseClasses = `
    px-4 py-3 border rounded-xl 
    focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 
    outline-none transition-all duration-200 ease-smooth
    w-full text-sm font-medium 
    shadow-soft hover:shadow-medium
    focus:shadow-medium
    cursor-pointer
    disabled:opacity-50 disabled:cursor-not-allowed
    backdrop-blur-sm
    appearance-none bg-no-repeat bg-right
  `;
  
  const normalClasses = `
    border-slate-200 bg-white/90 
    hover:border-slate-300 hover:bg-white
    focus:bg-white
  `;
  
  const errorClasses = `
    border-error-300 focus:ring-error-500/20 
    bg-error-50/80 focus:border-error-500
  `;
  
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className={`${baseClasses} ${error ? errorClasses : normalClasses} ${className || ''}`}
        {...props}
      >
        {children}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

export default Select;