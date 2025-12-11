import React, { useState } from 'react';
import type { RideRequestFormData } from '../types';

interface RideRequestFormProps {
  onSubmit: (data: RideRequestFormData) => Promise<void>;
  isLoading?: boolean;
}

const RideRequestForm: React.FC<RideRequestFormProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<RideRequestFormData>({
    pickupLocation: '',
    dropoffLocation: '',
    scheduledTime: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isScheduled, setIsScheduled] = useState(false);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'pickupLocation':
        if (!value.trim()) return 'Pickup location is required';
        if (value.length < 3) return 'Please enter a valid address';
        return '';

      case 'dropoffLocation':
        if (!value.trim()) return 'Drop-off location is required';
        if (value.length < 3) return 'Please enter a valid address';
        if (value === formData.pickupLocation) return 'Drop-off must be different from pickup';
        return '';

      case 'scheduledTime':
        if (isScheduled && !value) return 'Please select a pickup time';
        if (value) {
          const selectedTime = new Date(value);
          const now = new Date();
          if (selectedTime < now) return 'Pickup time must be in the future';
        }
        return '';

      default:
        return '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    const fieldsToValidate = ['pickupLocation', 'dropoffLocation'];
    if (isScheduled) fieldsToValidate.push('scheduledTime');

    fieldsToValidate.forEach((key) => {
      const error = validateField(key, formData[key as keyof RideRequestFormData] || '');
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      pickupLocation: true,
      dropoffLocation: true,
      scheduledTime: isScheduled,
    });

    if (!validateForm()) {
      return;
    }

    const submitData: RideRequestFormData = {
      pickupLocation: formData.pickupLocation,
      dropoffLocation: formData.dropoffLocation,
    };

    if (isScheduled && formData.scheduledTime) {
      submitData.scheduledTime = formData.scheduledTime;
    }

    if (formData.notes?.trim()) {
      submitData.notes = formData.notes.trim();
    }

    await onSubmit(submitData);
  };

  const getInputClassName = (fieldName: string): string => {
    const baseClass = 'input-field';
    if (touched[fieldName] && errors[fieldName]) {
      return `${baseClass} input-error`;
    }
    return baseClass;
  };

  const getMinDateTime = (): string => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-primary-600 px-6 py-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Request a Ride</h1>
                <p className="text-primary-100 mt-1">Where would you like to go?</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 flex flex-col items-center py-3">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <div className="flex-1 w-0.5 bg-gray-300 my-1" />
                <div className="w-3 h-3 bg-red-500 rounded-full" />
              </div>

              <div className="space-y-4 pl-10">
                <div>
                  <label htmlFor="pickupLocation" className="form-label">
                    Pickup Location
                  </label>
                  <input
                    type="text"
                    id="pickupLocation"
                    name="pickupLocation"
                    value={formData.pickupLocation}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getInputClassName('pickupLocation')}
                    placeholder="Enter pickup address"
                    disabled={isLoading}
                    autoComplete="street-address"
                  />
                  {touched.pickupLocation && errors.pickupLocation && (
                    <p className="error-text">{errors.pickupLocation}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="dropoffLocation" className="form-label">
                    Drop-off Location
                  </label>
                  <input
                    type="text"
                    id="dropoffLocation"
                    name="dropoffLocation"
                    value={formData.dropoffLocation}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getInputClassName('dropoffLocation')}
                    placeholder="Enter destination address"
                    disabled={isLoading}
                    autoComplete="street-address"
                  />
                  {touched.dropoffLocation && errors.dropoffLocation && (
                    <p className="error-text">{errors.dropoffLocation}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-700">
                  Schedule for later?
                </span>
                <button
                  type="button"
                  onClick={() => setIsScheduled(!isScheduled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isScheduled ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isScheduled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {isScheduled && (
                <div className="animate-fadeIn">
                  <label htmlFor="scheduledTime" className="form-label">
                    Pickup Time
                  </label>
                  <input
                    type="datetime-local"
                    id="scheduledTime"
                    name="scheduledTime"
                    value={formData.scheduledTime}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    min={getMinDateTime()}
                    className={getInputClassName('scheduledTime')}
                    disabled={isLoading}
                  />
                  {touched.scheduledTime && errors.scheduledTime && (
                    <p className="error-text">{errors.scheduledTime}</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="notes" className="form-label">
                Notes for Driver (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="input-field resize-none"
                placeholder="Any special instructions? (e.g., gate code, landmark)"
                disabled={isLoading}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="btn-primary flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Finding a driver...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                    {isScheduled ? 'Schedule Ride' : 'Request Ride Now'}
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Safe rides</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Verified drivers</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Fair pricing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RideRequestForm;
