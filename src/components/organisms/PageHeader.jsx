import React from 'react';
import ApperIcon from '@/components/ApperIcon';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Button from '@/components/atoms/Button';

const PageHeader = ({
  title,
  subtitle,
  searchQuery,
  onSearchChange,
  onSearchKeyDown,
  selectedCategory,
  onCategoryChange,
  categories,
  sortBy,
  onSortByChange,
  showToggle = false,
  toggleLabel,
  onToggle,
  toggleActive,
  onAddClick,
  addBtnText
}) => {
  return (
<div className="flex-shrink-0 p-8 bg-white/95 backdrop-blur-lg border-b border-slate-200/60 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
            {title}
          </h1>
          <p className="text-slate-600 font-medium">{subtitle}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <ApperIcon name="Search" className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={onSearchChange}
              onKeyDown={onSearchKeyDown}
              className="pl-12 pr-4 py-3 w-full sm:w-72 text-sm"
            />
          </div>

          {onAddClick && (
            <Button
              onClick={onAddClick}
              className="px-6 py-3 bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-xl hover:from-accent-600 hover:to-accent-700 hover:scale-105 transition-all flex items-center space-x-2 font-semibold shadow-lg shadow-accent-500/25"
            >
              <ApperIcon name="Plus" className="w-4 h-4" />
              <span>{addBtnText || 'Add'}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <div className="min-w-48">
          <Select
            value={selectedCategory}
            onChange={onCategoryChange}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>

        {onSortByChange && (
          <div className="min-w-48">
            <Select
              value={sortBy}
              onChange={onSortByChange}
            >
              <option value="dueDate">Sort by Due Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="created">Sort by Created</option>
            </Select>
          </div>
        )}

        {showToggle && (
          <Button
            onClick={onToggle}
            className={`px-4 py-2.5 rounded-xl transition-all text-sm font-semibold ${
              toggleActive
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            {toggleLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PageHeader;