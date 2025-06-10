import React from 'react';
import ApperIcon from '@/components/ApperIcon';
import Modal from '@/components/molecules/Modal';
import Button from '@/components/atoms/Button';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete' }) => {
  return (
<Modal isOpen={isOpen} onClose={onClose} contentClassName="max-w-md w-full" zIndex={60}>
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-large border border-slate-200/60 p-8">
        <div className="flex items-start space-x-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-error-100 to-error-200 rounded-2xl flex items-center justify-center shadow-soft">
            <ApperIcon name="Trash2" className="w-6 h-6 text-error-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-slate-800 text-lg mb-2">{title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex space-x-3 mt-8">
          <Button
            onClick={onClose}
            className="flex-1 px-6 py-3 text-slate-700 hover:bg-slate-100 rounded-xl transition-all font-semibold border border-slate-200"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-error-500 to-error-600 text-white rounded-xl hover:from-error-600 hover:to-error-700 transition-all font-semibold shadow-lg shadow-error-500/25"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;