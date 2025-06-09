import React from 'react';
import ApperIcon from '@/components/ApperIcon';
import Modal from '@/components/molecules/Modal';
import Button from '@/components/atoms/Button';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete' }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} contentClassName="max-w-sm w-full" zIndex={60}>
      <div className="bg-white rounded-lg shadow-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-error/10 rounded-full flex items-center justify-center">
            <ApperIcon name="Trash2" className="w-5 h-5 text-error" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{message}</p>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <Button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
          >
            Cancel
          </Button>
          <Button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-error text-white rounded-lg hover:bg-error/90 transition-colors font-medium"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;