// src/pages/Dashboard.jsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  contactsService, 
  conversationsService, 
  projectsService, 
  meetingsService 
} from '../api/index.js';
import Spinner from '../components/ui/Spinner';
import { useNotification } from '../context/NotificationContext';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const notification = useNotification();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Use useMemo to memoize dashboard data
  const [dashboardData, setDashboardData] = useState({
    stats: {
      contacts: 0,
      conversations: 0,
      projects: 5,
      meetings: 12
    },
    recentContacts: [],
    activeConversations: [],
    agentActivity: [],
    calendarEvents: []
  });

  // Use useCallback to memoize the fetch function
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch contacts
      const contactsResponse = await contactsService.getContacts(1, 10);
      const contactsData = Array.isArray(contactsResponse) 
        ? contactsResponse 
        : contactsResponse.data || [];
      
      // Fetch conversations
      const conversationsResponse = await conversationsService.getConversations(1, 10);
      const conversationsData = Array.isArray(conversationsResponse) 
        ? conversationsResponse 
        : conversationsResponse.data || [];
      
      // Update dashboard data
      setDashboardData({
        stats: {
          contacts: contactsData.length > 0 
            ? (contactsData[0].total_count || contactsData.length)
            : 0,
          conversations: conversationsData.length > 0 
            ? (conversationsData[0].total_count || conversationsData.length)
            : 0,
          projects: 5,
          meetings: 12
        },
        recentContacts: contactsData.slice(0, 5).map(contact => ({
          id: contact.id,
          first_name: contact.first_name,
          last_name: contact.last_name,
          email: contact.email,
          last_contact_date: contact.updated_at || new Date().toISOString()
        })),
        activeConversations: conversationsData.slice(0, 3).map(conversation => ({
          id: conversation.id,
          title: conversation.title || conversation.subject || 'Untitled Conversation',
          contact_name: conversation.contact_name || conversation.contact?.name || 'Unknown Contact',
          last_message_at: conversation.last_message_at || conversation.updated_at || new Date().toISOString(),
          unread_count: conversation.unread_count || conversation.unread || 0
        })),
        // Mock data for other sections
        agentActivity: [],
        calendarEvents: []
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
      notification.showError('Error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [notification]);

  // Use useEffect with empty dependency array to fetch data only once
  useEffect(() => {
    fetchDashboardData();
  }, []); // Empty dependency array means this runs only once when component mounts

  // Memoized name formatting to prevent unnecessary re-renders
  const formatName = useCallback((contact) => {
    const firstName = contact.first_name?.Valid ? contact.first_name.String : '';
    const lastName = contact.last_name?.Valid ? contact.last_name.String : '';
    return `${firstName} ${lastName}`.trim();
  }, []);

  // Memoized date formatting
  const formatDate = useCallback((dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }, []);

  // Memoized time formatting
  const formatTime = useCallback((dateString) => {
    const options = { hour: 'numeric', minute: 'numeric' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  }, []);

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
        <MetricCard 
          title="Contacts" 
          value={dashboardData.stats.contacts} 
          icon="👥" 
          color="bg-blue-500" 
        />
        <MetricCard 
          title="Conversations" 
          value={dashboardData.stats.conversations} 
          icon="💬" 
          color="bg-green-500" 
        />
        <MetricCard 
          title="Projects" 
          value={dashboardData.stats.projects} 
          icon="📁" 
          color="bg-purple-500" 
        />
        <MetricCard 
          title="Meetings" 
          value={dashboardData.stats.meetings} 
          icon="📅" 
          color="bg-yellow-500" 
        />
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
            {dashboardData.recentContacts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent contacts found.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {dashboardData.recentContacts.map((contact) => (
                  <li key={contact.id} className="py-3">
                    <Link to={`/contacts/${contact.id}`} className="flex justify-between items-center hover:bg-gray-50 p-2 rounded">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                          {contact.first_name?.Valid ? contact.first_name.String.charAt(0) : ''}
                          {contact.last_name?.Valid ? contact.last_name.String.charAt(0) : ''}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">{formatName(contact)}</p>
                          <p className="text-sm text-gray-500">{contact.email?.Valid ? contact.email.String : ''}</p>
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
            {dashboardData.activeConversations.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No active conversations found.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {dashboardData.activeConversations.map((conversation) => (
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

        {/* Placeholder for other sections */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Upcoming Events</h2>
          <p className="text-gray-500 text-center">No upcoming events found.</p>
        </div>
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

export default Dashboard;