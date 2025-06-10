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
                error={errors.frequency}
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
                error={errors.dayOfMonth}
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
<Modal isOpen={isOpen} onClose={onClose} contentClassName="max-w-2xl w-full">
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-large border border-slate-200/60">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl shadow-soft">
                <ApperIcon name="RotateCcw" className="w-6 h-6 text-primary-600" />
              </div>
              <h2 className="text-2xl font-display font-bold text-slate-800">
                Configure Recurring Task
              </h2>
            </div>
            <Button
              onClick={onClose}
              className="p-2.5 hover:bg-slate-100 rounded-xl transition-all"
            >
              <ApperIcon name="X" className="w-5 h-5 text-slate-500" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Pattern Selector */}
            <FormField label="Recurrence Pattern">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: 'daily', label: 'Daily', icon: 'Calendar' },
                  { value: 'weekly', label: 'Weekly', icon: 'CalendarDays' },
                  { value: 'monthly', label: 'Monthly', icon: 'CalendarRange' }
                ].map(pattern => (
                  <button
                    key={pattern.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, pattern: pattern.value })}
                    className={`p-6 rounded-xl border-2 transition-all text-center hover:scale-105 ${
                      formData.pattern === pattern.value
                        ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white border-primary-500 shadow-lg shadow-primary-500/25'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-primary-300 hover:shadow-soft'
                    }`}
                  >
                    <ApperIcon name={pattern.icon} className="w-6 h-6 mx-auto mb-3" />
                    <div className="text-sm font-semibold">{pattern.label}</div>
                  </button>
                ))}
              </div>
            </FormField>

            {/* Pattern-specific Controls */}
            {renderPatternControls()}

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-6">
              <FormField label="Start Date" error={errors.startDate}>
                <div className="relative">
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    error={errors.startDate}
                  />
                  <ApperIcon name="Calendar" className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </FormField>

              <FormField label="End Date" error={errors.endDate}>
                <div className="relative">
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    error={errors.endDate}
                    disabled={formData.endType !== 'date'}
                  />
                  <ApperIcon name="Calendar" className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </FormField>
            </div>

            {/* Schedule Preview */}
            <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
              <div className="flex items-center space-x-3 mb-4">
                <ApperIcon name="Eye" className="w-5 h-5 text-slate-600" />
                <h3 className="text-base font-semibold text-slate-800">Schedule Preview</h3>
              </div>
              {previewDates.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600 font-medium mb-3">Next 3 occurrences:</p>
                  {previewDates.map((date, index) => (
                    <div key={index} className="flex items-center space-x-3 text-sm">
                      <ApperIcon name="Calendar" className="w-4 h-4 text-primary-500" />
                      <span className="text-slate-700 font-medium">
                        {format(date, 'EEEE, MMMM d, yyyy')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">
                  No occurrences found with current settings
                </p>
              )}
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="p-4 bg-gradient-to-br from-error-50 to-error-100 border border-error-200 rounded-xl">
                <div className="flex items-center space-x-3">
                  <ApperIcon name="AlertCircle" className="w-5 h-5 text-error-600" />
                  <p className="text-sm text-error-700 font-medium">{errors.submit}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-200">
              <Button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-6 py-3 text-slate-700 hover:bg-slate-100 rounded-xl transition-all font-semibold border border-slate-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all font-semibold shadow-lg shadow-primary-500/25 flex items-center space-x-2"
              >
                {isLoading && <Spinner size="sm" />}
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