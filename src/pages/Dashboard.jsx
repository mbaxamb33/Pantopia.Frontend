// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService, contactService, healthCheck } from '../api/apiService';

const Dashboard = () => {
  const { currentUser, accessToken } = useAuth();
  const [stats, setStats] = useState({
    contacts: 0,
    companies: 0,
    projects: 0,
    conversations: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // For API testing
  const [apiTestStatus, setApiTestStatus] = useState('idle');
  const [apiTestResult, setApiTestResult] = useState(null);
  const [selectedTest, setSelectedTest] = useState('health');

  // Fetch initial stats
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // For now, set fake data since we're focusing on testing the API connection
        setStats({
          contacts: 24,
          companies: 8,
          projects: 5,
          conversations: 12,
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Function to run API tests
  const runApiTest = async () => {
    setApiTestStatus('loading');
    setApiTestResult(null);
    
    try {
      let result;
      
      switch (selectedTest) {
        case 'health':
          result = await healthCheck();
          break;
        case 'user':
          result = await userService.getCurrentUser();
          break;
        case 'contacts':
          result = await contactService.getContacts();
          break;
        default:
          throw new Error('Invalid test selected');
      }
      
      setApiTestResult({
        success: true,
        data: result
      });
      setApiTestStatus('success');
    } catch (error) {
      console.error('API test error:', error);
      setApiTestResult({
        success: false,
        error: error.message || 'Unknown error',
        details: error.response?.data || error
      });
      setApiTestStatus('error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Welcome back, {currentUser?.name || 'User'}!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Contacts" value={stats.contacts} icon="👥" color="bg-blue-500" />
        <StatCard title="Companies" value={stats.companies} icon="🏢" color="bg-green-500" />
        <StatCard title="Projects" value={stats.projects} icon="📁" color="bg-purple-500" />
        <StatCard title="Conversations" value={stats.conversations} icon="💬" color="bg-yellow-500" />
      </div>
      
      {/* API Testing Section */}
      <div className="bg-white p-6 rounded shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">API Connection Test</h2>
        <p className="text-gray-600 mb-4">
          Test your connection to the backend API endpoints. This is useful for debugging.
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Test</label>
            <select
              value={selectedTest}
              onChange={(e) => setSelectedTest(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="health">Health Check</option>
              <option value="user">Get Current User</option>
              <option value="contacts">List Contacts</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={runApiTest}
              disabled={apiTestStatus === 'loading'}
              className={`px-4 py-2 rounded text-white font-medium ${
                apiTestStatus === 'loading' 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {apiTestStatus === 'loading' ? 'Testing...' : 'Run Test'}
            </button>
          </div>
        </div>
        
        {/* Authentication status */}
        <div className="bg-gray-100 p-4 rounded mb-4">
          <h3 className="font-medium mb-2">Authentication Status</h3>
          <p className="text-sm">
            {accessToken 
              ? <span className="text-green-600">✅ Authenticated</span>
              : <span className="text-red-600">❌ Not authenticated</span>
            }
          </p>
        </div>
        
        {/* Test Results */}
        {apiTestResult && (
          <div className={`border rounded p-4 ${
            apiTestResult.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
          }`}>
            <h3 className="font-medium mb-2">
              {apiTestResult.success ? '✅ Success' : '❌ Error'}
            </h3>
            
            {apiTestResult.success ? (
              <div>
                <p className="text-sm text-gray-700 mb-2">API returned successfully</p>
                <div className="bg-white p-3 rounded border border-gray-200 max-h-60 overflow-auto">
                  <pre className="text-xs whitespace-pre-wrap">
                    {JSON.stringify(apiTestResult.data, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-red-700 mb-2">{apiTestResult.error}</p>
                {apiTestResult.details && (
                  <div className="bg-white p-3 rounded border border-gray-200 max-h-60 overflow-auto">
                    <pre className="text-xs whitespace-pre-wrap">
                      {JSON.stringify(apiTestResult.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <p className="text-gray-500">No recent activity to display</p>
        </div>
        
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Upcoming Tasks</h2>
          <p className="text-gray-500">No upcoming tasks</p>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      <div className={`${color} text-white p-3 rounded-full`}>
        <span className="text-xl">{icon}</span>
      </div>
    </div>
  </div>
);

export default Dashboard;