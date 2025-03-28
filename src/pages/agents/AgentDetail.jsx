// src/pages/agents/AgentDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import MockEmailTester from '../../components/agents/MockEmailTester';
import AgentActionsList from '../../components/agents/AgentActionsList';

// Helper function to extract values from SQL.NullString objects
const extractString = (nullableField) => {
  if (!nullableField) return '';
  if (typeof nullableField === 'string') return nullableField;
  if (nullableField.Valid && nullableField.String) return nullableField.String;
  return '';
};

// Helper to extract boolean values
const extractBool = (nullableBool) => {
  if (nullableBool === null || nullableBool === undefined) return false;
  if (typeof nullableBool === 'boolean') return nullableBool;
  if (nullableBool.Valid) return nullableBool.Bool;
  return false;
};

const AgentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const notification = useNotification();
  
  const [agent, setAgent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionsRefreshTrigger, setActionsRefreshTrigger] = useState(0);

  // Fetch agent details
  useEffect(() => {
    const fetchAgentDetails = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Import apiClient
        const apiClient = (await import('../../api/apiClient')).default;
        
        // Fetch agent details
        const response = await apiClient.get(`/agent-settings/${id}`);
        setAgent(response.data);
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
      const currentStatus = extractBool(agent.is_active);
      
      // Import apiClient
      const apiClient = (await import('../../api/apiClient')).default;
      
      // Call API to toggle agent
      const response = await apiClient.post('/agents/toggle', {
        agent_id: agent.id,
        is_active: !currentStatus
      });
      
      // Update agent state
      setAgent(response.data);
      
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
      
      // Import apiClient
      const apiClient = (await import('../../api/apiClient')).default;
      
      // Call the API to delete the agent
      await apiClient.delete(`/agent-settings/${agent.id}`);
      
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
  
  // Safely extract values from nullable fields
  const agentName = extractString(agent.name);
  const agentType = extractString(agent.agent_type);
  const isActive = extractBool(agent.is_active);
  const requiresApproval = extractBool(agent.approval_required);
  const signature = extractString(agent.signature);
  
  return (
    <div className="space-y-6">
      {isLoading && <Spinner fullPage />}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Agent: {agentName}</h1>
          <p className="text-gray-600">{getAgentTypeDisplay(agentType)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <MockEmailTester 
            agentId={agent.id} 
            onTestComplete={() => setActionsRefreshTrigger(prev => prev + 1)}
          />
          
          <button
            onClick={() => navigate(`/agents/${agent.id}/edit`)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit
          </button>
          <button
            onClick={handleToggleAgent}
            className={`px-4 py-2 text-white rounded ${
              isActive 
                ? 'bg-orange-600 hover:bg-orange-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isActive ? 'Deactivate' : 'Activate'}
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
                      isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {isActive ? 'Active' : 'Inactive'}
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
                  <div className="mt-1">{requiresApproval ? 'Yes' : 'No'}</div>
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
          {signature && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4">Email Signature</h2>
              <div className="bg-gray-50 p-4 rounded">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">{signature}</pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <button 
            onClick={() => setActionsRefreshTrigger(prev => prev + 1)}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
        
        <AgentActionsList 
          agentId={id} 
          limit={10} 
          refreshTrigger={actionsRefreshTrigger} 
        />
      </div>

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
            <span className="font-semibold">{agentName}</span>?
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