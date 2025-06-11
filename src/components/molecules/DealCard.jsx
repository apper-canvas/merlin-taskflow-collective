import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import SocialShareModal from '@/components/organisms/SocialShareModal'

// Helper function to format date
function formatDate(dateString) {
  try {
    if (!dateString) return 'No date specified'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Invalid date'
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    console.error('Date formatting error:', error)
    return 'Invalid date'
  }
}

function getDaysRemaining(expiryDate) {
  try {
    if (!expiryDate) return 0
    
    const expiry = new Date(expiryDate)
    const now = new Date()
    
    if (isNaN(expiry.getTime())) return 0
    
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return Math.max(0, diffDays)
  } catch (error) {
    console.error('Error calculating days remaining:', error)
    return 0
  }
}

function DealCard({ deal, onEdit, onDelete, onToggleFavorite, className = '', showActions = true }) {
  // Early return if deal is not provided
  if (!deal) {
    return (
      <div className="bg-gray-100 rounded-xl border border-gray-200 p-6 text-center">
        <p className="text-gray-500">Deal information not available</p>
      </div>
    )
  }

  const [showShareModal, setShowShareModal] = useState(false)

  const daysRemaining = getDaysRemaining(deal.expiryDate)
  const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0
  const isExpired = daysRemaining <= 0

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    hover: { 
      y: -4,
      transition: { duration: 0.2, ease: "easeOut" }
    }
  }

  // Safe price calculations
  const dealPrice = Number(deal.price) || 0
  const originalPrice = Number(deal.originalPrice) || 0
  const hasDiscount = originalPrice > dealPrice && originalPrice > 0
  const savings = hasDiscount ? (originalPrice - dealPrice).toFixed(2) : 0

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className={`bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ${className}`}
    >
      {/* Deal Image */}
      <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100">
        {deal.imageUrl ? (
          <img 
            src={deal.imageUrl} 
            alt={deal.title || 'Deal image'}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextElementSibling.style.display = 'flex'
            }}
          />
        ) : null}
        
        {/* Fallback image placeholder */}
        <div className="w-full h-full flex items-center justify-center" style={{ display: deal.imageUrl ? 'none' : 'flex' }}>
          <ApperIcon icon="image" className="w-12 h-12 text-gray-400" />
        </div>
        
        {/* Status Badge */}
        {isExpired ? (
          <div className="absolute top-3 right-3 bg-red-500/90 text-white px-2 py-1 rounded-full text-xs font-medium">
            Expired
          </div>
        ) : isExpiringSoon ? (
          <div className="absolute top-3 right-3 bg-orange-500/90 text-white px-2 py-1 rounded-full text-xs font-medium">
            Expires Soon
          </div>
        ) : (
          <div className="absolute top-3 right-3 bg-green-500/90 text-white px-2 py-1 rounded-full text-xs font-medium">
            Active
          </div>
        )}
        
        {/* Favorite Button */}
        <button 
          onClick={() => onToggleFavorite?.(deal.id)}
          className="absolute top-3 left-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          aria-label={deal.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <ApperIcon 
            icon={deal.isFavorite ? "heart-filled" : "heart"} 
            className={`w-4 h-4 ${deal.isFavorite ? 'text-red-500' : 'text-gray-600'}`}
          />
        </button>
      </div>

      {/* Deal Content */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
              {deal.title || 'Untitled Deal'}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {deal.description || 'No description available'}
            </p>
          </div>
        </div>

        {/* Category & Expiry */}
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {deal.category === 'ui-tools' ? 'UI Tools' :
             deal.category === 'design-systems' ? 'Design Systems' :
             deal.category === 'ui-libraries' ? 'UI Libraries' :
             deal.category?.charAt(0)?.toUpperCase() + deal.category?.slice(1) || 'Category'}
          </span>
          <span className="text-sm text-gray-500">
            Expires {formatDate(deal.expiryDate)}
          </span>
        </div>

        {/* Pricing */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900">
              ${dealPrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-lg text-gray-500 line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
            {hasDiscount && (
              <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                Save ${savings}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <Button
                as={Link}
                to={`/deals/${deal.id || ''}`}
                variant="primary"
                size="sm"
                className="flex-1"
                disabled={isExpired}
              >
                {isExpired ? 'Expired' : 'View Deal'}
              </Button>
              
              <button
                onClick={() => setShowShareModal(true)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Share deal"
                aria-label="Share deal"
              >
                <ApperIcon icon="share" className="w-4 h-4" />
              </button>
            </div>
            
            {(onEdit || onDelete) && (
              <div className="flex items-center space-x-1 ml-3">
                {onEdit && (
                  <button
                    onClick={() => onEdit(deal)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit deal"
                    aria-label="Edit deal"
                  >
                    <ApperIcon icon="edit" className="w-4 h-4" />
                  </button>
                )}
                
                {onDelete && (
                  <button
                    onClick={() => onDelete(deal.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete deal"
                    aria-label="Delete deal"
                  >
                    <ApperIcon icon="trash" className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <SocialShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          deal={deal}
        />
      )}
    </motion.div>
  )
}

DealCard.propTypes = {
  deal: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    description: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    originalPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    category: PropTypes.string,
    imageUrl: PropTypes.string,
    expiryDate: PropTypes.string,
    isFavorite: PropTypes.bool
  }),
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onToggleFavorite: PropTypes.func,
  className: PropTypes.string,
  showActions: PropTypes.bool
}


export default DealCard