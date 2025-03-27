// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { contactsService, conversationsService } from '../api';
import Spinner from '../components/ui/Spinner';
import { useNotification } from '../context/NotificationContext';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const notification = useNotification();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dashboard data states
  const [stats, setStats] = useState({
    contacts: 0,
    conversations: 0,
    projects: 0,
    meetings: 0
  });
  const [recentContacts, setRecentContacts] = useState([]);
  const [activeConversations, setActiveConversations] = useState([]);
  const [agentActivity, setAgentActivity] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // In a real app, we'd make API calls to fetch real data
        // For demo purposes, we're using mock data
        
        // Mock statistics
        setStats({
          contacts: 24,
          conversations: 8,
          projects: 5,
          meetings: 12
        });

        // Mock recent contacts
        setRecentContacts([
          { id: 1, first_name: { String: 'John', Valid: true }, last_name: { String: 'Doe', Valid: true }, email: { String: 'john@example.com', Valid: true }, last_contact_date: '2025-03-20' },
          { id: 2, first_name: { String: 'Sarah', Valid: true }, last_name: { String: 'Johnson', Valid: true }, email: { String: 'sarah@example.com', Valid: true }, last_contact_date: '2025-03-22' },
          { id: 3, first_name: { String: 'Michael', Valid: true }, last_name: { String: 'Brown', Valid: true }, email: { String: 'michael@example.com', Valid: true }, last_contact_date: '2025-03-25' },
          { id: 4, first_name: { String: 'Emily', Valid: true }, last_name: { String: 'Davis', Valid: true }, email: { String: 'emily@example.com', Valid: true }, last_contact_date: '2025-03-26' },
          { id: 5, first_name: { String: 'David', Valid: true }, last_name: { String: 'Wilson', Valid: true }, email: { String: 'david@example.com', Valid: true }, last_contact_date: '2025-03-27' },
        ]);

        // Mock active conversations
        setActiveConversations([
          { id: 1, title: 'Product Demo Follow-up', contact_id: 1, contact_name: 'John Doe', status: 'active', last_message_at: '2025-03-27T10:30:00Z', unread_count: 2 },
          { id: 2, title: 'Proposal Discussion', contact_id: 2, contact_name: 'Sarah Johnson', status: 'active', last_message_at: '2025-03-27T09:15:00Z', unread_count: 0 },
          { id: 3, title: 'Contract Review', contact_id: 3, contact_name: 'Michael Brown', status: 'active', last_message_at: '2025-03-26T16:45:00Z', unread_count: 1 },
        ]);

        // Mock agent activity
        setAgentActivity([
          { id: 1, type: 'email_sent', description: 'Follow-up email sent to John Doe', timestamp: '2025-03-27T10:45:00Z', status: 'completed' },
          { id: 2, type: 'meeting_scheduled', description: 'Demo scheduled with Sarah Johnson', timestamp: '2025-03-27T08:30:00Z', status: 'completed' },
          { id: 3, type: 'task_created', description: 'Prepare proposal for Michael Brown', timestamp: '2025-03-26T15:20:00Z', status: 'pending' },
        ]);

        // Mock calendar events
        setCalendarEvents([
          { id: 1, title: 'Product Demo with ABC Corp', start_time: '2025-03-28T10:00:00Z', end_time: '2025-03-28T11:00:00Z', attendees: ['John Doe', 'Sarah Miller'] },
          { id: 2, title: 'Weekly Team Meeting', start_time: '2025-03-28T15:00:00Z', end_time: '2025-03-28T16:00:00Z', attendees: ['Team'] },
          { id: 3, title: 'Contract Review Call', start_time: '2025-03-29T13:30:00Z', end_time: '2025-03-29T14:30:00Z', attendees: ['Michael Brown', 'Legal Team'] },
        ]);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        notification.showError('Error', 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [notification]);

  // Format contact name from SQL nullable fields
  const formatName = (contact) => {
    const firstName = contact.first_name?.Valid ? contact.first_name.String : '';
    const lastName = contact.last_name?.Valid ? contact.last_name.String : '';
    return `${firstName} ${lastName}`.trim();
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format time for display
  const formatTime = (dateString) => {
    const options = { hour: 'numeric', minute: 'numeric' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {currentUser?.name || 'User'}!</h1>
        <p className="text-gray-600">Here's an overview of your sales activities and performance.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Contacts" value={stats.contacts} icon="👥" color="bg-blue-500" />
        <MetricCard title="Conversations" value={stats.conversations} icon="💬" color="bg-green-500" />
        <MetricCard title="Projects" value={stats.projects} icon="📁" color="bg-purple-500" />
        <MetricCard title="Meetings" value={stats.meetings} icon="📅" color="bg-yellow-500" />
      </div>

      {/* Main Dashboard Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Contacts */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b px-6 py-3 flex justify-between items-center">
            <h2 className="font-semibold text-lg">Recent Contacts</h2>
            <Link to="/contacts" className="text-blue-600 hover:text-blue-800 text-sm">View All</Link>
          </div>
          <div className="p-4">
            {recentContacts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent contacts found.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {recentContacts.map((contact) => (
                  <li key={contact.id} className="py-3">
                    <Link to={`/contacts/${contact.id}`} className="flex justify-between items-center hover:bg-gray-50 p-2 rounded">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                          {contact.first_name.String.charAt(0)}
                          {contact.last_name.String.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">{formatName(contact)}</p>
                          <p className="text-sm text-gray-500">{contact.email.String}</p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(contact.last_contact_date)}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Active Conversations */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b px-6 py-3 flex justify-between items-center">
            <h2 className="font-semibold text-lg">Active Conversations</h2>
            <Link to="/conversations" className="text-blue-600 hover:text-blue-800 text-sm">View All</Link>
          </div>
          <div className="p-4">
            {activeConversations.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No active conversations found.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {activeConversations.map((conversation) => (
                  <li key={conversation.id} className="py-3">
                    <Link to={`/conversations/${conversation.id}`} className="flex justify-between items-center hover:bg-gray-50 p-2 rounded">
                      <div>
                        <div className="flex items-center">
                          <p className="font-medium text-gray-900">{conversation.title}</p>
                          {conversation.unread_count > 0 && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              {conversation.unread_count} new
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">With {conversation.contact_name}</p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(conversation.last_message_at)}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Calendar Events */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b px-6 py-3 flex justify-between items-center">
            <h2 className="font-semibold text-lg">Upcoming Events</h2>
            <Link to="/calendar" className="text-blue-600 hover:text-blue-800 text-sm">View Calendar</Link>
          </div>
          <div className="p-4">
            {calendarEvents.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No upcoming events found.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {calendarEvents.map((event) => (
                  <li key={event.id} className="py-3">
                    <div className="hover:bg-gray-50 p-2 rounded">
                      <div className="flex justify-between">
                        <p className="font-medium text-gray-900">{event.title}</p>
                        <div className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                          {formatDate(event.start_time)}
                        </div>
                      </div>
                      <div className="mt-1 flex justify-between">
                        <p className="text-sm text-gray-500">
                          {formatTime(event.start_time)} - {formatTime(event.end_time)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Agent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b px-6 py-3 flex justify-between items-center">
          <h2 className="font-semibold text-lg">Agent Activity</h2>
          <Link to="/agent-settings" className="text-blue-600 hover:text-blue-800 text-sm">Configure Agent</Link>
        </div>
        <div className="p-4">
          {agentActivity.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent agent activity found.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {agentActivity.map((activity) => (
                <li key={activity.id} className="py-3">
                  <div className="flex items-start p-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      activity.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {activity.type === 'email_sent' && '📧'}
                      {activity.type === 'meeting_scheduled' && '📅'}
                      {activity.type === 'task_created' && '✓'}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium text-gray-900">{activity.description}</p>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          activity.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {activity.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{formatDate(activity.timestamp)} at {formatTime(activity.timestamp)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickActionButton 
          icon="👤" 
          title="New Contact" 
          description="Add a new contact to your network"
          link="/contacts?action=new"
          color="bg-blue-500"
        />
        <QuickActionButton 
          icon="💬" 
          title="New Conversation" 
          description="Start a new conversation with a contact"
          link="/conversations?action=new"
          color="bg-green-500"
        />
        <QuickActionButton 
          icon="⚙️" 
          title="Configure Agent" 
          description="Update your AI agent settings"
          link="/agent-settings"
          color="bg-purple-500"
        />
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-lg shadow flex items-center justify-between">
    <div>
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
    <div className={`${color} text-white p-3 rounded-full`}>
      <span className="text-xl">{icon}</span>
    </div>
  </div>
);

// Quick Action Button Component
const QuickActionButton = ({ icon, title, description, link, color }) => (
  <Link 
    to={link} 
    className="bg-white p-4 rounded-lg shadow flex items-center hover:shadow-md transition-shadow duration-300"
  >
    <div className={`${color} text-white p-3 rounded-full mr-4`}>
      <span className="text-xl">{icon}</span>
    </div>
    <div>
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  </Link>
);

export default Dashboard;