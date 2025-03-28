// src/pages/Agents.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { agentService } from '../api/agentService';
import { useNotification } from '../context/NotificationContext';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  
  // New agent form state
  const [newAgent, setNewAgent] = useState({
    agent_type: 'outreach',
    name: '',
    is_active: false,
    personality: {
      formality: 5,
      assertiveness: 5,
      creativity: 5,
      humor: 3,
      responsiveness: 7,
      tone_preference: 'professional',
      voice_preference: 'first person'
    },
    signature: '',
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
    approval_required: false
  });
  
  const navigate = useNavigate();
  const notification = useNotification();

  // Fetch agents from API
  useEffect(() => {
    const fetchAgents = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await agentService.getAgentSettings(page, pageSize);
        
        // For development/testing - generate mock data if API returns empty
        if (data && data.length === 0) {
          const mockAgents = [
            {
              id: 1,
              agent_type: 'outreach',
              name: 'Sales Outreach Agent',
              is_active: { Bool: true, Valid: true },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 2,
              agent_type: 'follow_up',
              name: 'Follow-up Agent',
              is_active: { Bool: false, Valid: true },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ];
          setAgents(mockAgents);
        } else {
          setAgents(data);
        }
      } catch (err) {
        console.error('Error fetching agents:', err);
        setError('Failed to load agents. Please try again later.');
        notification.showError('Error', 'Failed to load agents. Please try again later.');
        
        // Set mock data for development/testing
        const mockAgents = [
          {
            id: 1,
            agent_type: 'outreach',
            name: 'Sales Outreach Agent',
            is_active: { Bool: true, Valid: true },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 2,
            agent_type: 'follow_up',
            name: 'Follow-up Agent',
            is_active: { Bool: false, Valid: true },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        setAgents(mockAgents);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgents();
  }, [page, pageSize, notification]);

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Call the API to create the agent
      const response = await agentService.createAgentSetting(newAgent);
      
      // Update the agents list
      setAgents([...agents, response]);
      
      // Reset form and close modal
      setNewAgent({
        agent_type: 'outreach',
        name: '',
        is_active: false,
        personality: {
          formality: 5,
          assertiveness: 5,
          creativity: 5,
          humor: 3,
          responsiveness: 7,
          tone_preference: 'professional',
          voice_preference: 'first person'
        },
        signature: '',
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
        approval_required: false
      });
      setShowCreateModal(false);
      
      notification.showSuccess('Success', 'Agent created successfully');
    } catch (err) {
      console.error('Error creating agent:', err);
      notification.showError('Error', 'Failed to create agent. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAgent = async () => {
    if (!selectedAgent) return;
    
    try {
      setIsLoading(true);
      
      // Call the API to delete the agent
      await agentService.deleteAgentSetting(selectedAgent.id);
      
      // Remove agent from list
      setAgents(agents.filter(a => a.id !== selectedAgent.id));
      
      // Close modal
      setShowDeleteModal(false);
      setSelectedAgent(null);
      
      notification.showSuccess('Success', 'Agent deleted successfully');
    } catch (err) {
      console.error('Error deleting agent:', err);
      notification.showError('Error', 'Failed to delete agent. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAgent = async (agent) => {
    try {
      setIsLoading(true);
      
      // Get current status
      const currentStatus = agent.is_active?.Bool || false;
      
      // Call API to toggle agent
      const updatedAgent = await agentService.toggleAgent(agent.id, !currentStatus);
      
      // Update agents list
      setAgents(agents.map(a => a.id === agent.id ? updatedAgent : a));
      
      // Show notification
      notification.showSuccess('Success', `Agent ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (err) {
      console.error('Error toggling agent:', err);
      notification.showError('Error', 'Failed to toggle agent. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDeleteModal = (agent) => {
    setSelectedAgent(agent);
    setShowDeleteModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAgent({ ...newAgent, [name]: value });
  };

  const handlePersonalityChange = (e) => {
    const { name, value } = e.target;
    setNewAgent({
      ...newAgent,
      personality: {
        ...newAgent.personality,
        [name]: name === 'formality' || name === 'assertiveness' || name === 'creativity' || 
                name === 'humor' || name === 'responsiveness' 
                ? parseInt(value) 
                : value
      }
    });
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

  if (isLoading && agents.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">AI Agents</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
        >
          Create Agent
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}

      {/* Agent list */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Agent Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {agents.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No agents found. Create your first agent!
                </td>
              </tr>
            ) : (
              agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {getAgentTypeDisplay(agent.agent_type)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{agent.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      agent.is_active?.Bool 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {agent.is_active?.Bool ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(agent.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => navigate(`/agents/${agent.id}`)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View
                    </button>
                    <button 
                      onClick={() => navigate(`/agents/${agent.id}/edit`)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleToggleAgent(agent)}
                      className={`${
                        agent.is_active?.Bool 
                          ? 'text-red-600 hover:text-red-900' 
                          : 'text-green-600 hover:text-green-900'
                      } mr-3`}
                    >
                      {agent.is_active?.Bool ? 'Deactivate' : 'Activate'}
                    </button>
                    <button 
                      onClick={() => handleOpenDeleteModal(agent)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Agent Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Agent"
        size="lg"
      >
        <form onSubmit={handleCreateAgent} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Agent Type</label>
            <select
              name="agent_type"
              value={newAgent.agent_type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="outreach">Outreach</option>
              <option value="follow_up">Follow-up</option>
              <option value="meeting">Meeting</option>
              <option value="analytics">Analytics</option>
              <option value="coach">Coach</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={newAgent.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="My Sales Assistant"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Active</label>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={newAgent.is_active}
                onChange={(e) => setNewAgent({ ...newAgent, is_active: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-gray-700">Activate agent upon creation</span>
            </div>
          </div>
          
          <div>
            <h3 className="text-md font-medium text-gray-800 mb-2">Personality</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Formality (1-10)</label>
                <input
                  type="range"
                  name="formality"
                  min="1"
                  max="10"
                  value={newAgent.personality.formality}
                  onChange={handlePersonalityChange}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Casual</span>
                  <span>Formal</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assertiveness (1-10)</label>
                <input
                  type="range"
                  name="assertiveness"
                  min="1"
                  max="10"
                  value={newAgent.personality.assertiveness}
                  onChange={handlePersonalityChange}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Passive</span>
                  <span>Assertive</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Creativity (1-10)</label>
                <input
                  type="range"
                  name="creativity"
                  min="1"
                  max="10"
                  value={newAgent.personality.creativity}
                  onChange={handlePersonalityChange}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Factual</span>
                  <span>Creative</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Humor (1-10)</label>
                <input
                  type="range"
                  name="humor"
                  min="1"
                  max="10"
                  value={newAgent.personality.humor}
                  onChange={handlePersonalityChange}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Serious</span>
                  <span>Humorous</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tone Preference</label>
                <select
                  name="tone_preference"
                  value={newAgent.personality.tone_preference}
                  onChange={handlePersonalityChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly</option>
                  <option value="technical">Technical</option>
                  <option value="casual">Casual</option>
                </select>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Signature</label>
            <textarea
              name="signature"
              value={newAgent.signature}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Best regards,&#10;Your AI Assistant"
            ></textarea>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Create Agent
            </button>
          </div>
        </form>
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
            <span className="font-semibold">
              {selectedAgent ? selectedAgent.name : ''}
            </span>?
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

      {/* Loading overlay */}
      {isLoading && <Spinner fullPage />}
    </div>
  );
};

export default Agents;