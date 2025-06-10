import React from 'react'
import PropTypes from 'prop-types'
import ApperIcon from '@/components/ApperIcon'
import Input from '@/components/atoms/Input'
import Select from '@/components/atoms/Select'
import Button from '@/components/atoms/Button'

const PageHeader = ({
  title = '',
  subtitle = '',
  searchQuery = '',
  onSearchChange = () => {},
  onSearchKeyDown = () => {},
  selectedCategory = '',
  onCategoryChange = () => {},
  categories = [], // Default empty array to prevent map error
  sortBy = '',
  onSortByChange = () => {},
  showToggle = false,
  toggleLabel = '',
  onToggle = () => {},
  toggleActive = false,
  onAddClick = () => {},
  addBtnText = 'Add'
}) => {
  // Defensive check for categories array
  const safeCategories = Array.isArray(categories) ? categories : [];
return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <ApperIcon />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title || 'Untitled'}</h1>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {showToggle && toggleLabel && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">{toggleLabel}</span>
              <button
                onClick={onToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  toggleActive ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                aria-label={`Toggle ${toggleLabel}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    toggleActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}
          
          {onAddClick && (
            <Button
              onClick={onAddClick}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {addBtnText}
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={onSearchChange}
            onKeyDown={onSearchKeyDown}
          />
        </div>
        
        {safeCategories.length > 0 && (
          <Select
            value={selectedCategory}
            onChange={onCategoryChange}
options={[
              { value: '', label: 'All Categories' },
              ...safeCategories.map(cat => ({
                value: cat?.id || '',
                label: cat?.name || 'Unknown Category'
              }))
            ]}
          />
        )}
        
        {onSortByChange && (
          <Select
            value={sortBy}
            onChange={onSortByChange}
            options={[
              { value: 'created', label: 'Date Created' },
              { value: 'updated', label: 'Last Updated' },
              { value: 'priority', label: 'Priority' },
              { value: 'alphabetical', label: 'Alphabetical' }
            ]}
          />
        )}
</div>
    </div>
  )
}

// PropTypes for development-time validation
PageHeader.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  searchQuery: PropTypes.string,
  onSearchChange: PropTypes.func,
  onSearchKeyDown: PropTypes.func,
  selectedCategory: PropTypes.string,
  onCategoryChange: PropTypes.func,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string
    })
  ),
  sortBy: PropTypes.string,
  onSortByChange: PropTypes.func,
  showToggle: PropTypes.bool,
  toggleLabel: PropTypes.string,
  onToggle: PropTypes.func,
  toggleActive: PropTypes.bool,
onAddClick: PropTypes.func,
  addBtnText: PropTypes.string
}

export default PageHeader;