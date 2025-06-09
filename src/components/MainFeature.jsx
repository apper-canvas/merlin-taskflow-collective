import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { format, isToday, isPast, addDays } from 'date-fns';
import ApperIcon from './ApperIcon';
import TaskModal from './TaskModal';
import { taskService, categoryService } from '../services';

function MainFeature() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [showCompleted, setShowCompleted] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tasksData, categoriesData] = await Promise.all([
        taskService.getAll(),
        categoryService.getAll()
      ]);
      setTasks(tasksData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err.message || 'Failed to load data');
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const newTask = await taskService.create(taskData);
      setTasks(prev => [newTask, ...prev]);
      setIsTaskModalOpen(false);
      toast.success('Task created successfully');
    } catch (err) {
      toast.error('Failed to create task');
    }
  };

  const handleUpdateTask = async (taskId, taskData) => {
    try {
      const updatedTask = await taskService.update(taskId, taskData);
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ));
      setIsTaskModalOpen(false);
      setEditingTask(null);
      toast.success('Task updated successfully');
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.delete(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      setIsTaskModalOpen(false);
      setEditingTask(null);
      toast.success('Task deleted successfully');
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const handleCompleteTask = async (taskId, completed) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      const updatedTask = await taskService.update(taskId, {
        completed,
        completedAt: completed ? new Date().toISOString() : null
      });
      setTasks(prev => prev.map(t => 
        t.id === taskId ? updatedTask : t
      ));
      
      if (completed) {
        toast.success('Task completed! 🎉');
      } else {
        toast.info('Task marked as incomplete');
      }
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const handleQuickAdd = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      const title = e.target.value.trim();
      handleCreateTask({
        title,
        description: '',
        category: 'personal',
        priority: 2,
        dueDate: addDays(new Date(), 1).toISOString(),
        completed: false
      });
      e.target.value = '';
    }
  };

  const filteredTasks = tasks
    .filter(task => {
      if (!showCompleted && task.completed) return false;
      if (selectedCategory !== 'all' && task.category !== selectedCategory) return false;
      if (searchQuery) {
        return task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
               task.description.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (sortBy === 'priority') {
        return b.priority - a.priority;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const todayTasks = tasks.filter(task => 
    !task.completed && isToday(new Date(task.dueDate))
  );

  const completedToday = tasks.filter(task => 
    task.completed && task.completedAt && isToday(new Date(task.completedAt))
  );

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 3: return 'text-error';
      case 2: return 'text-warning';
      case 1: return 'text-success';
      default: return 'text-gray-500';
    }
  };

  const getPriorityDot = (priority) => {
    const color = getPriorityColor(priority);
    const animate = priority === 3 ? 'animate-pulse-gentle' : '';
    return <div className={`w-2 h-2 rounded-full ${color.replace('text-', 'bg-')} ${animate}`} />;
  };

  const getCategoryInfo = (categoryId) => {
    return categories.find(cat => cat.id === categoryId) || 
           { name: categoryId, color: '#6B7280', icon: 'Tag' };
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-lg p-4 shadow-sm"
              >
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="text-center">
          <ApperIcon name="AlertCircle" className="w-12 h-12 text-error mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load tasks</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-6 bg-white border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-600">
              {todayTasks.length} tasks due today • {completedToday.length} completed
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleQuickAdd}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all w-full sm:w-64"
              />
            </div>
            
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 hover:scale-105 transition-all flex items-center space-x-2 font-medium shadow-sm"
            >
              <ApperIcon name="Plus" className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
          >
            <option value="dueDate">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="created">Sort by Created</option>
          </select>

          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className={`px-3 py-2 rounded-lg transition-all text-sm font-medium ${
              showCompleted 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showCompleted ? 'Hide Completed' : 'Show Completed'}
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredTasks.length === 0 ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-12"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              <ApperIcon name="CheckSquare" className="w-16 h-16 text-gray-300 mx-auto" />
            </motion.div>
            <h3 className="mt-4 text-lg font-medium">No tasks found</h3>
            <p className="mt-2 text-gray-500">
              {searchQuery ? 'Try adjusting your search or filters' : 'Create your first task to get started'}
            </p>
            {!searchQuery && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsTaskModalOpen(true)}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg shadow-sm"
              >
                Create Task
              </motion.button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredTasks.map((task, index) => {
                const category = getCategoryInfo(task.category);
                const isOverdue = isPast(new Date(task.dueDate)) && !task.completed;
                
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-white rounded-lg shadow-sm border hover:shadow-md transition-all p-4 cursor-pointer group ${
                      task.completed ? 'opacity-75' : ''
                    } ${isOverdue ? 'border-error/30 bg-error/5' : 'border-gray-200'}`}
                    onClick={() => {
                      setEditingTask(task);
                      setIsTaskModalOpen(true);
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <div 
                        className="mt-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompleteTask(task.id, !task.completed);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => {}}
                          className="custom-checkbox"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-medium break-words ${
                              task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                            }`}>
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className={`text-sm mt-1 break-words ${
                                task.completed ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                {task.description}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-3 flex-shrink-0">
                            {getPriorityDot(task.priority)}
                            <span className={`text-xs px-2 py-1 rounded-full font-medium`}
                                  style={{ 
                                    backgroundColor: `${category.color}20`,
                                    color: category.color 
                                  }}>
                              {category.name}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <ApperIcon name="Calendar" className="w-3 h-3" />
                              <span className={isOverdue ? 'text-error font-medium' : ''}>
                                {isToday(new Date(task.dueDate)) 
                                  ? 'Today' 
                                  : format(new Date(task.dueDate), 'MMM d')}
                              </span>
                            </div>
                            {isOverdue && (
                              <span className="text-error font-medium">Overdue</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={editingTask ? handleUpdateTask : handleCreateTask}
        onDelete={handleDeleteTask}
        task={editingTask}
        categories={categories}
      />
    </div>
  );
}

export default MainFeature;