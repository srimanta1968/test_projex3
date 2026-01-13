export interface ValidationResult {
  isValid: boolean;
  errors: { [field: string]: string };
}

export interface TripValidationInput {
  destination?: string;
  departure_time?: string;
}

/**
 * Validates trip input data
 */
export function validateTripInput(input: TripValidationInput): ValidationResult {
  const errors: { [field: string]: string } = {};

  // Validate destination
  if (!input.destination || !input.destination.trim()) {
    errors.destination = 'Destination is required';
  } else if (input.destination.trim().length < 2) {
    errors.destination = 'Destination must be at least 2 characters';
  } else if (input.destination.trim().length > 255) {
    errors.destination = 'Destination must be less than 255 characters';
  }

  // Validate departure_time
  if (!input.departure_time) {
    errors.departure_time = 'Departure time is required';
  } else {
    const departureDate = new Date(input.departure_time);
    if (isNaN(departureDate.getTime())) {
      errors.departure_time = 'Invalid departure time format';
    } else if (departureDate <= new Date()) {
      errors.departure_time = 'Departure time must be in the future';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates trip update input data (partial validation)
 */
export function validateTripUpdateInput(input: TripValidationInput): ValidationResult {
  const errors: { [field: string]: string } = {};

  // Validate destination if provided
  if (input.destination !== undefined) {
    if (!input.destination.trim()) {
      errors.destination = 'Destination cannot be empty';
    } else if (input.destination.trim().length < 2) {
      errors.destination = 'Destination must be at least 2 characters';
    } else if (input.destination.trim().length > 255) {
      errors.destination = 'Destination must be less than 255 characters';
    }
  }

  // Validate departure_time if provided
  if (input.departure_time !== undefined) {
    const departureDate = new Date(input.departure_time);
    if (isNaN(departureDate.getTime())) {
      errors.departure_time = 'Invalid departure time format';
    } else if (departureDate <= new Date()) {
      errors.departure_time = 'Departure time must be in the future';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export default {
  validateTripInput,
  validateTripUpdateInput,
};
