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
    <div className="flex-shrink-0 p-6 bg-white border-b border-gray-200">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600">{subtitle}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={onSearchChange}
              onKeyDown={onSearchKeyDown}
              className="pl-10 pr-4 py-2 w-full sm:w-64"
            />
          </div>

          {onAddClick && (
            <Button
              onClick={onAddClick}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 hover:scale-105 transition-all flex items-center space-x-2 font-medium shadow-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ApperIcon name="Plus" className="w-4 h-4" />
              <span>{addBtnText || 'Add'}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
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

        {onSortByChange && (
          <Select
            value={sortBy}
            onChange={onSortByChange}
          >
            <option value="dueDate">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="created">Sort by Created</option>
          </Select>
        )}

        {showToggle && (
          <Button
            onClick={onToggle}
            className={`px-3 py-2 rounded-lg transition-all text-sm font-medium ${
              toggleActive
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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