import React from 'react';
import { motion } from 'framer-motion';
import { format, isToday, isPast } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Checkbox from '@/components/atoms/Checkbox';
import PriorityDot from '@/components/atoms/PriorityDot';
import CategoryTag from '@/components/molecules/CategoryTag';

const TaskCard = ({ task, categoryInfo, onToggleComplete, onClick, index }) => {
  const isOverdue = isPast(new Date(task.dueDate)) && !task.completed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-white rounded-lg shadow-sm border hover:shadow-md transition-all p-4 cursor-pointer group ${
        task.completed ? 'opacity-75' : ''
      } ${isOverdue ? 'border-error/30 bg-error/5' : 'border-gray-200'}`}
      onClick={onClick}
    >
      <div className="flex items-start space-x-3">
        <div
          className="mt-1"
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(task.id, !task.completed);
          }}
        >
          <Checkbox checked={task.completed} onChange={() => {}} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className={`font-medium break-words ${
                task.completed ? 'line-through text-gray-500' : 'text-gray-900'
              }`}>
                {task.title}
              </h3>
              {task.description && (
                <p className={`text-sm mt-1 break-words ${
                  task.completed ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {task.description}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2 ml-3 flex-shrink-0">
              <PriorityDot priority={task.priority} />
              <CategoryTag category={categoryInfo} />
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <ApperIcon name="Calendar" className="w-3 h-3" />
                <span className={isOverdue ? 'text-error font-medium' : ''}>
                  Due: {isToday(new Date(task.dueDate))
                    ? 'Today'
                    : format(new Date(task.dueDate), 'MMM d')}
                </span>
              </div>
              {isOverdue && (
                <span className="text-error font-medium">Overdue</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;