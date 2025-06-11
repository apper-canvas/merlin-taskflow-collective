import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PageHeader from '@/components/organisms/PageHeader';
import DealCard from '@/components/molecules/DealCard';
import Spinner from '@/components/atoms/Spinner';
import EmptyState from '@/components/molecules/EmptyState';
import ErrorState from '@/components/molecules/ErrorState';
import DealFormModal from '@/components/organisms/DealFormModal';
import Button from '@/components/atoms/Button';
import Select from '@/components/atoms/Select';
import Input from '@/components/atoms/Input';
import ApperIcon from '@/components/ApperIcon';
import { dealsService } from '@/services';
import { toast } from 'react-toastify';
import Chart from 'react-apexcharts';

const DealsPage = () => {
  const [deals, setDeals] = useState([]);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('value');
  const [stageFilter, setStageFilter] = useState('all');
  const [salesRepFilter, setSalesRepFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [showDealForm, setShowDealForm] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [viewMode, setViewMode] = useState('dashboard'); // dashboard, cards, table
  const [currentPage, setCurrentPage] = useState(1);
  const [dealsPerPage] = useState(10);
  const [isAdmin, setIsAdmin] = useState(true);

  const stages = ['all', 'prospecting', 'qualification', 'proposal', 'negotiation', 'closed-won', 'closed-lost'];
const salesReps = ['all', 'John Smith', 'Sarah Johnson', 'Mike Wilson', 'Emily Davis', 'David Brown'];
  const regions = ['all', 'North America', 'Europe', 'Asia Pacific', 'Latin America'];
  const productCategories = ['all', 'Software', 'Hardware', 'Services', 'Consulting'];

  useEffect(() => {
    loadDeals();
    // Simulate real-time updates
    const interval = setInterval(() => {
      loadDeals();
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
}, []);
  
  useEffect(() => {
    filterAndSortDeals();
  }, [deals, searchQuery, sortBy, stageFilter, salesRepFilter, regionFilter, productCategoryFilter]);
  const loadDeals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dealsService.getAll();
      setDeals(data);
    } catch (err) {
      setError('Failed to load deals. Please try again.');
      console.error('Error loading deals:', err);
    } finally {
      setLoading(false);
    }
};

  const filterAndSortDeals = () => {
    let filtered = [...deals];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(deal =>
        deal?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal?.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal?.salesRep?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply stage filter
    if (stageFilter !== 'all') {
      filtered = filtered.filter(deal => deal?.stage === stageFilter);
    }
    // Apply sales rep filter
    if (salesRepFilter !== 'all') {
      filtered = filtered.filter(deal => deal?.salesRep === salesRepFilter);
    }

    // Apply region filter
    if (regionFilter !== 'all') {
      filtered = filtered.filter(deal => deal?.region === regionFilter);
    }

    // Apply product category filter
    if (productCategoryFilter !== 'all') {
      filtered = filtered.filter(deal => deal?.productCategory === productCategoryFilter);
    }
// Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'value':
          return (b?.value || 0) - (a?.value || 0);
        case 'probability':
          return (b?.probability || 0) - (a?.probability || 0);
        case 'closeDate':
          return new Date(a?.closeDate || 0) - new Date(b?.closeDate || 0);
        case 'stage':
          return (a?.stage || '').localeCompare(b?.stage || '');
        case 'salesRep':
          return (a?.salesRep || '').localeCompare(b?.salesRep || '');
        case 'created':
          return new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);
        default:
          return (b?.value || 0) - (a?.value || 0);
      }
    });

    setFilteredDeals(filtered);
};

  const calculateMetrics = () => {
    const totalValue = filteredDeals.reduce((sum, deal) => sum + (deal?.value || 0), 0);
    const stageDistribution = stages.slice(1).reduce((acc, stage) => {
      acc[stage] = filteredDeals.filter(deal => deal?.stage === stage).length;
      return acc;
    }, {});
    
    const closedDeals = filteredDeals.filter(deal => deal?.stage === 'closed-won');
    const avgClosingTime = closedDeals.length > 0 
      ? closedDeals.reduce((sum, deal) => {
          const created = new Date(deal?.createdAt || 0);
          const closed = new Date(deal?.closeDate || 0);
          return sum + (closed - created) / (1000 * 60 * 60 * 24);
        }, 0) / closedDeals.length 
      : 0;

    return { totalValue, stageDistribution, avgClosingTime };
  };

  const { totalValue, stageDistribution, avgClosingTime } = calculateMetrics();

  const handleAddDeal = () => {
    setEditingDeal(null);
    setShowDealForm(true);
  };

  const handleEditDeal = (deal) => {
    setEditingDeal(deal);
    setShowDealForm(true);
  };

  const handleDeleteDeal = async (dealId) => {
    if (!confirm('Are you sure you want to delete this deal?')) return;

    try {
      await dealsService.delete(dealId);
      setDeals(prev => prev.filter(deal => deal.id !== dealId));
      toast.success('Deal deleted successfully');
    } catch (err) {
      toast.error('Failed to delete deal');
      console.error('Error deleting deal:', err);
    }
  };

  const handleSaveDeal = async (dealData) => {
    try {
      let savedDeal;
      if (editingDeal) {
        savedDeal = await dealsService.update(editingDeal.id, dealData);
        setDeals(prev => prev.map(deal => 
          deal.id === editingDeal.id ? savedDeal : deal
        ));
        toast.success('Deal updated successfully');
      } else {
        savedDeal = await dealsService.create(dealData);
        setDeals(prev => [savedDeal, ...prev]);
        toast.success('Deal created successfully');
      }
      setShowDealForm(false);
      setEditingDeal(null);
    } catch (err) {
      toast.error('Failed to save deal');
      console.error('Error saving deal:', err);
    }
  };

  // Chart configurations
  const stageChartOptions = {
    chart: { type: 'donut' },
    labels: Object.keys(stageDistribution),
    colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'],
    legend: { position: 'bottom' },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: { width: 200 },
        legend: { position: 'bottom' }
      }
    }]
  };

  const pipelineChartOptions = {
    chart: { type: 'bar', horizontal: true },
    plotOptions: {
      bar: { borderRadius: 4, horizontal: true }
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: Object.keys(stageDistribution)
    },
    colors: ['#3B82F6']
  };

  // Pagination
  const indexOfLastDeal = currentPage * dealsPerPage;
  const indexOfFirstDeal = indexOfLastDeal - dealsPerPage;
  const currentDeals = filteredDeals.slice(indexOfFirstDeal, indexOfLastDeal);
  const totalPages = Math.ceil(filteredDeals.length / dealsPerPage);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStageColor = (stage) => {
    const colors = {
      'prospecting': 'bg-blue-100 text-blue-800',
      'qualification': 'bg-yellow-100 text-yellow-800',
      'proposal': 'bg-purple-100 text-purple-800',
      'negotiation': 'bg-orange-100 text-orange-800',
      'closed-won': 'bg-green-100 text-green-800',
      'closed-lost': 'bg-red-100 text-red-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
};

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <Spinner message="Loading deals..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorState 
          message={error}
          onRetry={loadDeals}
        />
      </div>
    );
}

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Navigation */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sales Deals Dashboard</h1>
            <p className="mt-2 text-gray-600">Track and manage your sales pipeline</p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('dashboard')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'dashboard' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'cards' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'table' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Table
              </button>
            </div>
            <Button onClick={handleAddDeal} className="bg-blue-600 hover:bg-blue-700">
              <ApperIcon name="Plus" size={16} className="mr-2" />
              Create New Deal
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search deals, sales reps, or companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>
      </div>

      {/* Dashboard View */}
      {viewMode === 'dashboard' && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ApperIcon name="DollarSign" size={24} className="text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Deal Value</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ApperIcon name="Target" size={24} className="text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Deals</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredDeals.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ApperIcon name="Clock" size={24} className="text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg. Closing Time</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(avgClosingTime)} days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Deals by Stage</h3>
              <Chart
                options={stageChartOptions}
                series={Object.values(stageDistribution)}
                type="donut"
                height={300}
              />
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Distribution</h3>
              <Chart
                options={pipelineChartOptions}
                series={[{ data: Object.values(stageDistribution) }]}
                type="bar"
                height={300}
              />
            </div>
          </div>
        </>
      )}

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Stage</label>
          <Select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
            {stages.map(stage => (
              <option key={stage} value={stage}>
                {stage === 'all' ? 'All Stages' : stage.charAt(0).toUpperCase() + stage.slice(1).replace('-', ' ')}
              </option>
            ))}
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sales Rep</label>
          <Select value={salesRepFilter} onChange={(e) => setSalesRepFilter(e.target.value)}>
            {salesReps.map(rep => (
              <option key={rep} value={rep}>
                {rep === 'all' ? 'All Sales Reps' : rep}
              </option>
            ))}
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
          <Select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)}>
            {regions.map(region => (
              <option key={region} value={region}>
                {region === 'all' ? 'All Regions' : region}
              </option>
            ))}
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Category</label>
          <Select value={productCategoryFilter} onChange={(e) => setProductCategoryFilter(e.target.value)}>
            {productCategories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="mb-6 flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700">Sort by:</label>
        <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-48">
          <option value="value">Deal Value</option>
          <option value="probability">Probability</option>
          <option value="closeDate">Close Date</option>
          <option value="stage">Stage</option>
          <option value="salesRep">Sales Rep</option>
          <option value="created">Created Date</option>
        </Select>
      </div>

      {/* Content based on view mode */}
      {filteredDeals.length === 0 ? (
        <EmptyState
          iconName="Target"
          title="No deals found"
          description={searchQuery || stageFilter !== 'all' || salesRepFilter !== 'all' || regionFilter !== 'all' || productCategoryFilter !== 'all'
            ? "Try adjusting your filters to see more deals" 
            : "No deals are currently available"}
          actionLabel="Create First Deal"
          onAction={handleAddDeal}
        />
      ) : (
        <>
          {/* Cards View */}
          {viewMode === 'cards' && (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {filteredDeals.map((deal, index) => (
                <motion.div
                  key={deal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <DealCard
                    deal={deal}
                    onEdit={isAdmin ? () => handleEditDeal(deal) : undefined}
                    onDelete={isAdmin ? () => handleDeleteDeal(deal.id) : undefined}
                    isAdmin={isAdmin}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Table View */}
          {viewMode === 'table' && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deal Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales Rep</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Close Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Probability</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
{currentDeals.map((deal) => (
                      <tr key={deal.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{deal?.title || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{deal?.productCategory || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(deal?.value || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStageColor(deal?.stage)}`}>
                            {deal?.stage ? deal.stage.charAt(0).toUpperCase() + deal.stage.slice(1).replace('-', ' ') : 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{deal?.salesRep || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{deal?.region || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {deal?.closeDate ? new Date(deal.closeDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{deal?.probability || 0}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleEditDeal(deal)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            >
                              <ApperIcon name="Edit" size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteDeal(deal.id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded"
                            >
                              <ApperIcon name="Trash2" size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{indexOfFirstDeal + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(indexOfLastDeal, filteredDeals.length)}</span> of{' '}
                        <span className="font-medium">{filteredDeals.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <ApperIcon name="ChevronLeft" size={16} />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === currentPage
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <ApperIcon name="ChevronRight" size={16} />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Deal Form Modal */}
      {showDealForm && (
        <DealFormModal
          deal={editingDeal}
          onSave={handleSaveDeal}
          onClose={() => {
            setShowDealForm(false);
            setEditingDeal(null);
          }}
        />
      )}
    </div>
  );
};

export default DealsPage;