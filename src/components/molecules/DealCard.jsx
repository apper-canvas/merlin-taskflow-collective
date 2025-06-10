import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import SocialShareModal from '@/components/organisms/SocialShareModal';

const DealCard = ({ deal, onEdit, onDelete, isAdmin }) => {
  const [showShareModal, setShowShareModal] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining(deal.expiryDate);
  const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;
  const isExpired = daysRemaining <= 0;

  return (
    <>
      <motion.div
        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
        whileHover={{ y: -2 }}
      >
        {/* Deal Image */}
        <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100">
          {deal.image ? (
            <img
              src={deal.image}
              alt={deal.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ApperIcon 
                name="Image" 
                className="h-16 w-16 text-gray-400"
              />
            </div>
          )}
          
          {/* Discount Badge */}
          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
            {deal.discountPercentage}% OFF
          </div>

          {/* Expiry Badge */}
          {(isExpiringSoon || isExpired) && (
            <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium ${
              isExpired 
                ? 'bg-gray-500 text-white' 
                : 'bg-yellow-500 text-white'
            }`}>
              {isExpired ? 'Expired' : `${daysRemaining} days left`}
            </div>
          )}

          {/* Admin Actions */}
          {isAdmin && (
            <div className="absolute bottom-4 right-4 flex space-x-2">
              <Button
                onClick={onEdit}
                className="p-2 bg-white/90 text-gray-700 hover:bg-white rounded-lg"
              >
                <ApperIcon name="Edit2" className="h-4 w-4" />
              </Button>
              <Button
                onClick={onDelete}
                className="p-2 bg-white/90 text-red-600 hover:bg-white rounded-lg"
              >
                <ApperIcon name="Trash2" className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Deal Content */}
        <div className="p-6">
          {/* Category */}
<div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {deal.category === 'ui-tools' ? 'UI Tools' :
               deal.category === 'design-systems' ? 'Design Systems' :
               deal.category === 'ui-libraries' ? 'UI Libraries' :
               deal.category.charAt(0).toUpperCase() + deal.category.slice(1)}
            </span>
            <span className="text-sm text-gray-500">
              Expires {formatDate(deal.expiryDate)}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
            {deal.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 mb-4 line-clamp-3">
            {deal.description}
          </p>

          {/* Original and Sale Price */}
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-2xl font-bold text-green-600">
              ${deal.salePrice?.toLocaleString()}
            </span>
            {deal.originalPrice && (
              <span className="text-lg text-gray-500 line-through">
                ${deal.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Link
              to={deal.projectLink}
              className="flex-1"
            >
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                View Project
              </Button>
            </Link>
            
            <Button
              onClick={() => setShowShareModal(true)}
              variant="outline"
              className="px-4 border-gray-300 text-gray-700 hover:border-gray-400"
            >
              <ApperIcon name="Share2" className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Social Share Modal */}
      {showShareModal && (
        <SocialShareModal
          deal={deal}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </>
  );
};

export default DealCard;