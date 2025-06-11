import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Modal from '@/components/molecules/Modal';
import Input from '@/components/atoms/Input';
import Textarea from '@/components/atoms/Textarea';
import Select from '@/components/atoms/Select';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const DealFormModal = ({ deal, onSave, onClose }) => {
const [formData, setFormData] = useState({
    title: '',
    description: '',
    value: '',
    stage: 'prospecting',
    salesRep: '',
    region: '',
    productCategory: 'Software',
    probability: '',
    closeDate: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

const stages = [
    { value: 'prospecting', label: 'Prospecting' },
    { value: 'qualification', label: 'Qualification' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'closed-won', label: 'Closed Won' },
    { value: 'closed-lost', label: 'Closed Lost' }
  ];

  const salesReps = ['John Smith', 'Sarah Johnson', 'Mike Wilson', 'Emily Davis', 'David Brown'];
  const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America'];
  const productCategories = ['Software', 'Hardware', 'Services', 'Consulting'];

useEffect(() => {
    if (deal) {
      setFormData({
        title: deal.title || '',
        description: deal.description || '',
        value: deal.value?.toString() || '',
        stage: deal.stage || 'prospecting',
        salesRep: deal.salesRep || '',
        region: deal.region || '',
        productCategory: deal.productCategory || 'Software',
        probability: deal.probability?.toString() || '',
        closeDate: deal.closeDate ? deal.closeDate.split('T')[0] : '',
        notes: deal.notes || ''
      });
    }
  }, [deal]);

const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Deal title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.value || formData.value < 0) {
      newErrors.value = 'Deal value is required and must be positive';
    }

    if (!formData.salesRep.trim()) {
      newErrors.salesRep = 'Sales rep is required';
    }

    if (!formData.region.trim()) {
      newErrors.region = 'Region is required';
    }

    if (!formData.probability || formData.probability < 0 || formData.probability > 100) {
      newErrors.probability = 'Probability must be between 0 and 100%';
    }

    if (!formData.closeDate) {
      newErrors.closeDate = 'Expected close date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const dealData = {
        ...formData,
        value: parseFloat(formData.value),
        probability: parseInt(formData.probability),
        closeDate: formData.closeDate
      };

      await onSave(dealData);
    } catch (err) {
      console.error('Error saving deal:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={deal ? 'Edit Deal' : 'Create New Deal'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Deal Title */}
          <div className="md:col-span-2">
            <Input
              label="Deal Title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter deal title..."
              error={errors.title}
              required
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe the deal opportunity..."
              rows={3}
              error={errors.description}
              required
            />
          </div>

          {/* Deal Value */}
          <div>
            <Input
              label="Deal Value"
              type="number"
              value={formData.value}
              onChange={(e) => handleChange('value', e.target.value)}
              placeholder="100000"
              min="0"
              step="1000"
              error={errors.value}
              required
            />
          </div>

          {/* Stage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stage
            </label>
            <Select
              value={formData.stage}
              onChange={(e) => handleChange('stage', e.target.value)}
            >
              {stages.map(stage => (
                <option key={stage.value} value={stage.value}>
                  {stage.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Sales Rep */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sales Rep
            </label>
            <Select
              value={formData.salesRep}
              onChange={(e) => handleChange('salesRep', e.target.value)}
              error={errors.salesRep}
            >
              <option value="">Select sales rep...</option>
              {salesReps.map(rep => (
                <option key={rep} value={rep}>
                  {rep}
                </option>
              ))}
            </Select>
          </div>

          {/* Region */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Region
            </label>
            <Select
              value={formData.region}
              onChange={(e) => handleChange('region', e.target.value)}
              error={errors.region}
            >
              <option value="">Select region...</option>
              {regions.map(region => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </Select>
          </div>

          {/* Product Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Category
            </label>
            <Select
              value={formData.productCategory}
              onChange={(e) => handleChange('productCategory', e.target.value)}
            >
              {productCategories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </div>

          {/* Probability */}
          <div>
            <Input
              label="Probability (%)"
              type="number"
              value={formData.probability}
              onChange={(e) => handleChange('probability', e.target.value)}
              placeholder="75"
              min="0"
              max="100"
              error={errors.probability}
              required
            />
          </div>

          {/* Expected Close Date */}
          <div>
            <Input
              label="Expected Close Date"
              type="date"
              value={formData.closeDate}
              onChange={(e) => handleChange('closeDate', e.target.value)}
              error={errors.closeDate}
              required
            />
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <Textarea
              label="Notes (Optional)"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Additional notes about this deal..."
              rows={3}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? (
              <>
                <ApperIcon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                {deal ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              deal ? 'Update Deal' : 'Create Deal'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DealFormModal;