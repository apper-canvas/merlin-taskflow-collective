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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const taskData = {
      ...formData,
      dueDate: new Date(formData.dueDate).toISOString()
    };

    if (task) {
      onSave(task.id, taskData);
    } else {
      onSave(taskData);
    }
  };

  const handleDelete = () => {
    if (task) {
      onDelete(task.id);
      setShowDeleteConfirm(false);
      onClose(); // Close the main modal after deletion
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
    <Modal isOpen={isOpen} onClose={onClose} contentClassName="max-w-md w-full max-h-[90vh] overflow-y-auto">
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Title" required>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter task title..."
                required
                autoFocus
              />
            </FormField>

            <FormField label="Description">
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add description..."
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Category">
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map(category => (
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
              />
            </FormField>

            {task && (
              <div className="flex items-center">
                <Checkbox
                  id="completed"
                  checked={formData.completed}
                  onChange={(e) => setFormData({ ...formData, completed: e.target.checked })}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="completed" className="ml-2 text-sm text-gray-700">
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
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div>
                {task && (
                  <Button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-3 py-2 text-error hover:bg-error/10 rounded-lg transition-colors text-sm font-medium"
                  >
                    Delete Task
                  </Button>
                )}
              </div>

              <div className="flex space-x-3">
                <Button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-sm"
                >
                  {task ? 'Update' : 'Create'} Task
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