import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { isToday, addDays } from 'date-fns';
import { taskService, categoryService } from '@/services';
import PageHeader from '@/components/organisms/PageHeader';
import TaskCard from '@/components/molecules/TaskCard';
import TaskFormModal from '@/components/organisms/TaskFormModal';
import EmptyState from '@/components/molecules/EmptyState';
import ErrorState from '@/components/molecules/ErrorState';
import Spinner from '@/components/atoms/Spinner';

function TaskDashboard() {
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

  const getCategoryInfo = (categoryId) => {
    return categories.find(cat => cat.id === categoryId) ||
           { name: categoryId, color: '#6B7280', icon: 'Tag' };
  };

  if (loading) {
    return <div className="p-6 space-y-6"><Spinner count={5} /></div>;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div className="h-full flex flex-col max-w-full overflow-hidden">
      <PageHeader
        title="Tasks"
        subtitle={`${todayTasks.length} tasks due today • ${completedToday.length} completed`}
        searchQuery={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        onSearchKeyDown={handleQuickAdd}
        selectedCategory={selectedCategory}
        onCategoryChange={(e) => setSelectedCategory(e.target.value)}
        categories={categories}
        sortBy={sortBy}
        onSortByChange={(e) => setSortBy(e.target.value)}
        showToggle={true}
        toggleLabel={showCompleted ? 'Hide Completed' : 'Show Completed'}
        onToggle={() => setShowCompleted(!showCompleted)}
        toggleActive={showCompleted}
        onAddClick={() => setIsTaskModalOpen(true)}
        addBtnText="Add Task"
      />

      <div className="flex-1 overflow-y-auto p-6">
        {filteredTasks.length === 0 ? (
          <EmptyState
            iconName="CheckSquare"
            title="No tasks found"
            description={searchQuery ? 'Try adjusting your search or filters' : 'Create your first task to get started'}
            showButton={!searchQuery}
            buttonText="Create Task"
            onButtonClick={() => setIsTaskModalOpen(true)}
          />
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredTasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  categoryInfo={getCategoryInfo(task.category)}
                  onToggleComplete={handleCompleteTask}
                  onClick={() => {
                    setEditingTask(task);
                    setIsTaskModalOpen(true);
                  }}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <TaskFormModal
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

export default TaskDashboard;