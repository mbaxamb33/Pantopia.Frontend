// src/pages/agents/AgentDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { agentService } from '../../api/agentService';
import { useNotification } from '../../context/NotificationContext';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';

const AgentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const notification = useNotification();
  
  const [agent, setAgent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmail, setTestEmail] = useState({
    fromEmail: '',
    subject: 'Test Email',
    emailBody: 'Hello, this is a test email to check how the agent responds.',
    simulateNow: true
  });
  const [testResponse, setTestResponse] = useState(null);
  const [isTestingAgent, setIsTestingAgent] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Fetch agent details
  useEffect(() => {
    const fetchAgentDetails = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await agentService.getAgentSetting(id);
        setAgent(data);
      } catch (err) {
        console.error(`Error fetching agent ${id}:`, err);
        setError('Failed to load agent details. Please try again later.');
        notification.showError('Error', 'Failed to load agent details');
        
        // For development, set mock data
        setAgent({
          id: parseInt(id),
          agent_type: 'outreach',
          name: 'Sales Outreach Agent',
          is_active: { Bool: true, Valid: true },
          personality: {
            formality: 7,
            assertiveness: 6,
            creativity: 5,
            humor: 3,
            tone_preference: 'professional'
          },
          signature: 'Best regards,\nYour AI Sales Assistant',
          working_hours: {
            timezone: 'America/New_York',
            weekdays: {
              monday: { start: '09:00', end: '17:00' },
              tuesday: { start: '09:00', end: '17:00' },
              wednesday: { start: '09:00', end: '17:00' },
              thursday: { start: '09:00', end: '17:00' },
              friday: { start: '09:00', end: '17:00' },
              saturday: { start: '', end: '' },
              sunday: { start: '', end: '' }
            }
          },
          approval_required: { Bool: false, Valid: true },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgentDetails();
  }, [id, notification]);
  
  const handleToggleAgent = async () => {
    if (!agent) return;
    
    try {
      setIsLoading(true);
      
      // Get current status
      const currentStatus = agent.is_active?.Bool || false;
      
      // Call API to toggle agent
      const updatedAgent = await agentService.toggleAgent(agent.id, !currentStatus);
      
      // Update agent state
      setAgent(updatedAgent);
      
      // Show notification
      notification.showSuccess('Success', `Agent ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (err) {
      console.error('Error toggling agent:', err);
      notification.showError('Error', 'Failed to toggle agent. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteAgent = async () => {
    if (!agent) return;
    
    try {
      setIsLoading(true);
      
      // Call the API to delete the agent
      await agentService.deleteAgentSetting(agent.id);
      
      // Show notification
      notification.showSuccess('Success', 'Agent deleted successfully');
      
      // Navigate back to agents list
      navigate('/agents');
    } catch (err) {
      console.error('Error deleting agent:', err);
      notification.showError('Error', 'Failed to delete agent. Please try again.');
      setIsLoading(false);
    }
  };
  
  const handleTestAgent = async (e) => {
    e.preventDefault();
    
    if (!agent) return;
    
    try {
      setIsTestingAgent(true);
      
      // Call the API to test the agent
      const response = await agentService.testAgent(agent.id, testEmail);
      
      // Store the response
      setTestResponse(response);
      
    } catch (err) {
      console.error('Error testing agent:', err);
      notification.showError('Error', 'Failed to test agent. Please try again.');
    } finally {
      setIsTestingAgent(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTestEmail({ ...testEmail, [name]: value });
  };
  
  // Get agent type display name
  const getAgentTypeDisplay = (type) => {
    const types = {
      'outreach': 'Outreach',
      'follow_up': 'Follow-up',
      'meeting': 'Meeting',
      'analytics': 'Analytics',
      'coach': 'Coach'
    };
    return types[type] || type;
  };
  
  if (isLoading && !agent) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (error && !agent) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
        <p className="font-bold">Error</p>
        <p>{error}</p>
        <button
          onClick={() => navigate('/agents')}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Back to Agents
        </button>
      </div>
    );
  }
  
  if (!agent) {
    return (
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
        <p className="font-bold">Not Found</p>
        <p>Agent not found. It may have been deleted.</p>
        <button
          onClick={() => navigate('/agents')}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Agents
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {isLoading && <Spinner fullPage />}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Agent: {agent.name}</h1>
          <p className="text-gray-600">{getAgentTypeDisplay(agent.agent_type)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowTestModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Test Agent
          </button>
          <button
            onClick={() => navigate(`/agents/${agent.id}/edit`)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit
          </button>
          <button
            onClick={handleToggleAgent}
            className={`px-4 py-2 text-white rounded ${
              agent.is_active?.Bool 
                ? 'bg-orange-600 hover:bg-orange-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {agent.is_active?.Bool ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
          <button
            onClick={() => navigate('/agents')}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Back
          </button>
        </div>
      </div>

      {/* Agent Details */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Agent Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      agent.is_active?.Bool 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {agent.is_active?.Bool ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Created</label>
                  <div className="mt-1">{new Date(agent.created_at).toLocaleString()}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                  <div className="mt-1">{new Date(agent.updated_at).toLocaleString()}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Approval Required</label>
                  <div className="mt-1">{agent.approval_required?.Bool ? 'Yes' : 'No'}</div>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-4">Personality</h2>
              <div className="space-y-3">
                {agent.personality && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Formality</label>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${(agent.personality.formality / 10) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Casual</span>
                        <span>Formal</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Assertiveness</label>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${(agent.personality.assertiveness / 10) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Passive</span>
                        <span>Assertive</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Creativity</label>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${(agent.personality.creativity / 10) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Factual</span>
                        <span>Creative</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Humor</label>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${(agent.personality.humor / 10) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Serious</span>
                        <span>Humorous</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Tone</label>
                      <div className="mt-1">{agent.personality.tone_preference || 'Professional'}</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Working Hours */}
          {agent.working_hours && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4">Working Hours</h2>
              <div className="bg-gray-50 p-4 rounded">
                <div className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Timezone:</span> {agent.working_hours.timezone || 'America/New_York'}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {agent.working_hours.weekdays && Object.entries(agent.working_hours.weekdays).map(([day, hours]) => (
                    <div key={day} className="p-3 bg-white rounded shadow-sm">
                      <h3 className="font-medium text-gray-800 capitalize">{day}</h3>
                      {hours.start && hours.end ? (
                        <p className="text-gray-600 mt-1">{hours.start} - {hours.end}</p>
                      ) : (
                        <p className="text-gray-500 italic mt-1">Off</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Email Signature */}
          {agent.signature && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4">Email Signature</h2>
              <div className="bg-gray-50 p-4 rounded">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">{agent.signature}</pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="p-4 border border-gray-200 rounded bg-gray-50 text-gray-500 text-center">
          Recent agent activity will appear here.
        </div>
      </div>

      {/* Test Agent Modal */}
      <Modal
        isOpen={showTestModal}
        onClose={() => {
          setShowTestModal(false);
          setTestResponse(null);
        }}
        title="Test Agent"
        size="lg"
      >
        {!testResponse ? (
          <form onSubmit={handleTestAgent}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Email</label>
                <input
                  type="email"
                  name="fromEmail"
                  value={testEmail.fromEmail}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="customer@example.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={testEmail.subject}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email subject"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Body</label>
                <textarea
                  name="emailBody"
                  value={testEmail.emailBody}
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
                  name="simulateNow"
                  checked={testEmail.simulateNow}
                  onChange={(e) => setTestEmail({ ...testEmail, simulateNow: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-700">Simulate immediate response (ignore working hours)</span>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowTestModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                disabled={isTestingAgent}
              >
                {isTestingAgent ? 'Testing...' : 'Test Agent'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Agent Analysis</h3>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-gray-700">{testResponse.analysis || 'No analysis provided'}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Email Response</h3>
              <div className="bg-gray-50 p-3 rounded">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">{testResponse.emailResponse || 'No response generated'}</pre>
              </div>
            </div>
            
            {testResponse.actions && testResponse.actions.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Actions Taken</h3>
                <div className="bg-gray-50 p-3 rounded">
                  <ul className="space-y-2">
                    {testResponse.actions.map((action, index) => (
                      <li key={index} className="flex items-start">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded mr-2">
                          {action.type}
                        </span>
                        <span className="text-gray-700">{action.reasoning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {testResponse.opportunities && testResponse.opportunities.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Opportunities Identified</h3>
                <div className="bg-gray-50 p-3 rounded">
                  <ul className="space-y-2">
                    {testResponse.opportunities.map((opportunity, index) => (
                      <li key={index} className="text-gray-700">
                        <span className="font-medium">{opportunity.type}:</span> {opportunity.description}
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
                  setShowTestModal(false);
                  setTestResponse(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-3"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => setTestResponse(null)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Test Again
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
        size="sm"
      >
        <div>
          <p className="text-gray-700">
            Are you sure you want to delete agent{' '}
            <span className="font-semibold">{agent.name}</span>?
            This action cannot be undone.
          </p>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-3"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteAgent}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AgentDetail;