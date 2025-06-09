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

const TaskFormModal = ({ isOpen, onClose, onSave, onDelete, task, categories }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'personal',
    priority: 2,
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    completed: false
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        category: task.category,
        priority: task.priority,
        dueDate: format(new Date(task.dueDate), 'yyyy-MM-dd'),
        completed: task.completed
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'personal',
        priority: 2,
        dueDate: format(new Date(), 'yyyy-MM-dd'),
        completed: false
      });
    }
    setShowDeleteConfirm(false); // Reset confirmation state
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
    </Modal>
  );
};

export default TaskFormModal;