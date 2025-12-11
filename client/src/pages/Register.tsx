import React from 'react';
import RegistrationForm from '../components/RegistrationForm';
import type { RegisterUserResponse } from '../types';

const Register: React.FC = () => {
  const handleRegistrationSuccess = (user: RegisterUserResponse) => {
    console.log('User registered successfully:', user);
  };

  const handleRegistrationError = (error: string) => {
    console.error('Registration error:', error);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold text-gray-900">Quick Rider</h1>
        <h2 className="mt-2 text-center text-xl text-gray-600">Create your account</h2>
        <p className="mt-2 text-center text-sm text-gray-500">
          Join the community ride-sharing platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          <RegistrationForm
            onSuccess={handleRegistrationSuccess}
            onError={handleRegistrationError}
          />
        </div>
      </div>
    </div>
  );
};

export default Register;
