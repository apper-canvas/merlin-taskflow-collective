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
import RecurringTaskModal from '@/components/organisms/RecurringTaskModal';

const TaskFormModal = ({ isOpen, onClose, onSave, onDelete, task, categories }) => {
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
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
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
    setShowRecurringModal(false); // Reset recurring modal state
  }, [task, isOpen]); // Also reset on modal open

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

  const handleRecurringSave = (recurringConfig) => {
    setFormData({
      ...formData,
      isRecurring: true,
      recurringConfig
    });
    setShowRecurringModal(false);
  };

  const handleRecurringToggle = (checked) => {
    if (checked) {
      setShowRecurringModal(true);
    } else {
      setFormData({
        ...formData,
        isRecurring: false,
        recurringConfig: null
      });
    }
  };
return (
    <Modal isOpen={isOpen} onClose={onClose} contentClassName="max-w-lg w-full max-h-[90vh] overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-display font-semibold text-gray-900">
              {task ? 'Edit Task' : 'Create Task'}
            </h2>
            <Button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ApperIcon name="X" className="w-5 h-5" />
            </Button>
          </div>

<form onSubmit={handleSubmit} className="space-y-6">
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

<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Category">
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  disabled={isLoading}
                >
                  {categories?.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
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
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="completed"
                  checked={formData.completed}
                  onChange={(e) => setFormData({ ...formData, completed: e.target.checked })}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  disabled={isLoading}
                />
                <label htmlFor="completed" className="text-sm text-gray-700">
                  Mark as completed
                </label>
              </div>
            )}

            {/* Recurring Task Option */}
            {!task && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ApperIcon name="RotateCcw" className="w-4 h-4 text-gray-600" />
                    <label className="text-sm font-medium text-gray-700">
                      Make this a recurring task
                    </label>
                  </div>
                  <Checkbox
                    checked={formData.isRecurring}
                    onChange={(e) => handleRecurringToggle(e.target.checked)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                </div>
                
                {formData.isRecurring && formData.recurringConfig && (
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <ApperIcon name="Calendar" className="w-4 h-4 text-primary" />
                        <span className="text-sm text-gray-700">
                          {formData.recurringConfig.pattern === 'daily' && `Every ${formData.recurringConfig.frequency} day(s)`}
                          {formData.recurringConfig.pattern === 'weekly' && `Weekly on ${formData.recurringConfig.daysOfWeek.join(', ')}`}
                          {formData.recurringConfig.pattern === 'monthly' && `Monthly on day ${formData.recurringConfig.dayOfMonth}`}
                        </span>
                      </div>
                      <Button
                        type="button"
                        onClick={() => setShowRecurringModal(true)}
                        className="text-xs text-primary hover:bg-primary/10 px-2 py-1 rounded transition-colors"
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                )}
              </div>
)}

            {/* Error Message */}
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <ApperIcon name="AlertCircle" className="w-4 h-4 text-red-600" />
                  <p className="text-sm text-red-700">{errors.submit}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div>
                {task && (
                  <Button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isLoading}
                    className="px-3 py-2 text-error hover:bg-error/10 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
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
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !formData.title.trim()}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isLoading && <Spinner className="w-4 h-4" />}
                  <span>{task ? 'Update' : 'Create'} Task</span>
                </Button>
              </div>
            </div>
          </form>
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

      <RecurringTaskModal
        isOpen={showRecurringModal}
        onClose={() => setShowRecurringModal(false)}
        onSave={handleRecurringSave}
        initialData={formData.recurringConfig}
      />
    </Modal>
  );
};

export default TaskFormModal;