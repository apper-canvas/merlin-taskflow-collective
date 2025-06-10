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
      transition={{ delay: index * 0.05, ease: [0.4, 0, 0.2, 1] }}
      className="bg-white/95 backdrop-blur-sm rounded-xl shadow-soft border border-slate-200/60 hover:shadow-medium transition-all duration-300 p-6 group hover:scale-[1.01]"
    >
      <div className="flex items-start space-x-4">
        <div className="mt-1">
          <div className="w-6 h-6 bg-gradient-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center shadow-lg shadow-success-500/20">
            <ApperIcon name="Check" className="w-3.5 h-3.5 text-white drop-shadow-sm" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-800 line-through break-words opacity-75 text-lg leading-tight">
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-slate-500 mt-2 break-words leading-relaxed opacity-80">
                  {task.description}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
              <CategoryTag category={categoryInfo} />
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-6 text-xs text-slate-500">
              <div className="flex items-center space-x-2">
                <ApperIcon name="Calendar" className="w-3.5 h-3.5" />
                <span className="font-medium">
                  Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <ApperIcon name="CheckCircle" className="w-3.5 h-3.5" />
                <span className="font-medium">
                  Completed {getCompletionTimeAgo(task.completedAt)}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              <Button
                onClick={() => onRestore(task.id)}
                className="px-3 py-1.5 text-xs bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-lg hover:from-accent-600 hover:to-accent-700 transition-all shadow-lg shadow-accent-500/25 font-medium"
              >
                Restore
              </Button>
              <Button
                onClick={() => onDelete(task.id)}
                className="px-3 py-1.5 text-xs bg-gradient-to-r from-error-500 to-error-600 text-white rounded-lg hover:from-error-600 hover:to-error-700 transition-all shadow-lg shadow-error-500/25 font-medium"
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