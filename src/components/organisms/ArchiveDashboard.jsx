import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { taskService, categoryService } from '@/services';
import PageHeader from '@/components/organisms/PageHeader';
import ArchiveTaskCard from '@/components/molecules/ArchiveTaskCard';
import EmptyState from '@/components/molecules/EmptyState';
import ErrorState from '@/components/molecules/ErrorState';
import Spinner from '@/components/atoms/Spinner';

function ArchiveDashboard() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
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
      const [tasksData, categoriesData] = await Promise.all([
        taskService.getAll(),
        categoryService.getAll()
      ]);
      setTasks(tasksData);
      setCategories(categoriesData);
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

  if (loading) {
    return <div className="p-6 space-y-6"><Spinner count={3} /></div>;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div className="h-full flex flex-col max-w-full overflow-hidden">
      <PageHeader
        title="Archive"
        subtitle={`${completedTasks.length} completed task${completedTasks.length !== 1 ? 's' : ''}`}
        searchQuery={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        onSearchKeyDown={() => {}} // No quick add for archive
        selectedCategory={selectedCategory}
        onCategoryChange={(e) => setSelectedCategory(e.target.value)}
        categories={categories}
        // No sorting for archive, so omit sortBy related props
      />

      <div className="flex-1 overflow-y-auto p-6">
        {completedTasks.length === 0 ? (
          <EmptyState
            iconName="Archive"
            title="No completed tasks"
            description={searchQuery ? 'No completed tasks match your search' : 'Completed tasks will appear here'}
          />
        ) : (
          <div className="space-y-3">
            {completedTasks.map((task, index) => (
              <ArchiveTaskCard
                key={task.id}
                task={task}
                categoryInfo={getCategoryInfo(task.category)}
                onRestore={handleRestoreTask}
                onDelete={handleDeleteTask}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ArchiveDashboard;