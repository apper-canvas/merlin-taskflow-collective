import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { format, parseISO } from 'date-fns';
import Chart from 'react-apexcharts';
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
import { chartService } from '@/services/api/chartService';
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
  
  // Chart-related state
  const [selectedChart, setSelectedChart] = useState(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [drillDownProject, setDrillDownProject] = useState(null);
  const [isDrillDownOpen, setIsDrillDownOpen] = useState(false);
  
  // Chart refs for export functionality
  const statusChartRef = useRef(null);
  const budgetChartRef = useRef(null);
  const spendChartRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
    startDate: '',
    endDate: '',
    budget: '',
    actualSpend: '',
    teamMembers: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      loadProjects();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);
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

// Metrics calculations
const getProjectMetrics = () => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const onHoldProjects = projects.filter(p => p.status === 'on-hold').length;
    const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;
    
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const totalSpend = projects.reduce((sum, p) => sum + (p.actualSpend || 0), 0);
    const budgetVariance = totalBudget - totalSpend;
    
    return {
      totalProjects,
      activeProjects,
      completedProjects,
      onHoldProjects,
      completionRate,
      totalBudget,
      totalSpend,
      budgetVariance
    };
  };

  // Chart data processing functions
  const getChartData = () => {
    const statusData = chartService.getStatusDistributionData(projects);
    const budgetData = chartService.getBudgetAllocationData(projects);
    const spendData = chartService.getSpendTrackingData(projects);
    
    return {
      statusData,
      budgetData,
      spendData
    };
  };

  // Handle chart element clicks for drill-down
  const handleChartElementClick = (data) => {
    if (data.projects && data.projects.length > 0) {
      // For status distribution chart
      setDrillDownProject({ 
        type: 'status', 
        status: data.status, 
        projects: data.projects 
      });
    } else if (data.project) {
      // For budget allocation chart
      setDrillDownProject({ 
        type: 'project', 
        project: data.project 
      });
    }
    setIsDrillDownOpen(true);
  };

  // Handle chart export
  const handleExportChart = async (type, format) => {
    setChartLoading(true);
    try {
      if (format === 'image') {
        let chartRef;
        switch (type) {
          case 'status':
            chartRef = statusChartRef;
            break;
          case 'budget':
            chartRef = budgetChartRef;
            break;
          case 'spend':
            chartRef = spendChartRef;
            break;
          default:
            return;
        }
        await chartService.exportChartAsImage(chartRef, `${type}-chart`);
        toast.success('Chart exported successfully!');
      } else if (format === 'csv') {
        const { statusData, budgetData, spendData } = getChartData();
        let exportData;
        switch (type) {
          case 'status':
            exportData = statusData;
            break;
          case 'budget':
            exportData = budgetData;
            break;
          case 'spend':
            exportData = spendData;
            break;
          default:
            return;
        }
        chartService.exportDataAsCSV(exportData, `${type}-data`);
        toast.success('Data exported successfully!');
      }
    } catch (error) {
      toast.error(`Failed to export ${format}: ${error.message}`);
    } finally {
      setChartLoading(false);
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

    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (formData.budget && (isNaN(formData.budget) || Number(formData.budget) < 0)) {
      newErrors.budget = 'Budget must be a valid positive number';
    }

    if (formData.actualSpend && (isNaN(formData.actualSpend) || Number(formData.actualSpend) < 0)) {
      newErrors.actualSpend = 'Actual spend must be a valid positive number';
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
        budget: formData.budget ? Number(formData.budget) : 0,
        actualSpend: formData.actualSpend ? Number(formData.actualSpend) : 0,
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
setFormData({
      name: project.name,
      description: project.description || '',
      status: project.status,
      startDate: project.startDate || '',
      endDate: project.endDate || '',
      budget: project.budget ? project.budget.toString() : '',
      actualSpend: project.actualSpend ? project.actualSpend.toString() : '',
      teamMembers: project.teamMembers ? project.teamMembers.join(', ') : ''
    });
    setFormErrors({});
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
      startDate: '',
      endDate: '',
      budget: '',
      actualSpend: '',
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

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === 'startDate' || sortField === 'endDate') {
      aValue = aValue ? new Date(aValue) : new Date(0);
      bValue = bValue ? new Date(bValue) : new Date(0);
    } else if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue?.toLowerCase() || '';
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return '-';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const metrics = getProjectMetrics();
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
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Projects Dashboard</h1>
              <p className="text-gray-600 mt-2">Monitor project progress and manage your portfolio</p>
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

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.totalProjects}</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-lg">
                <ApperIcon name="FolderOpen" className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-success mt-1">{metrics.activeProjects}</p>
              </div>
              <div className="p-3 bg-success-50 rounded-lg">
                <ApperIcon name="Play" className="w-6 h-6 text-success" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Budget vs Spend</p>
                <p className={`text-2xl font-bold mt-1 ${metrics.budgetVariance >= 0 ? 'text-success' : 'text-error'}`}>
                  {formatCurrency(metrics.budgetVariance)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(metrics.totalSpend)} of {formatCurrency(metrics.totalBudget)}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${metrics.budgetVariance >= 0 ? 'bg-success-50' : 'bg-error-50'}`}>
                <ApperIcon name="DollarSign" className={`w-6 h-6 ${metrics.budgetVariance >= 0 ? 'text-success' : 'text-error'}`} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-primary-600 mt-1">{metrics.completionRate}%</p>
                <p className="text-xs text-gray-500 mt-1">
                  {metrics.completedProjects} of {metrics.totalProjects} completed
                </p>
              </div>
              <div className="p-3 bg-primary-50 rounded-lg">
                <ApperIcon name="TrendingUp" className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </motion.div>
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

        {/* Interactive Charts Section */}
        {projects.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Project Analytics</h2>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleExportChart('status', 'csv')}
                  disabled={chartLoading}
                  className="flex items-center gap-2"
                >
                  <ApperIcon name="Download" className="w-4 h-4" />
                  Export Data
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Status Distribution Bar Chart */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Project Status Distribution</h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleExportChart('status', 'image')}
                      disabled={chartLoading}
                      className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                      title="Export as image"
                    >
                      <ApperIcon name="Camera" className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleExportChart('status', 'csv')}
                      disabled={chartLoading}
                      className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                      title="Export as CSV"
                    >
                      <ApperIcon name="FileSpreadsheet" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <Spinner />
                  </div>
                ) : (
                  <Chart
                    ref={statusChartRef}
                    options={chartService.getBarChartConfig(
                      chartService.getStatusDistributionData(projects),
                      handleChartElementClick
                    )}
                    series={chartService.getBarChartConfig(
                      chartService.getStatusDistributionData(projects),
                      handleChartElementClick
                    ).series}
                    type="bar"
                    height={300}
                  />
                )}
              </div>

              {/* Budget Allocation Pie Chart */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Budget Allocation</h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleExportChart('budget', 'image')}
                      disabled={chartLoading}
                      className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                      title="Export as image"
                    >
                      <ApperIcon name="Camera" className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleExportChart('budget', 'csv')}
                      disabled={chartLoading}
                      className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                      title="Export as CSV"
                    >
                      <ApperIcon name="FileSpreadsheet" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <Spinner />
                  </div>
                ) : (
                  <Chart
                    ref={budgetChartRef}
                    options={chartService.getPieChartConfig(
                      chartService.getBudgetAllocationData(projects),
                      handleChartElementClick
                    )}
                    series={chartService.getPieChartConfig(
                      chartService.getBudgetAllocationData(projects),
                      handleChartElementClick
                    ).series}
                    type="pie"
                    height={300}
                  />
                )}
              </div>

              {/* Spend Tracking Line Chart */}
              <div className="bg-gray-50 rounded-lg p-4 lg:col-span-2 xl:col-span-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Spend Tracking</h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleExportChart('spend', 'image')}
                      disabled={chartLoading}
                      className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                      title="Export as image"
                    >
                      <ApperIcon name="Camera" className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleExportChart('spend', 'csv')}
                      disabled={chartLoading}
                      className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                      title="Export as CSV"
                    >
                      <ApperIcon name="FileSpreadsheet" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <Spinner />
                  </div>
                ) : (
                  <Chart
                    ref={spendChartRef}
                    options={chartService.getLineChartConfig(
                      chartService.getSpendTrackingData(projects)
                    )}
                    series={chartService.getLineChartConfig(
                      chartService.getSpendTrackingData(projects)
                    ).series}
                    type="line"
                    height={300}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Drill-down Modal */}
        <Modal
          isOpen={isDrillDownOpen}
          onClose={() => setIsDrillDownOpen(false)}
          className="max-w-4xl"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {drillDownProject?.type === 'status' 
                  ? `${drillDownProject.status} Projects`
                  : 'Project Details'
                }
              </h2>
              <button
                onClick={() => setIsDrillDownOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ApperIcon name="X" className="w-6 h-6" />
              </button>
            </div>

            {drillDownProject?.type === 'status' && (
              <div className="space-y-4">
                <p className="text-gray-600 mb-4">
                  Found {drillDownProject.projects.length} project{drillDownProject.projects.length !== 1 ? 's' : ''} with status: {drillDownProject.status}
                </p>
                <div className="grid gap-4">
                  {drillDownProject.projects.map(project => (
                    <div key={project.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">{project.name}</h3>
                          <p className="text-gray-600 text-sm mb-3">{project.description}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Budget:</span>
                              <p className="font-medium">{formatCurrency(project.budget)}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Actual Spend:</span>
                              <p className="font-medium">{formatCurrency(project.actualSpend)}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Start Date:</span>
                              <p className="font-medium">{formatDate(project.startDate)}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">End Date:</span>
                              <p className="font-medium">{formatDate(project.endDate)}</p>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEdit(project)}
                            className="flex items-center gap-2"
                          >
                            <ApperIcon name="Edit2" className="w-4 h-4" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {drillDownProject?.type === 'project' && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {drillDownProject.project.name}
                  </h3>
                  <p className="text-gray-600 mb-6">{drillDownProject.project.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm text-gray-500">Status</span>
                        <div className="flex items-center gap-2 mt-1">
                          <ApperIcon 
                            name={getStatusIcon(drillDownProject.project.status)} 
                            className={`w-4 h-4 ${getStatusColor(drillDownProject.project.status)}`} 
                          />
                          <span className="font-medium capitalize">
                            {drillDownProject.project.status.replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Budget</span>
                        <p className="font-semibold text-lg">{formatCurrency(drillDownProject.project.budget)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Actual Spend</span>
                        <p className="font-semibold text-lg">{formatCurrency(drillDownProject.project.actualSpend)}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm text-gray-500">Start Date</span>
                        <p className="font-medium">{formatDate(drillDownProject.project.startDate)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">End Date</span>
                        <p className="font-medium">{formatDate(drillDownProject.project.endDate)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Team Members</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {drillDownProject.project.teamMembers.map((member, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {member}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex gap-3">
                      <Button
                        onClick={() => {
                          handleEdit(drillDownProject.project);
                          setIsDrillDownOpen(false);
                        }}
                        className="flex items-center gap-2"
                      >
                        <ApperIcon name="Edit2" className="w-4 h-4" />
                        Edit Project
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => setIsDrillDownOpen(false)}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
{/* Projects Table */}
        {sortedProjects.length === 0 ? (
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Project Name</span>
                        {sortField === 'name' && (
                          <ApperIcon
                            name={sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown'}
                            className="w-4 h-4"
                          />
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('startDate')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Start Date</span>
                        {sortField === 'startDate' && (
                          <ApperIcon
                            name={sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown'}
                            className="w-4 h-4"
                          />
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('endDate')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>End Date</span>
                        {sortField === 'endDate' && (
                          <ApperIcon
                            name={sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown'}
                            className="w-4 h-4"
                          />
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Status</span>
                        {sortField === 'status' && (
                          <ApperIcon
                            name={sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown'}
                            className="w-4 h-4"
                          />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedProjects.map((project, index) => (
                    <motion.tr
                      key={project.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{project.name}</div>
                          {project.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {project.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(project.startDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(project.endDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          <ApperIcon name={getStatusIcon(project.status)} className="w-3 h-3 mr-1" />
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
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
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
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

<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Start Date">
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                disabled={isSubmitting}
                error={formErrors.startDate}
              />
            </FormField>

            <FormField label="End Date" error={formErrors.endDate}>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                disabled={isSubmitting}
                error={formErrors.endDate}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Budget" error={formErrors.budget}>
              <Input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="0"
                disabled={isSubmitting}
                error={formErrors.budget}
              />
            </FormField>

            <FormField label="Actual Spend" error={formErrors.actualSpend}>
              <Input
                type="number"
                value={formData.actualSpend}
                onChange={(e) => setFormData({ ...formData, actualSpend: e.target.value })}
                placeholder="0"
                disabled={isSubmitting}
                error={formErrors.actualSpend}
              />
            </FormField>
          </div>

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