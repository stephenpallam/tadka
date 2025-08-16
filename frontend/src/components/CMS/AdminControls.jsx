import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminControls = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [schedulerSettings, setSchedulerSettings] = useState({
    is_enabled: false,
    check_frequency_minutes: 5
  });
  const [scheduledArticles, setScheduledArticles] = useState([]);
  const [notification, setNotification] = useState({
    type: '',
    message: ''
  });

  useEffect(() => {
    fetchSchedulerSettings();
    fetchScheduledArticles();
  }, []);

  const fetchSchedulerSettings = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/scheduler-settings`);
      if (response.ok) {
        const data = await response.json();
        setSchedulerSettings(data);
      }
    } catch (error) {
      console.error('Error fetching scheduler settings:', error);
      showNotification('error', 'Failed to load scheduler settings');
    }
  };

  const fetchScheduledArticles = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/cms/scheduled-articles`);
      if (response.ok) {
        const data = await response.json();
        setScheduledArticles(data);
      }
    } catch (error) {
      console.error('Error fetching scheduled articles:', error);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 5000);
  };

  const handleSettingsChange = (field, value) => {
    setSchedulerSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveSchedulerSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/scheduler-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(schedulerSettings)
      });

      if (response.ok) {
        showNotification('success', 'Scheduler settings updated successfully');
        await fetchScheduledArticles(); // Refresh scheduled articles list
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating scheduler settings:', error);
      showNotification('error', 'Failed to update scheduler settings');
    } finally {
      setSaving(false);
    }
  };

  const runSchedulerNow = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/scheduler/run-now`, {
        method: 'POST'
      });

      if (response.ok) {
        showNotification('success', 'Scheduler run completed successfully');
        await fetchScheduledArticles(); // Refresh list to show any newly published articles
      } else {
        throw new Error('Failed to run scheduler');
      }
    } catch (error) {
      console.error('Error running scheduler:', error);
      showNotification('error', 'Failed to run scheduler');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const frequencyOptions = [
    { value: 1, label: '1 minute' },
    { value: 5, label: '5 minutes' },
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl-plus mx-auto px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900 text-left">Admin Controls</h1>
            <button
              onClick={() => navigate('/cms/dashboard')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Notification */}
        {notification.message && (
          <div className={`mb-6 p-4 rounded-md ${
            notification.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {notification.message}
          </div>
        )}

        {/* Scheduler Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 text-left">Post Scheduler Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={schedulerSettings.is_enabled}
                  onChange={(e) => handleSettingsChange('is_enabled', e.target.checked)}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">Enable Auto-Publishing</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                Check Frequency
              </label>
              <select
                value={schedulerSettings.check_frequency_minutes}
                onChange={(e) => handleSettingsChange('check_frequency_minutes', parseInt(e.target.value))}
                disabled={!schedulerSettings.is_enabled}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:opacity-60"
              >
                {frequencyOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    Every {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-600 mt-1">
                How often the system should check for scheduled posts to publish
              </p>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                onClick={saveSchedulerSettings}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>

              <button
                onClick={runSchedulerNow}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                {loading ? 'Running...' : 'Run Scheduler Now'}
              </button>
            </div>
          </div>
        </div>

        {/* Scheduled Articles */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 text-left">Scheduled Articles</h2>
          
          {scheduledArticles.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No articles are currently scheduled for publishing.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Article
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Scheduled Time (IST)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {scheduledArticles.map((article, index) => (
                    <tr 
                      key={article.id}
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}
                    >
                      <td className="px-4 py-4">
                        <div className="text-left">
                          <h3 className="text-sm font-medium text-gray-900">
                            {article.title}
                          </h3>
                          {article.short_title && (
                            <p className="text-xs text-gray-600 mt-1">{article.short_title}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {article.author}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {formatDateTime(article.scheduled_publish_at)}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          new Date(article.scheduled_publish_at) <= new Date()
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-orange-50 text-orange-700 border border-orange-200'
                        }`}>
                          {new Date(article.scheduled_publish_at) <= new Date() ? 'Ready to Publish' : 'Scheduled'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminControls;