import React, { useState, useEffect } from 'react';
import { format, addDays, addWeeks, addMonths, startOfDay, isAfter, isBefore } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Modal from '@/components/molecules/Modal';
import FormField from '@/components/molecules/FormField';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Checkbox from '@/components/atoms/Checkbox';
import Button from '@/components/atoms/Button';
import Spinner from '@/components/atoms/Spinner';

const RecurringTaskModal = ({ isOpen, onClose, onSave, initialData = null }) => {
  const [formData, setFormData] = useState({
    pattern: 'daily',
    frequency: 1,
    daysOfWeek: [],
    dayOfMonth: 1,
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(addMonths(new Date(), 3), 'yyyy-MM-dd'),
    endType: 'date' // 'never', 'date', 'occurrences'
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [previewDates, setPreviewDates] = useState([]);

  const daysOfWeek = [
    { id: 'monday', label: 'Mon', fullLabel: 'Monday' },
    { id: 'tuesday', label: 'Tue', fullLabel: 'Tuesday' },
    { id: 'wednesday', label: 'Wed', fullLabel: 'Wednesday' },
    { id: 'thursday', label: 'Thu', fullLabel: 'Thursday' },
    { id: 'friday', label: 'Fri', fullLabel: 'Friday' },
    { id: 'saturday', label: 'Sat', fullLabel: 'Saturday' },
    { id: 'sunday', label: 'Sun', fullLabel: 'Sunday' }
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
    } else {
      // Reset form when modal opens
      setFormData({
        pattern: 'daily',
        frequency: 1,
        daysOfWeek: [],
        dayOfMonth: 1,
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(addMonths(new Date(), 3), 'yyyy-MM-dd'),
        endType: 'date'
      });
    }
    setErrors({});
  }, [isOpen, initialData]);

  useEffect(() => {
    generatePreview();
  }, [formData]);

  const generatePreview = () => {
    const dates = [];
    const start = startOfDay(new Date(formData.startDate));
    const end = formData.endType === 'date' ? startOfDay(new Date(formData.endDate)) : null;
    let current = start;
    let count = 0;

    while (count < 3 && (!end || !isAfter(current, end))) {
      let shouldInclude = false;

      switch (formData.pattern) {
        case 'daily':
          shouldInclude = true;
          break;
        case 'weekly':
          const dayName = format(current, 'EEEE').toLowerCase();
          shouldInclude = formData.daysOfWeek.includes(dayName);
          break;
        case 'monthly':
          shouldInclude = current.getDate() === formData.dayOfMonth;
          break;
      }

      if (shouldInclude) {
        dates.push(new Date(current));
        count++;
      }

      // Move to next occurrence
      switch (formData.pattern) {
        case 'daily':
          current = addDays(current, formData.frequency);
          break;
        case 'weekly':
          current = addDays(current, 1);
          break;
        case 'monthly':
          current = addDays(current, 1);
          break;
      }

      // Safety check to prevent infinite loops
      if (count === 0 && isAfter(current, addMonths(start, 6))) {
        break;
      }
    }

    setPreviewDates(dates);
  };

  const validateForm = () => {
    const newErrors = {};
    const today = startOfDay(new Date());
    const start = startOfDay(new Date(formData.startDate));
    const end = formData.endType === 'date' ? startOfDay(new Date(formData.endDate)) : null;

    // Start date validation
    if (isBefore(start, today)) {
      newErrors.startDate = 'Start date cannot be in the past';
    }

    // End date validation
    if (end && !isAfter(end, start)) {
      newErrors.endDate = 'End date must be after start date';
    }

    // Pattern-specific validation
    if (formData.pattern === 'weekly' && formData.daysOfWeek.length === 0) {
      newErrors.daysOfWeek = 'Please select at least one day of the week';
    }

    if (formData.pattern === 'daily' && (formData.frequency < 1 || formData.frequency > 365)) {
      newErrors.frequency = 'Frequency must be between 1 and 365 days';
    }

    if (formData.pattern === 'monthly' && (formData.dayOfMonth < 1 || formData.dayOfMonth > 31)) {
      newErrors.dayOfMonth = 'Day of month must be between 1 and 31';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDayOfWeekToggle = (day) => {
    const newDays = formData.daysOfWeek.includes(day)
      ? formData.daysOfWeek.filter(d => d !== day)
      : [...formData.daysOfWeek, day];
    
    setFormData({ ...formData, daysOfWeek: newDays });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      setErrors({ submit: 'Failed to save recurring task configuration' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderPatternControls = () => {
    switch (formData.pattern) {
      case 'daily':
        return (
          <FormField label="Frequency" error={errors.frequency}>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Every</span>
              <Input
                type="number"
                min="1"
                max="365"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: parseInt(e.target.value) || 1 })}
                className="w-20 text-center"
              />
              <span className="text-sm text-gray-600">day(s)</span>
            </div>
          </FormField>
        );

      case 'weekly':
        return (
          <FormField label="Days of Week" error={errors.daysOfWeek}>
            <div className="grid grid-cols-7 gap-2">
              {daysOfWeek.map(day => (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => handleDayOfWeekToggle(day.id)}
                  className={`p-2 text-xs font-medium rounded-lg border-2 transition-colors ${
                    formData.daysOfWeek.includes(day.id)
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-primary/50'
                  }`}
                  title={day.fullLabel}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </FormField>
        );

      case 'monthly':
        return (
          <FormField label="Day of Month" error={errors.dayOfMonth}>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">On the</span>
              <Input
                type="number"
                min="1"
                max="31"
                value={formData.dayOfMonth}
                onChange={(e) => setFormData({ ...formData, dayOfMonth: parseInt(e.target.value) || 1 })}
                className="w-20 text-center"
              />
              <span className="text-sm text-gray-600">of each month</span>
            </div>
          </FormField>
        );

      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} contentClassName="max-w-lg w-full max-h-[90vh] overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ApperIcon name="RotateCcw" className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-display font-semibold text-gray-900">
                Configure Recurring Task
              </h2>
            </div>
            <Button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ApperIcon name="X" className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Pattern Selector */}
            <FormField label="Recurrence Pattern">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'daily', label: 'Daily', icon: 'Calendar' },
                  { value: 'weekly', label: 'Weekly', icon: 'CalendarDays' },
                  { value: 'monthly', label: 'Monthly', icon: 'CalendarRange' }
                ].map(pattern => (
                  <button
                    key={pattern.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, pattern: pattern.value })}
                    className={`p-4 rounded-lg border-2 transition-colors text-center ${
                      formData.pattern === pattern.value
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-primary/50'
                    }`}
                  >
                    <ApperIcon name={pattern.icon} className="w-5 h-5 mx-auto mb-2" />
                    <div className="text-sm font-medium">{pattern.label}</div>
                  </button>
                ))}
              </div>
            </FormField>

            {/* Pattern-specific Controls */}
            {renderPatternControls()}

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Start Date" error={errors.startDate}>
                <div className="relative">
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                  <ApperIcon name="Calendar" className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </FormField>

              <FormField label="End Date" error={errors.endDate}>
                <div className="relative">
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    disabled={formData.endType !== 'date'}
                  />
                  <ApperIcon name="Calendar" className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </FormField>
            </div>

            {/* Schedule Preview */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <ApperIcon name="Eye" className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-medium text-gray-900">Schedule Preview</h3>
              </div>
              {previewDates.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 mb-2">Next 3 occurrences:</p>
                  {previewDates.map((date, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <ApperIcon name="Calendar" className="w-3 h-3 text-primary" />
                      <span className="text-gray-700">
                        {format(date, 'EEEE, MMMM d, yyyy')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No occurrences found with current settings
                </p>
              )}
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <ApperIcon name="AlertCircle" className="w-4 h-4 text-red-600" />
                  <p className="text-sm text-red-700">{errors.submit}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-sm flex items-center space-x-2"
              >
                {isLoading && <Spinner className="w-4 h-4" />}
                <span>Save Recurrence</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default RecurringTaskModal;