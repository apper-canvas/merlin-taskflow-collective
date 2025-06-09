import React from 'react';
import { motion } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import CategoryTag from '@/components/molecules/CategoryTag';
import Button from '@/components/atoms/Button';

const ArchiveTaskCard = ({ task, categoryInfo, onRestore, onDelete, index }) => {
  const getCompletionTimeAgo = (completedAt) => {
    if (!completedAt) return 'Unknown';
    const days = differenceInDays(new Date(), new Date(completedAt));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  return (
    <motion.div
      key={task.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all p-4 group"
    >
      <div className="flex items-start space-x-3">
        <div className="mt-1">
          <div className="w-5 h-5 bg-success rounded-full flex items-center justify-center">
            <ApperIcon name="Check" className="w-3 h-3 text-white" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 line-through break-words">
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-gray-500 mt-1 break-words">
                  {task.description}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2 ml-3 flex-shrink-0">
              <CategoryTag category={categoryInfo} />
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <ApperIcon name="Calendar" className="w-3 h-3" />
                <span>
                  Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <ApperIcon name="CheckCircle" className="w-3 h-3" />
                <span>
                  Completed {getCompletionTimeAgo(task.completedAt)}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onRestore(task.id)}
                className="px-2 py-1 text-xs bg-accent text-white rounded hover:bg-accent/90 transition-colors"
              >
                Restore
              </Button>
              <Button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDelete(task.id)}
                className="px-2 py-1 text-xs bg-error text-white rounded hover:bg-error/90 transition-colors"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ArchiveTaskCard;