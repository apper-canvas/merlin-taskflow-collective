import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import ApperIcon from './ApperIcon';

function TaskModal({ isOpen, onClose, onSave, onDelete, task, categories }) {
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
    setShowDeleteConfirm(false);
  }, [task]);

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
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 3: return 'High';
      case 2: return 'Medium';
      case 1: return 'Low';
      default: return 'Medium';
    }
  };

  const getCategoryInfo = (categoryId) => {
    return categories.find(cat => cat.id === categoryId) || 
           { name: categoryId, color: '#6B7280', icon: 'Tag' };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-display font-semibold text-gray-900">
                    {task ? 'Edit Task' : 'Create Task'}
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ApperIcon name="X" className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder="Enter task title..."
                      required
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                      placeholder="Add description..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      >
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      >
                        <option value={3}>High</option>
                        <option value={2}>Medium</option>
                        <option value={1}>Low</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  {task && (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
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
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(true)}
                          className="px-3 py-2 text-error hover:bg-error/10 rounded-lg transition-colors text-sm font-medium"
                        >
                          Delete Task
                        </button>
                      )}
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-sm"
                      >
                        {task ? 'Update' : 'Create'} Task
                      </motion.button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>

          {/* Delete Confirmation */}
          <AnimatePresence>
            {showDeleteConfirm && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 z-[60]"
                  onClick={() => setShowDeleteConfirm(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                >
                  <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-error/10 rounded-full flex items-center justify-center">
                        <ApperIcon name="Trash2" className="w-5 h-5 text-error" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Delete Task</h3>
                        <p className="text-sm text-gray-500">This action cannot be undone.</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleDelete}
                        className="flex-1 px-4 py-2 bg-error text-white rounded-lg hover:bg-error/90 transition-colors font-medium"
                      >
                        Delete
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}

export default TaskModal;