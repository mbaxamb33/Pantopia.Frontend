// src/pages/agents/AgentEdit.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { agentService } from '../../api/agentService';
import { useNotification } from '../../context/NotificationContext';
import Spinner from '../../components/ui/Spinner';

const AgentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const notification = useNotification();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [agentData, setAgentData] = useState({
    agent_type: '',
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
  
  // Fetch agent details
  useEffect(() => {
    const fetchAgentDetails = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await agentService.getAgentSetting(id);
        
        // Parse personality JSON if needed
        let personality = data.personality;
        if (typeof personality === 'string') {
          try {
            personality = JSON.parse(personality);
          } catch (err) {
            console.error('Error parsing personality:', err);
            personality = agentData.personality;
          }
        }
        
        // Parse working hours JSON if needed
        let workingHours = data.working_hours;
        if (typeof workingHours === 'string') {
          try {
            workingHours = JSON.parse(workingHours);
          } catch (err) {
            console.error('Error parsing working hours:', err);
            workingHours = agentData.working_hours;
          }
        }
        
        // Update agent data state
        setAgentData({
          agent_type: data.agent_type || '',
          name: data.name || '',
          is_active: data.is_active?.Bool || false,
          personality: personality || agentData.personality,
          signature: data.signature?.String || '',
          working_hours: workingHours || agentData.working_hours,
          approval_required: data.approval_required?.Bool || false
        });
      } catch (err) {
        console.error(`Error fetching agent ${id}:`, err);
        setError('Failed to load agent details. Please try again later.');
        notification.showError('Error', 'Failed to load agent details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgentDetails();
  }, [id, notification]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Call API to update agent
      await agentService.updateAgentSetting(agentData.agent_type, agentData);
      
      notification.showSuccess('Success', 'Agent updated successfully');
      
      // Navigate back to agent details
      navigate(`/agents/${id}`);
    } catch (err) {
      console.error('Error updating agent:', err);
      notification.showError('Error', 'Failed to update agent. Please try again.');
      setIsLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAgentData({ ...agentData, [name]: value });
  };
  
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setAgentData({ ...agentData, [name]: checked });
  };
  
  const handlePersonalityChange = (e) => {
    const { name, value } = e.target;
    setAgentData({
      ...agentData,
      personality: {
        ...agentData.personality,
        [name]: ['formality', 'assertiveness', 'creativity', 'humor', 'responsiveness'].includes(name)
          ? parseInt(value)
          : value
      }
    });
  };
  
  const handleWorkingHoursChange = (day, field, value) => {
    setAgentData({
      ...agentData,
      working_hours: {
        ...agentData.working_hours,
        weekdays: {
          ...agentData.working_hours.weekdays,
          [day]: {
            ...agentData.working_hours.weekdays[day],
            [field]: value
          }
        }
      }
    });
  };
  
  const handleTimezoneChange = (e) => {
    setAgentData({
      ...agentData,
      working_hours: {
        ...agentData.working_hours,
        timezone: e.target.value
      }
    });
  };
  
  if (isLoading && !agentData.agent_type) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (error && !agentData.agent_type) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
        <p className="font-bold">Error</p>
        <p>{error}</p>
        <button
          onClick={() => navigate(`/agents/${id}`)}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Back to Agent
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      {isLoading && <Spinner fullPage />}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Agent</h1>
        <button
          onClick={() => navigate(`/agents/${id}`)}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Cancel
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-medium text-gray-800 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agent Type
                </label>
                <select
                  name="agent_type"
                  value={agentData.agent_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled // Agent type cannot be changed
                >
                  <option value="outreach">Outreach</option>
                  <option value="follow_up">Follow-up</option>
                  <option value="meeting">Meeting</option>
                  <option value="analytics">Analytics</option>
                  <option value="coach">Coach</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">Agent type cannot be changed after creation</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={agentData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={agentData.is_active}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Active (agent will process incoming requests)
                  </label>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="approval_required"
                    checked={agentData.approval_required}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Require approval before sending messages
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Personality */}
          <div>
            <h2 className="text-lg font-medium text-gray-800 mb-4">Personality</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Formality (1-10)
                </label>
                <input
                  type="range"
                  name="formality"
                  min="1"
                  max="10"
                  value={agentData.personality.formality}
                  onChange={handlePersonalityChange}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Casual</span>
                  <span>Value: {agentData.personality.formality}</span>
                  <span>Formal</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assertiveness (1-10)
                </label>
                <input
                  type="range"
                  name="assertiveness"
                  min="1"
                  max="10"
                  value={agentData.personality.assertiveness}
                  onChange={handlePersonalityChange}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Passive</span>
                  <span>Value: {agentData.personality.assertiveness}</span>
                  <span>Assertive</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Creativity (1-10)
                </label>
                <input
                  type="range"
                  name="creativity"
                  min="1"
                  max="10"
                  value={agentData.personality.creativity}
                  onChange={handlePersonalityChange}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Factual</span>
                  <span>Value: {agentData.personality.creativity}</span>
                  <span>Creative</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Humor (1-10)
                </label>
                <input
                  type="range"
                  name="humor"
                  min="1"
                  max="10"
                  value={agentData.personality.humor}
                  onChange={handlePersonalityChange}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Serious</span>
                  <span>Value: {agentData.personality.humor}</span>
                  <span>Humorous</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Responsiveness (1-10)
                </label>
                <input
                  type="range"
                  name="responsiveness"
                  min="1"
                  max="10"
                  value={agentData.personality.responsiveness || 5}
                  onChange={handlePersonalityChange}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Thoughtful</span>
                  <span>Value: {agentData.personality.responsiveness || 5}</span>
                  <span>Quick</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tone Preference
                </label>
                <select
                  name="tone_preference"
                  value={agentData.personality.tone_preference}
                  onChange={handlePersonalityChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly</option>
                  <option value="technical">Technical</option>
                  <option value="casual">Casual</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Voice Preference
                </label>
                <select
                  name="voice_preference"
                  value={agentData.personality.voice_preference}
                  onChange={handlePersonalityChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="first person">First Person (I, me, my)</option>
                  <option value="third person">Third Person (The team, we)</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Working Hours */}
          <div>
            <h2 className="text-lg font-medium text-gray-800 mb-4">Working Hours</h2>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timezone
                </label>
                <select
                  value={agentData.working_hours.timezone}
                  onChange={handleTimezoneChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Paris (CET)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(agentData.working_hours.weekdays).map(([day, hours]) => (
                  <div key={day} className="p-3 bg-white rounded shadow-sm">
                    <h3 className="font-medium text-gray-800 capitalize mb-2">{day}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                        <input
                          type="time"
                          value={hours.start}
                          onChange={(e) => handleWorkingHoursChange(day, 'start', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">End Time</label>
                        <input
                          type="time"
                          value={hours.end}
                          onChange={(e) => handleWorkingHoursChange(day, 'end', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Email Signature */}
          <div>
            <h2 className="text-lg font-medium text-gray-800 mb-4">Email Signature</h2>
            <textarea
              name="signature"
              value={agentData.signature}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              placeholder="Best regards,&#10;Your AI Assistant"
            ></textarea>
            <p className="mt-1 text-xs text-gray-500">This signature will be added to emails sent by the agent</p>
          </div>
          
          <div className="pt-4 border-t flex justify-end">
            <button
              type="button"
              onClick={() => navigate(`/agents/${id}`)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgentEdit;