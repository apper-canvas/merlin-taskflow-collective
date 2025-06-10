import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Modal from '@/components/molecules/Modal';
import FormField from '@/components/molecules/FormField';
import Input from '@/components/atoms/Input';
import Textarea from '@/components/atoms/Textarea';
import Select from '@/components/atoms/Select';
import Checkbox from '@/components/atoms/Checkbox';
import Button from '@/components/atoms/Button';
import Spinner from '@/components/atoms/Spinner';
import DeleteConfirmationModal from '@/components/organisms/DeleteConfirmationModal';
import { categoryService } from '@/services';

const TaskFormModal = ({ isOpen, onClose, onSave, onDelete, task, categories, onCategoriesUpdate }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'personal',
    priority: 2,
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    completed: false,
    isRecurring: false,
    recurringConfig: null
  });
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({ name: '', description: '' });
  const [categoryErrors, setCategoryErrors] = useState({});
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        category: task.category,
        priority: task.priority,
        dueDate: format(new Date(task.dueDate), 'yyyy-MM-dd'),
        completed: task.completed,
        isRecurring: task.isRecurring || false,
        recurringConfig: task.recurringConfig || null
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'personal',
        priority: 2,
        dueDate: format(new Date(), 'yyyy-MM-dd'),
        completed: false,
        isRecurring: false,
        recurringConfig: null
      });
    }
setShowDeleteConfirm(false); // Reset confirmation state
  }, [task, isOpen]); // Also reset on modal open
const validateCategoryForm = () => {
    const newErrors = {};

    if (!categoryFormData.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (categoryFormData.name.trim().length < 2) {
      newErrors.name = 'Category name must be at least 2 characters';
    } else if (categoryFormData.name.trim().length > 50) {
      newErrors.name = 'Category name must be less than 50 characters';
    } else if (categories?.some(cat => cat.name.toLowerCase() === categoryFormData.name.trim().toLowerCase())) {
      newErrors.name = 'A category with this name already exists';
    }

    if (categoryFormData.description && categoryFormData.description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters';
    }

    setCategoryErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateCategory = async () => {
    if (!validateCategoryForm()) return;

    setIsCategoryLoading(true);
    try {
      const newCategory = await categoryService.create({
        name: categoryFormData.name.trim(),
        description: categoryFormData.description.trim() || ''
      });
      
      // Update the form data to select the new category
      setFormData({ ...formData, category: newCategory.id });
      
      // Reset category form
      setCategoryFormData({ name: '', description: '' });
      setCategoryErrors({});
      setShowCategoryForm(false);
      
      // Notify parent to refresh categories
      if (onCategoriesUpdate) {
        onCategoriesUpdate();
      }
    } catch (error) {
      setCategoryErrors({ submit: 'Failed to create category. Please try again.' });
    } finally {
      setIsCategoryLoading(false);
    }
  };

const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (formData.title.length > 100) {
      newErrors.title = 'Title must be 100 characters or less';
    }
    
    if (formData.description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const taskData = {
        ...formData,
        dueDate: new Date(formData.dueDate).toISOString()
      };

      if (task) {
        await onSave(task.id, taskData);
      } else {
        await onSave(taskData);
      }
      
      onClose();
    } catch (error) {
      setErrors({ submit: 'Failed to save task. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (task) {
      onDelete(task.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

const handleRecurringToggle = (checked) => {
    if (checked) {
      const defaultConfig = {
        pattern: 'daily',
        frequency: 1,
        startDate: formData.dueDate,
        endType: 'never',
        endDate: null,
        endAfter: 10
      };
      
      setFormData({
        ...formData,
        isRecurring: true,
        recurringConfig: defaultConfig
      });
    } else {
      setFormData({
        ...formData,
        isRecurring: false,
        recurringConfig: null
      });
    }
  };

  const validateRecurrence = () => {
    const newErrors = {};
    
    if (formData.isRecurring && formData.recurringConfig) {
      const config = formData.recurringConfig;
      
      // Validate frequency
      if (!config.frequency || config.frequency < 1 || config.frequency > 365) {
        newErrors.recurrenceInterval = 'Interval must be between 1 and 365';
      }
      
      // Validate weekly days selection
      if (config.pattern === 'weekly' && (!config.daysOfWeek || config.daysOfWeek.length === 0)) {
        newErrors.recurrenceDays = 'Please select at least one day of the week';
      }
      
      // Validate end date
      if (config.endType === 'date') {
        if (!config.endDate) {
          newErrors.recurrenceEnd = 'Please specify an end date';
        } else if (new Date(config.endDate) <= new Date(formData.dueDate)) {
          newErrors.recurrenceEnd = 'End date must be after the start date';
        }
      }
      
      // Validate end after count
      if (config.endType === 'after') {
        if (!config.endAfter || config.endAfter < 1 || config.endAfter > 100) {
          newErrors.recurrenceEnd = 'Number of occurrences must be between 1 and 100';
        }
      }
    }
    
    return newErrors;
  };
return (
<Modal isOpen={isOpen} onClose={onClose} contentClassName="max-w-4xl mx-auto my-8">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-semibold text-gray-900">
              {task ? 'Edit Task' : 'Create Task'}
            </h2>
            <Button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-all duration-200 text-gray-500 hover:text-gray-700"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ApperIcon name="X" className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-5">
            <FormField label="Title" required error={errors.title}>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter task title..."
                error={errors.title}
                autoFocus
                disabled={isLoading}
              />
            </FormField>

            <FormField label="Description" error={errors.description}>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add description..."
                error={errors.description}
                rows={3}
                disabled={isLoading}
              />
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<FormField label="Category">
                <div className="space-y-3">
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    disabled={isLoading || isCategoryLoading}
                    error={errors.category}
                  >
                    {categories?.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                  
                  {!showCategoryForm && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowCategoryForm(true)}
                      disabled={isLoading || isCategoryLoading}
                      className="text-sm"
                    >
                      <ApperIcon name="Plus" size={16} className="mr-1" />
                      Create New Category
                    </Button>
                  )}
                  
                  {showCategoryForm && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-900">Create New Category</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowCategoryForm(false);
                            setCategoryFormData({ name: '', description: '' });
                            setCategoryErrors({});
                          }}
                          disabled={isCategoryLoading}
                        >
                          <ApperIcon name="X" size={16} />
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        <FormField label="Category Name" required error={categoryErrors.name}>
                          <Input
                            value={categoryFormData.name}
                            onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                            placeholder="Enter category name"
                            disabled={isCategoryLoading}
                            error={categoryErrors.name}
                          />
                        </FormField>
                        
                        <FormField label="Description (Optional)" error={categoryErrors.description}>
                          <Textarea
                            value={categoryFormData.description}
                            onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                            placeholder="Enter category description"
                            disabled={isCategoryLoading}
                            rows={2}
                            error={categoryErrors.description}
                          />
                        </FormField>
                        
                        {categoryErrors.submit && (
                          <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                            {categoryErrors.submit}
                          </div>
                        )}
                        
                        <div className="flex gap-2 pt-2">
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={handleCreateCategory}
                            disabled={isCategoryLoading || !categoryFormData.name.trim()}
                          >
                            {isCategoryLoading ? (
                              <>
                                <Spinner size="sm" className="mr-2" />
                                Creating...
                              </>
                            ) : (
                              <>
                                <ApperIcon name="Plus" size={16} className="mr-1" />
                                Create Category
                              </>
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setShowCategoryForm(false);
                              setCategoryFormData({ name: '', description: '' });
                              setCategoryErrors({});
                            }}
                            disabled={isCategoryLoading}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </FormField>

              <FormField label="Priority">
                <Select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  disabled={isLoading}
                >
                  <option value={3}>High</option>
                  <option value={2}>Medium</option>
                  <option value={1}>Low</option>
                </Select>
              </FormField>
            </div>

            <FormField label="Due Date">
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                disabled={isLoading}
              />
            </FormField>

            {task && (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Checkbox
                  id="completed"
                  checked={formData.completed}
                  onChange={(e) => setFormData({ ...formData, completed: e.target.checked })}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  disabled={isLoading}
                />
                <label htmlFor="completed" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Mark as completed
                </label>
              </div>
            )}

{/* Recurring Task Configuration */}
            {!task && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <ApperIcon name="RotateCcw" className="w-5 h-5 text-primary" />
                    <label className="text-sm font-semibold text-gray-800 cursor-pointer">
                      Make this a recurring task
                    </label>
                  </div>
                  <Checkbox
                    checked={formData.isRecurring}
                    onChange={(e) => handleRecurringToggle(e.target.checked)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    disabled={isLoading}
                  />
                </div>
                
                {formData.isRecurring && (
                  <div className="p-5 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border border-primary/20 rounded-xl space-y-5 shadow-sm">
                    <h4 className="text-base font-semibold text-gray-800 flex items-center space-x-2">
                      <ApperIcon name="Calendar" className="w-5 h-5 text-primary" />
                      <span>Recurrence Settings</span>
                    </h4>
                    
                    {/* Frequency Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField label="Frequency" required error={errors.recurrenceFrequency}>
                        <Select
                          value={formData.recurringConfig?.pattern || 'daily'}
                          onChange={(e) => {
                            const pattern = e.target.value;
                            const defaultConfig = {
                              pattern,
                              frequency: 1,
                              startDate: formData.dueDate,
                              endType: 'never',
                              endDate: null,
                              endAfter: 10
                            };
                            
                            if (pattern === 'weekly') {
                              defaultConfig.daysOfWeek = [format(new Date(formData.dueDate), 'EEEE').toLowerCase()];
                            } else if (pattern === 'monthly') {
                              defaultConfig.dayOfMonth = new Date(formData.dueDate).getDate();
                              defaultConfig.monthlyType = 'dayOfMonth';
                            }
                            
                            setFormData({
                              ...formData,
                              recurringConfig: defaultConfig
                            });
                          }}
                          disabled={isLoading}
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                          <option value="custom">Custom</option>
                        </Select>
                      </FormField>
                      
                      <FormField label="Interval" error={errors.recurrenceInterval}>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-600">Every</span>
                          <Input
                            type="number"
                            min="1"
                            max="365"
                            value={formData.recurringConfig?.frequency || 1}
                            onChange={(e) => setFormData({
                              ...formData,
                              recurringConfig: {
                                ...formData.recurringConfig,
                                frequency: parseInt(e.target.value) || 1
                              }
                            })}
                            className="w-20"
                            disabled={isLoading}
                          />
                          <span className="text-sm font-medium text-gray-600">
                            {formData.recurringConfig?.pattern === 'daily' && (formData.recurringConfig?.frequency === 1 ? 'day' : 'days')}
                            {formData.recurringConfig?.pattern === 'weekly' && (formData.recurringConfig?.frequency === 1 ? 'week' : 'weeks')}
                            {formData.recurringConfig?.pattern === 'monthly' && (formData.recurringConfig?.frequency === 1 ? 'month' : 'months')}
                            {formData.recurringConfig?.pattern === 'yearly' && (formData.recurringConfig?.frequency === 1 ? 'year' : 'years')}
                            {formData.recurringConfig?.pattern === 'custom' && 'period(s)'}
                          </span>
                        </div>
                      </FormField>
                    </div>
                    
                    {/* Weekly specific options */}
                    {formData.recurringConfig?.pattern === 'weekly' && (
                      <FormField label="Days of Week" required error={errors.recurrenceDays}>
                        <div className="flex flex-wrap gap-3">
                          {['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map(day => (
                            <label key={day} className="flex items-center space-x-2 text-sm font-medium text-gray-700 cursor-pointer hover:text-primary transition-colors">
                              <Checkbox
                                checked={formData.recurringConfig?.daysOfWeek?.includes(day) || false}
                                onChange={(e) => {
                                  const currentDays = formData.recurringConfig?.daysOfWeek || [];
                                  const newDays = e.target.checked
                                    ? [...currentDays, day]
                                    : currentDays.filter(d => d !== day);
                                  
                                  setFormData({
                                    ...formData,
                                    recurringConfig: {
                                      ...formData.recurringConfig,
                                      daysOfWeek: newDays
                                    }
                                  });
                                }}
                                className="w-3 h-3"
                                disabled={isLoading}
                              />
                              <span className="capitalize">{day.slice(0, 3)}</span>
                            </label>
                          ))}
                        </div>
                      </FormField>
                    )}
                    
                    {/* Monthly specific options */}
                    {formData.recurringConfig?.pattern === 'monthly' && (
                      <div className="space-y-3">
                        <FormField label="Monthly Recurrence Type">
                          <div className="space-y-3 p-3 bg-white rounded-lg border border-gray-200">
                            <label className="flex items-center space-x-3 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors">
                              <input
                                type="radio"
                                name="monthlyType"
                                value="dayOfMonth"
                                checked={formData.recurringConfig?.monthlyType === 'dayOfMonth'}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  recurringConfig: {
                                    ...formData.recurringConfig,
                                    monthlyType: e.target.value,
                                    dayOfMonth: new Date(formData.dueDate).getDate()
                                  }
                                })}
                                className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                                disabled={isLoading}
                              />
                              <span>On day {new Date(formData.dueDate).getDate()} of each month</span>
                            </label>
                            <label className="flex items-center space-x-3 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors">
                              <input
                                type="radio"
                                name="monthlyType"
                                value="weekOfMonth"
                                checked={formData.recurringConfig?.monthlyType === 'weekOfMonth'}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  recurringConfig: {
                                    ...formData.recurringConfig,
                                    monthlyType: e.target.value
                                  }
                                })}
                                className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                                disabled={isLoading}
                              />
                              <span>On the {Math.ceil(new Date(formData.dueDate).getDate() / 7)} {format(new Date(formData.dueDate), 'EEEE')} of each month</span>
                            </label>
                          </div>
                        </FormField>
                      </div>
                    )}
                    
                    {/* End Date Options */}
                    <FormField label="End Recurrence" error={errors.recurrenceEnd}>
                      <div className="space-y-3 p-3 bg-white rounded-lg border border-gray-200">
                        <label className="flex items-center space-x-3 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors">
                          <input
                            type="radio"
                            name="endType"
                            value="never"
                            checked={formData.recurringConfig?.endType === 'never'}
                            onChange={(e) => setFormData({
                              ...formData,
                              recurringConfig: {
                                ...formData.recurringConfig,
                                endType: e.target.value
                              }
                            })}
                            className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                            disabled={isLoading}
                          />
                          <span>Never</span>
                        </label>
                        
                        <div className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-md transition-colors">
                          <input
                            type="radio"
                            name="endType"
                            value="date"
                            checked={formData.recurringConfig?.endType === 'date'}
                            onChange={(e) => setFormData({
                              ...formData,
                              recurringConfig: {
                                ...formData.recurringConfig,
                                endType: e.target.value
                              }
                            })}
                            className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                            disabled={isLoading}
                          />
                          <span className="text-sm font-medium text-gray-700">On</span>
                          <Input
                            type="date"
                            value={formData.recurringConfig?.endDate || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              recurringConfig: {
                                ...formData.recurringConfig,
                                endDate: e.target.value,
                                endType: 'date'
                              }
                            })}
                            className="w-auto"
                            disabled={isLoading || formData.recurringConfig?.endType !== 'date'}
                            min={formData.dueDate}
                          />
                        </div>
                        
                        <div className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-md transition-colors">
                          <input
                            type="radio"
                            name="endType"
                            value="after"
                            checked={formData.recurringConfig?.endType === 'after'}
                            onChange={(e) => setFormData({
                              ...formData,
                              recurringConfig: {
                                ...formData.recurringConfig,
                                endType: e.target.value
                              }
                            })}
                            className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                            disabled={isLoading}
                          />
                          <span className="text-sm font-medium text-gray-700">After</span>
                          <Input
                            type="number"
                            min="1"
                            max="100"
                            value={formData.recurringConfig?.endAfter || 10}
                            onChange={(e) => setFormData({
                              ...formData,
                              recurringConfig: {
                                ...formData.recurringConfig,
                                endAfter: parseInt(e.target.value) || 10,
                                endType: 'after'
                              }
                            })}
                            className="w-20"
                            disabled={isLoading || formData.recurringConfig?.endType !== 'after'}
                          />
                          <span className="text-sm font-medium text-gray-700">occurrences</span>
                        </div>
                      </div>
                    </FormField>
                    
                    {/* Custom recurrence note */}
                    {formData.recurringConfig?.pattern === 'custom' && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg shadow-sm">
                        <div className="flex items-start space-x-3">
                          <ApperIcon name="Info" className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-yellow-700 leading-relaxed">
                            Custom recurrence patterns allow for complex scheduling. Tasks will be created based on the interval specified.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Recurrence Summary */}
                    {formData.recurringConfig && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
                        <div className="flex items-start space-x-3">
                          <ApperIcon name="Calendar" className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-blue-700 leading-relaxed">
                            <strong className="font-semibold">Summary:</strong> {' '}
                            {formData.recurringConfig.pattern === 'daily' && `Every ${formData.recurringConfig.frequency} day${formData.recurringConfig.frequency > 1 ? 's' : ''}`}
                            {formData.recurringConfig.pattern === 'weekly' && `Every ${formData.recurringConfig.frequency} week${formData.recurringConfig.frequency > 1 ? 's' : ''} on ${formData.recurringConfig.daysOfWeek?.map(d => d.charAt(0).toUpperCase() + d.slice(1, 3)).join(', ') || 'selected days'}`}
                            {formData.recurringConfig.pattern === 'monthly' && `Every ${formData.recurringConfig.frequency} month${formData.recurringConfig.frequency > 1 ? 's' : ''}`}
                            {formData.recurringConfig.pattern === 'yearly' && `Every ${formData.recurringConfig.frequency} year${formData.recurringConfig.frequency > 1 ? 's' : ''}`}
                            {formData.recurringConfig.pattern === 'custom' && `Custom pattern every ${formData.recurringConfig.frequency} period${formData.recurringConfig.frequency > 1 ? 's' : ''}`}
                            {formData.recurringConfig.endType === 'date' && `, until ${format(new Date(formData.recurringConfig.endDate), 'MMM d, yyyy')}`}
                            {formData.recurringConfig.endType === 'after' && `, for ${formData.recurringConfig.endAfter} occurrences`}
                            {formData.recurringConfig.endType === 'never' && ', indefinitely'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm">
                <div className="flex items-start space-x-3">
                  <ApperIcon name="AlertCircle" className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700 leading-relaxed">{errors.submit}</p>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div>
              {task && (
                <Button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isLoading}
                  className="px-4 py-2 text-error hover:bg-error/10 rounded-lg transition-all duration-200 text-sm font-medium disabled:opacity-50 border border-error/20 hover:border-error/30"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Delete Task
                </Button>
              )}
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 border border-gray-200 hover:border-gray-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !formData.title.trim()}
                className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                onClick={handleSubmit}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading && <Spinner className="w-4 h-4" />}
                <span>{task ? 'Update' : 'Create'} Task</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        message="Are you sure you want to permanently delete this task? This action cannot be undone."
confirmText="Delete"
      />

    </Modal>
  );
};

export default TaskFormModal;