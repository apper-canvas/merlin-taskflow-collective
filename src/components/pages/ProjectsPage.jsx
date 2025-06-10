import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Textarea from '@/components/atoms/Textarea';
import Select from '@/components/atoms/Select';
import Modal from '@/components/molecules/Modal';
import FormField from '@/components/molecules/FormField';
import EmptyState from '@/components/molecules/EmptyState';
import ErrorState from '@/components/molecules/ErrorState';
import Spinner from '@/components/atoms/Spinner';
import DeleteConfirmationModal from '@/components/organisms/DeleteConfirmationModal';
import { projectService } from '@/services';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmProject, setDeleteConfirmProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
    teamMembers: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectService.getAll();
      setProjects(data);
    } catch (err) {
      setError(err.message || 'Failed to load projects');
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }
    
    if (formData.name.length > 100) {
      newErrors.name = 'Project name must be 100 characters or less';
    }
    
    if (formData.description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less';
    }
    
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      const projectData = {
        ...formData,
        teamMembers: formData.teamMembers ? formData.teamMembers.split(',').map(m => m.trim()).filter(m => m) : []
      };

      if (editingProject) {
        await projectService.update(editingProject.id, projectData);
        toast.success('Project updated successfully');
      } else {
        await projectService.create(projectData);
        toast.success('Project created successfully');
      }
      
      await loadProjects();
      handleCloseModal();
    } catch (error) {
      setFormErrors({ submit: 'Failed to save project. Please try again.' });
      toast.error('Failed to save project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      status: project.status,
      teamMembers: project.teamMembers ? project.teamMembers.join(', ') : ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleDelete = async (projectId) => {
    try {
      await projectService.delete(projectId);
      await loadProjects();
      toast.success('Project deleted successfully');
      setDeleteConfirmProject(null);
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    setFormData({
      name: '',
      description: '',
      status: 'active',
      teamMembers: ''
    });
    setFormErrors({});
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-success bg-success/10';
      case 'on-hold': return 'text-warning bg-warning/10';
      case 'completed': return 'text-primary bg-primary/10';
      case 'cancelled': return 'text-error bg-error/10';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return 'Play';
      case 'on-hold': return 'Pause';
      case 'completed': return 'CheckCircle';
      case 'cancelled': return 'X';
      default: return 'Circle';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <ErrorState 
          title="Failed to load projects"
          message={error}
          onRetry={loadProjects}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
              <p className="text-gray-600 mt-2">Manage your projects and track progress</p>
            </div>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all font-semibold shadow-lg shadow-primary-500/25 flex items-center space-x-2"
            >
              <ApperIcon name="Plus" className="w-5 h-5" />
              <span>New Project</span>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Projects</label>
              <div className="relative">
                <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or description..."
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <EmptyState
            icon="FolderOpen"
            title={searchQuery || statusFilter !== 'all' ? "No projects found" : "No projects yet"}
            message={searchQuery || statusFilter !== 'all' ? "Try adjusting your search or filter criteria" : "Create your first project to get started"}
            action={searchQuery || statusFilter !== 'all' ? undefined : {
              label: "Create Project",
              onClick: () => setIsModalOpen(true)
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all group"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-lg mb-2 break-words">
                        {project.name}
                      </h3>
                      {project.description && (
                        <p className="text-gray-600 text-sm break-words line-clamp-3">
                          {project.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        <ApperIcon name={getStatusIcon(project.status)} className="w-3 h-3 mr-1" />
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ')}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        onClick={() => handleEdit(project)}
                        className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                      >
                        <ApperIcon name="Edit" className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => setDeleteConfirmProject(project)}
                        className="p-2 text-gray-600 hover:text-error hover:bg-error/10 rounded-lg transition-all"
                      >
                        <ApperIcon name="Trash2" className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {project.teamMembers && project.teamMembers.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <ApperIcon name="Users" className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {project.teamMembers.length} team member{project.teamMembers.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {project.teamMembers.slice(0, 3).map((member, i) => (
                          <span key={i} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                            {member}
                          </span>
                        ))}
                        {project.teamMembers.length > 3 && (
                          <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                            +{project.teamMembers.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Project Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProject ? 'Edit Project' : 'Create New Project'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField label="Project Name" required error={formErrors.name}>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter project name"
              disabled={isSubmitting}
              error={formErrors.name}
            />
          </FormField>

          <FormField label="Description" error={formErrors.description}>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter project description"
              disabled={isSubmitting}
              rows={3}
              error={formErrors.description}
            />
          </FormField>

          <FormField label="Status">
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              disabled={isSubmitting}
            >
              <option value="active">Active</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </FormField>

          <FormField label="Team Members" description="Enter team member names separated by commas">
            <Input
              value={formData.teamMembers}
              onChange={(e) => setFormData({ ...formData, teamMembers: e.target.value })}
              placeholder="John Doe, Jane Smith, Bob Wilson"
              disabled={isSubmitting}
            />
          </FormField>

          {formErrors.submit && (
            <div className="text-sm text-error bg-error/10 p-3 rounded-lg border border-error/20">
              {formErrors.submit}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              onClick={handleCloseModal}
              disabled={isSubmitting}
              className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all font-semibold border border-gray-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.name.trim()}
              className="px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all font-semibold shadow-lg shadow-primary-500/25 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" />
                  <span>{editingProject ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : (
                <>
                  <ApperIcon name={editingProject ? "Save" : "Plus"} className="w-4 h-4" />
                  <span>{editingProject ? 'Update Project' : 'Create Project'}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deleteConfirmProject}
        onClose={() => setDeleteConfirmProject(null)}
        onConfirm={() => handleDelete(deleteConfirmProject?.id)}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteConfirmProject?.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default ProjectsPage;