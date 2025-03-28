// src/components/agents/MockEmailTester.jsx
import { useState } from 'react';
import { useNotification } from '../../context/NotificationContext';
import Spinner from '../ui/Spinner';
import Modal from '../ui/Modal';

const MockEmailTester = ({ agentId, onTestComplete }) => {
  const notification = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testResponse, setTestResponse] = useState(null);
  
  const [formData, setFormData] = useState({
    fromEmail: '',
    toEmail: 'agent@example.com', // Set a default valid email
    subject: 'Test Email',
    body: 'Hello, this is a test email to check how the agent responds.',
    simulateNow: true
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Import apiClient
      const apiClient = (await import('../../api/apiClient')).default;
      
      // Ensure toEmail is always a valid email
      const toEmail = formData.toEmail.trim() || 'agent@example.com';
      
      // Make the API call using axios with the exact structure your backend expects
      // From the Go code, the expected structure is EmailTestRequest
      const response = await apiClient.post('/api/test/mock-email', {
        agent_id: parseInt(agentId), // Make sure this is a number
        from_email: formData.fromEmail,
        to_email: toEmail, // Use default if empty
        subject: formData.subject,
        body: formData.body, // This matches the 'body' field in EmailTestRequest
        simulate_now: formData.simulateNow
      });
      
      console.log('Test response:', response.data);
      setTestResponse(response.data);
      notification.showSuccess('Email test completed', 'Agent has processed the mock email');
      
      // Notify parent component that test is complete
      if (onTestComplete) {
        onTestComplete(response.data);
      }
    } catch (error) {
      console.error('Error testing agent:', error);
      
      // Show more detailed error information
      let errorMessage = 'Failed to test the agent with the mock email';
      if (error.response?.data?.error) {
        errorMessage += `: ${error.response.data.error}`;
      } else if (error.response?.data?.details) {
        errorMessage += `: ${error.response.data.details}`;
      }
      
      notification.showError('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTestResponse(null);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition duration-200"
      >
        Test with Email
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          resetForm();
        }}
        title="Test Agent with Mock Email"
        size="lg"
      >
        {!testResponse ? (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Email</label>
                <input
                  type="email"
                  name="fromEmail"
                  value={formData.fromEmail}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="customer@example.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Email
                  <span className="text-xs text-gray-500 ml-2">
                    agent@example.com will be used if empty
                  </span>
                </label>
                <input
                  type="email"
                  name="toEmail"
                  value={formData.toEmail}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="agent@example.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be a valid email address format
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email subject"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Body</label>
                <textarea
                  name="body"
                  value={formData.body}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="5"
                  placeholder="Type the email body here..."
                  required
                ></textarea>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="simulateNow"
                  name="simulateNow"
                  checked={formData.simulateNow}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="simulateNow" className="ml-2 text-gray-700">
                  Simulate immediate response (ignore working hours)
                </label>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Test Email'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Agent Response</h3>
              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                {testResponse.agent_response ? (
                  <div className="space-y-4">
                    {testResponse.agent_response.analysis && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Analysis:</h4>
                        <p className="text-sm text-gray-800 mt-1">{testResponse.agent_response.analysis}</p>
                      </div>
                    )}
                    
                    {testResponse.agent_response.email_response && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Email Response:</h4>
                        <div className="bg-white p-3 border rounded mt-1">
                          <pre className="text-sm text-gray-800 whitespace-pre-wrap">{testResponse.agent_response.email_response}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No agent response was generated</p>
                )}
              </div>
            </div>

            {testResponse.actions && testResponse.actions.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Actions Taken</h3>
                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                  <ul className="divide-y divide-gray-200">
                    {testResponse.actions.map((action, index) => (
                      <li key={index} className="py-3">
                        <div className="flex items-start">
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mr-2 ${
                            action.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            action.status === 'failed' ? 'bg-red-100 text-red-800' : 
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {action.type}
                          </span>
                          <span className="text-sm text-gray-600">
                            {action.status} {action.executed_at && `at ${new Date(action.executed_at).toLocaleString()}`}
                          </span>
                        </div>
                        
                        {action.details && Object.keys(action.details).length > 0 && (
                          <div className="mt-2 ml-6 text-sm">
                            <div className="bg-white p-2 rounded border border-gray-200">
                              <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-auto max-h-40">
                                {JSON.stringify(action.details, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}
                        
                        {action.error_detail && (
                          <div className="mt-2 ml-6">
                            <span className="text-xs text-red-600">{action.error_detail}</span>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  resetForm();
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-3"
              >
                Close
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Test Again
              </button>
            </div>
          </div>
        )}
      </Modal>

      {isLoading && <Spinner fullPage />}
    </>
  );
};

export default MockEmailTester;