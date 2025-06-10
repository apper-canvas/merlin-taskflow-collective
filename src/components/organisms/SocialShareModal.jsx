import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Modal from '@/components/molecules/Modal';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import { toast } from 'react-toastify';

const SocialShareModal = ({ deal, onClose }) => {
  const [copying, setCopying] = useState(false);

  const shareUrl = `${window.location.origin}/deals/${deal.id}`;
  const shareText = `Check out this amazing deal: ${deal.title} - ${deal.discountPercentage}% OFF!`;

  const socialPlatforms = [
    {
      name: 'Facebook',
      icon: 'Facebook',
      color: 'bg-blue-600 hover:bg-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Twitter',
      icon: 'Twitter',
      color: 'bg-sky-500 hover:bg-sky-600',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'LinkedIn',
      icon: 'Linkedin',
      color: 'bg-blue-700 hover:bg-blue-800',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'WhatsApp',
      icon: 'MessageCircle',
      color: 'bg-green-600 hover:bg-green-700',
      url: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`
    },
    {
      name: 'Email',
      icon: 'Mail',
      color: 'bg-gray-600 hover:bg-gray-700',
      url: `mailto:?subject=${encodeURIComponent(`Amazing Deal: ${deal.title}`)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`
    }
  ];

  const handleShare = (platform) => {
    window.open(platform.url, '_blank', 'width=600,height=400');
  };

  const handleCopyLink = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Link copied to clipboard!');
    } finally {
      setCopying(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Share This Deal"
      size="md"
    >
      <div className="space-y-6">
        {/* Deal Preview */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
              {deal.image ? (
                <img
                  src={deal.image}
                  alt={deal.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <ApperIcon name="Tag" className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {deal.title}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                {deal.description}
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                  {deal.discountPercentage}% OFF
                </span>
                <span className="text-sm text-gray-500">
                  ${deal.salePrice?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Platforms */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Share on social media
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {socialPlatforms.map((platform) => (
              <motion.button
                key={platform.name}
                onClick={() => handleShare(platform)}
                className={`${platform.color} text-white p-3 rounded-lg flex items-center justify-center space-x-2 transition-colors`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ApperIcon name={platform.icon} className="h-5 w-5" />
                <span className="text-sm font-medium">{platform.name}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Copy Link */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Or copy link
          </h4>
          <div className="flex space-x-3">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-600"
            />
            <Button
              onClick={handleCopyLink}
              disabled={copying}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2"
            >
              {copying ? (
                <ApperIcon name="Loader2" className="h-4 w-4 animate-spin" />
              ) : (
                <ApperIcon name="Copy" className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button
            onClick={onClose}
            variant="outline"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SocialShareModal;