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
    category: 'residential',
    discountPercentage: '',
    originalPrice: '',
    salePrice: '',
    expiryDate: '',
    projectLink: '',
    image: '',
    featured: false
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const categories = [
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'renovation', label: 'Renovation' },
    { value: 'landscaping', label: 'Landscaping' }
  ];

  useEffect(() => {
    if (deal) {
      setFormData({
        title: deal.title || '',
        description: deal.description || '',
        category: deal.category || 'residential',
        discountPercentage: deal.discountPercentage?.toString() || '',
        originalPrice: deal.originalPrice?.toString() || '',
        salePrice: deal.salePrice?.toString() || '',
        expiryDate: deal.expiryDate ? deal.expiryDate.split('T')[0] : '',
        projectLink: deal.projectLink || '',
        image: deal.image || '',
        featured: deal.featured || false
      });
    }
  }, [deal]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.discountPercentage || formData.discountPercentage < 1 || formData.discountPercentage > 99) {
      newErrors.discountPercentage = 'Discount must be between 1 and 99%';
    }

    if (!formData.salePrice || formData.salePrice < 0) {
      newErrors.salePrice = 'Sale price is required and must be positive';
    }

    if (formData.originalPrice && formData.originalPrice < formData.salePrice) {
      newErrors.originalPrice = 'Original price must be higher than sale price';
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else {
      const expiryDate = new Date(formData.expiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (expiryDate < today) {
        newErrors.expiryDate = 'Expiry date must be in the future';
      }
    }

    if (!formData.projectLink.trim()) {
      newErrors.projectLink = 'Project link is required';
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
        discountPercentage: parseInt(formData.discountPercentage),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        salePrice: parseFloat(formData.salePrice),
        expiryDate: formData.expiryDate
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
          {/* Title */}
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
              placeholder="Describe the deal..."
              rows={3}
              error={errors.description}
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <Select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Discount Percentage */}
          <div>
            <Input
              label="Discount Percentage"
              type="number"
              value={formData.discountPercentage}
              onChange={(e) => handleChange('discountPercentage', e.target.value)}
              placeholder="10"
              min="1"
              max="99"
              error={errors.discountPercentage}
              required
            />
          </div>

          {/* Original Price */}
          <div>
            <Input
              label="Original Price (Optional)"
              type="number"
              value={formData.originalPrice}
              onChange={(e) => handleChange('originalPrice', e.target.value)}
              placeholder="100000"
              min="0"
              step="1000"
              error={errors.originalPrice}
            />
          </div>

          {/* Sale Price */}
          <div>
            <Input
              label="Sale Price"
              type="number"
              value={formData.salePrice}
              onChange={(e) => handleChange('salePrice', e.target.value)}
              placeholder="90000"
              min="0"
              step="1000"
              error={errors.salePrice}
              required
            />
          </div>

          {/* Expiry Date */}
          <div>
            <Input
              label="Expiry Date"
              type="date"
              value={formData.expiryDate}
              onChange={(e) => handleChange('expiryDate', e.target.value)}
              error={errors.expiryDate}
              required
            />
          </div>

          {/* Project Link */}
          <div>
            <Input
              label="Project Link"
              value={formData.projectLink}
              onChange={(e) => handleChange('projectLink', e.target.value)}
              placeholder="/projects/luxury-home"
              error={errors.projectLink}
              required
            />
          </div>

          {/* Image URL */}
          <div className="md:col-span-2">
            <Input
              label="Image URL (Optional)"
              value={formData.image}
              onChange={(e) => handleChange('image', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Featured Toggle */}
          <div className="md:col-span-2">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => handleChange('featured', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Featured Deal
              </span>
            </label>
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