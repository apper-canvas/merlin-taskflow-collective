import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';
import { toast } from 'react-toastify';
import ApperIcon from '../components/ApperIcon';
import { taskService, categoryService, projectService } from '../services';
function Archive() {
const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  useEffect(() => {
    loadData();
  }, []);

const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tasksData, categoriesData, projectsData] = await Promise.all([
        taskService.getAll(),
        categoryService.getAll(),
        projectService.getAll()
      ]);
      setTasks(tasksData);
      setCategories(categoriesData);
      setProjects(projectsData);
    } catch (err) {
      setError(err.message || 'Failed to load data');
      toast.error('Failed to load archived tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreTask = async (taskId) => {
    try {
      const updatedTask = await taskService.update(taskId, { completed: false });
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ));
      toast.success('Task restored successfully');
    } catch (err) {
      toast.error('Failed to restore task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.delete(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast.success('Task permanently deleted');
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const completedTasks = tasks
    .filter(task => task.completed)
    .filter(task => {
      if (selectedCategory !== 'all' && task.category !== selectedCategory) return false;
      if (searchQuery) {
        return task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
               task.description.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt));

const getCategoryInfo = (categoryId) => {
    return categories.find(cat => cat.id === categoryId) || 
           { name: categoryId, color: '#6B7280', icon: 'Tag' };
  };

  const getProjectInfo = (projectId) => {
    return projects.find(proj => proj.id === projectId);
  };
  const getCompletionTimeAgo = (completedAt) => {
    if (!completedAt) return 'Unknown';
    const days = differenceInDays(new Date(), new Date(completedAt));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load archive</h3>
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
            <h1 className="text-2xl font-display font-bold text-gray-900">Archive</h1>
            <p className="text-gray-600">
              {completedTasks.length} completed task{completedTasks.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search completed tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all w-full sm:w-64"
              />
            </div>
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
        </div>
      </div>

      {/* Completed Tasks List */}
      <div className="flex-1 overflow-y-auto p-6">
        {completedTasks.length === 0 ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-12"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              <ApperIcon name="Archive" className="w-16 h-16 text-gray-300 mx-auto" />
            </motion.div>
            <h3 className="mt-4 text-lg font-medium">No completed tasks</h3>
            <p className="mt-2 text-gray-500">
              {searchQuery ? 'No completed tasks match your search' : 'Completed tasks will appear here'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
{completedTasks.map((task, index) => {
              const category = getCategoryInfo(task.category);
              const project = getProjectInfo(task.projectId);
              
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all p-4 group"
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      <div className="w-5 h-5 bg-success rounded-full flex items-center justify-center">
                        <ApperIcon name="Check" className="w-3 h-3 text-white" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 line-through break-words">
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-sm text-gray-500 mt-1 break-words">
                              {task.description}
                            </p>
                          )}
                          {project && (
                            <div className="flex items-center space-x-1 mt-2">
                              <ApperIcon name="FolderOpen" className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {project.name}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-3 flex-shrink-0">
                          <span className="text-xs px-2 py-1 rounded-full font-medium"
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
                            <span>
                              Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ApperIcon name="CheckCircle" className="w-3 h-3" />
                            <span>
                              Completed {getCompletionTimeAgo(task.completedAt)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleRestoreTask(task.id)}
                            className="px-2 py-1 text-xs bg-accent text-white rounded hover:bg-accent/90 transition-colors"
                          >
                            Restore
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteTask(task.id)}
                            className="px-2 py-1 text-xs bg-error text-white rounded hover:bg-error/90 transition-colors"
                          >
                            Delete
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Archive;