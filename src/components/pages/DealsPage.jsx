import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PageHeader from '@/components/organisms/PageHeader';
import DealCard from '@/components/molecules/DealCard';
import DealFormModal from '@/components/organisms/DealFormModal';
import Spinner from '@/components/atoms/Spinner';
import EmptyState from '@/components/molecules/EmptyState';
import ErrorState from '@/components/molecules/ErrorState';
import Button from '@/components/atoms/Button';
import Select from '@/components/atoms/Select';
import { dealsService } from '@/services';
import { toast } from 'react-toastify';

const DealsPage = () => {
  const [deals, setDeals] = useState([]);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('expiry');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [discountFilter, setDiscountFilter] = useState('all');
  const [showDealForm, setShowDealForm] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [isAdmin, setIsAdmin] = useState(true); // In real app, this would come from auth

const categories = ['all', 'ui-tools', 'prototyping', 'design-systems', 'collaboration', 'ui-libraries'];
  const discountRanges = [
    { value: 'all', label: 'All Discounts' },
    { value: '0-10', label: '0-10% Off' },
    { value: '11-25', label: '11-25% Off' },
    { value: '26-50', label: '26-50% Off' },
    { value: '50+', label: '50%+ Off' }
  ];

  useEffect(() => {
    loadDeals();
  }, []);

  useEffect(() => {
    filterAndSortDeals();
  }, [deals, searchQuery, sortBy, categoryFilter, discountFilter]);

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
        deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(deal => deal.category === categoryFilter);
    }

    // Apply discount filter
    if (discountFilter !== 'all') {
      const [min, max] = discountFilter.includes('+') 
        ? [50, 100] 
        : discountFilter.split('-').map(n => parseInt(n));
      
      filtered = filtered.filter(deal => {
        const discount = deal.discountPercentage;
        return discount >= min && (max ? discount <= max : true);
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'discount':
          return b.discountPercentage - a.discountPercentage;
        case 'expiry':
          return new Date(a.expiryDate) - new Date(b.expiryDate);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return new Date(a.expiryDate) - new Date(b.expiryDate);
      }
    });

    setFilteredDeals(filtered);
  };

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
      <PageHeader
        title="Exclusive Deals for Design Agencies"
        subtitle="Premium design tools and resources curated for web app and dashboard specialists"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search design tools and resources..."
        sortBy={sortBy}
        onSortByChange={setSortBy}
        onAddClick={isAdmin ? handleAddDeal : undefined}
        addBtnText="Add New Deal"
      />
      
      {/* Filters */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
{categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : 
                 category === 'ui-tools' ? 'UI Tools' :
                 category === 'design-systems' ? 'Design Systems' :
                 category === 'ui-libraries' ? 'UI Libraries' :
                 category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Discount Range
          </label>
          <Select
            value={discountFilter}
            onChange={(e) => setDiscountFilter(e.target.value)}
          >
            {discountRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Deals Grid */}
      {filteredDeals.length === 0 ? (
        <EmptyState
          iconName="Tag"
          title="No deals found"
          description={searchQuery || categoryFilter !== 'all' || discountFilter !== 'all' 
            ? "Try adjusting your filters to see more deals" 
            : "No deals are currently available"}
          actionLabel={isAdmin ? "Add First Deal" : undefined}
          onAction={isAdmin ? handleAddDeal : undefined}
        />
      ) : (
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