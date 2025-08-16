import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      confirmPassword: ''
    });
    setError('');
    setSuccess('');
    setLoading(false);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (mode === 'register') {
      // Registration validation
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        setLoading(false);
        return;
      }

      const result = await register(formData.username, formData.password, formData.confirmPassword);
      
      if (result.success) {
        setSuccess('Account created successfully! You can now login.');
        setTimeout(() => {
          switchMode('login');
        }, 2000);
      } else {
        setError(result.error);
      }
    } else {
      // Login
      const result = await login(formData.username, formData.password);
      
      if (result.success) {
        onClose();
        resetForm();
      } else {
        setError(result.error);
      }
    }
    
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit(e);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit(e);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-sm w-full max-h-[70vh] border border-gray-600 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-600 p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                <span className="text-red-600 font-bold text-xs">T</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-lg font-bold text-white leading-tight text-left">
                  Tadka
                </span>
                <span className="text-sm text-gray-300 leading-none -mt-0.5 text-left">
                  Personalized News
                </span>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-300 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          {/* Mode Toggle */}
          <div className="flex rounded-lg overflow-hidden border border-gray-600">
            <button
              onClick={() => switchMode('login')}
              className={`flex-1 px-3 py-2 text-sm font-medium transition-all duration-200 ${
                mode === 'login'
                  ? 'bg-gray-700 text-white'
                  : 'bg-transparent text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => switchMode('register')}
              className={`flex-1 px-3 py-2 text-sm font-medium transition-all duration-200 ${
                mode === 'register'
                  ? 'bg-gray-700 text-white'
                  : 'bg-transparent text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-3">
            {error && (
              <div className="rounded-md bg-red-900 bg-opacity-50 border border-red-600 p-2">
                <div className="text-sm text-red-300 text-left">{error}</div>
              </div>
            )}

            {success && (
              <div className="rounded-md bg-green-900 bg-opacity-50 border border-green-600 p-2">
                <div className="text-sm text-green-300 text-left">{success}</div>
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-white mb-1 text-left">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                className="w-full px-3 py-2 text-sm border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 bg-gray-700 text-white placeholder-gray-400 text-left"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-1 text-left">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                className="w-full px-3 py-2 text-sm border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 bg-gray-700 text-white placeholder-gray-400 text-left"
                placeholder="Enter password"
              />
            </div>

            {mode === 'register' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-1 text-left">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  className="w-full px-3 py-2 text-sm border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 bg-gray-700 text-white placeholder-gray-400 text-left"
                  placeholder="Confirm password"
                />
              </div>
            )}
          </form>

          {mode === 'login' && (
            <div className="text-left pt-2">
              <div className="text-xs text-gray-400">
                Demo: admin / admin123
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div className="text-xs text-gray-400 space-y-1 text-left">
              <p>• New accounts get "Viewer" role</p>
              <p>• Password must be 6+ characters</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-600 p-4 flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-2 px-4 text-sm font-medium text-white rounded-md transition-all duration-200 ${
              loading
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
            }`}
          >
            {loading 
              ? (mode === 'login' ? 'Logging in...' : 'Creating account...') 
              : (mode === 'login' ? 'Login' : 'Create Account')
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;