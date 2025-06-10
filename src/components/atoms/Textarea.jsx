import React from 'react';

const Textarea = ({ value, onChange, placeholder, error, className, rows = 3, ...props }) => {
const baseClasses = `
    w-full px-4 py-3 border rounded-xl 
    focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 
    outline-none transition-all duration-200 ease-smooth
    resize-none text-sm font-medium leading-relaxed
    placeholder:text-slate-400 
    shadow-soft hover:shadow-medium
    focus:shadow-medium
    disabled:opacity-50 disabled:cursor-not-allowed
    backdrop-blur-sm
  `;
  
  const normalClasses = `
    border-slate-200 bg-white/90 
    hover:border-slate-300 hover:bg-white
    focus:bg-white
  `;
  
  const errorClasses = `
    border-error-300 focus:ring-error-500/20 
    bg-error-50/80 focus:border-error-500
    placeholder:text-error-400
  `;
  
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={`${baseClasses} ${error ? errorClasses : normalClasses} ${className || ''}`}
      {...props}
    />
  );
};

export default Textarea;