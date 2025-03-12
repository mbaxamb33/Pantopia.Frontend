// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService, contactService, healthCheck } from '../api/apiService';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    contacts: 0,
    companies: 0,
    projects: 0,
    conversations: 0,
  });
  const [recentContacts, setRecentContacts] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial stats
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // For demo purposes, we'll use mock data
        // In a real application, this would fetch from the API
        setStats({
          contacts: 24,
          companies: 8,
          projects: 5,
          conversations: 12,
        });

        // Mock recent contacts
        setRecentContacts([
          { id: 1, first_name: { String: 'John', Valid: true }, last_name: { String: 'Doe', Valid: true }, email: { String: 'john@example.com', Valid: true }, company_name: { String: 'Acme Inc', Valid: true } },
          { id: 2, first_name: { String: 'Sarah', Valid: true }, last_name: { String: 'Johnson', Valid: true }, email: { String: 'sarah@example.com', Valid: true }, company_name: { String: 'Tech Solutions', Valid: true } },
          { id: 3, first_name: { String: 'Michael', Valid: true }, last_name: { String: 'Brown', Valid: true }, email: { String: 'michael@example.com', Valid: true }, company_name: { String: 'Global Services', Valid: true } },
        ]);

        // Mock recent projects
        setRecentProjects([
          { id: 1, name: 'Website Redesign', status: 'active', value: { String: '5000.00', Valid: true }, due_date: { Time: '2025-06-30', Valid: true } },
          { id: 2, name: 'Product Launch', status: 'active', value: { String: '12000.00', Valid: true }, due_date: { Time: '2025-05-15', Valid: true } },
          { id: 3, name: 'Marketing Campaign', status: 'completed', value: { String: '3500.00', Valid: true }, due_date: { Time: '2025-04-01', Valid: true } },
        ]);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {currentUser?.name || 'User'}!</h1>
        <p className="text-gray-600">Here's an overview of your sales activities and performance</p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Contacts" value={stats.contacts} icon="👥" color="bg-blue-500" />
        <StatCard title="Companies" value={stats.companies} icon="🏢" color="bg-green-500" />
        <StatCard title="Projects" value={stats.projects} icon="📁" color="bg-purple-500" />
        <StatCard title="Conversations" value={stats.conversations} icon="💬" color="bg-yellow-500" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Contacts */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Contacts</h2>
            <Link to="/contacts" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All →
            </Link>
          </div>
          
          {recentContacts.length === 0 ? (
            <p className="text-gray-500">No recent contacts found.</p>
          ) : (
            <div className="space-y-4">
              {recentContacts.map(contact => (
                <div key={contact.id} className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      {contact.first_name.String.charAt(0)}{contact.last_name.String.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-800">{contact.first_name.String} {contact.last_name.String}</p>
                      <p className="text-sm text-gray-500">{contact.company_name.Valid ? contact.company_name.String : 'No company'}</p>
                    </div>
                  </div>
                  <Link to={`/contacts/${contact.id}`} className="text-sm text-blue-600 hover:text-blue-800">
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Recent Projects */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Active Projects</h2>
            <Link to="/projects" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All →
            </Link>
          </div>
          
          {recentProjects.length === 0 ? (
            <p className="text-gray-500">No active projects found.</p>
          ) : (
            <div className="space-y-4">
              {recentProjects.map(project => (
                <div key={project.id} className="border-b border-gray-100 pb-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-800">{project.name}</h3>
                    <StatusBadge status={project.status} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <p className="text-gray-500">
                      Value: {project.value.Valid ? `$${parseFloat(project.value.String).toLocaleString()}` : 'N/A'}
                    </p>
                    <p className="text-gray-500">
                      Due: {project.due_date.Valid ? new Date(project.due_date.Time).toLocaleDateString() : 'No date'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Activity Timeline */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <ActivityTimeline />
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionCard 
            title="Add Contact" 
            description="Create a new contact in your network" 
            icon="👤" 
            link="/contacts"
            color="bg-blue-50 text-blue-600" 
          />
          <QuickActionCard 
            title="New Project" 
            description="Start tracking a new sales opportunity" 
            icon="🚀" 
            link="/projects"
            color="bg-purple-50 text-purple-600" 
          />
          <QuickActionCard 
            title="Schedule Meeting" 
            description="Set up a call or meeting with contacts" 
            icon="📅" 
            link="/meetings"
            color="bg-green-50 text-green-600" 
          />
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
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

// Status Badge Component
const StatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Quick Action Card
const QuickActionCard = ({ title, description, icon, link, color }) => (
  <Link to={link} className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition duration-300">
    <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center mb-3`}>
      <span className="text-xl">{icon}</span>
    </div>
    <h3 className="font-medium text-gray-800 mb-1">{title}</h3>
    <p className="text-sm text-gray-500">{description}</p>
  </Link>
);

// Activity Timeline
const ActivityTimeline = () => {
  // This would normally fetch from an API
  const activities = [
    { id: 1, type: 'contact', action: 'added', subject: 'John Smith', timestamp: '2 hours ago' },
    { id: 2, type: 'project', action: 'updated', subject: 'Website Redesign', timestamp: 'Yesterday' },
    { id: 3, type: 'email', action: 'sent', subject: 'Follow-up with ABC Corp', timestamp: '2 days ago' },
    { id: 4, type: 'meeting', action: 'scheduled', subject: 'Quarterly Review', timestamp: '3 days ago' },
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'contact': return '👤';
      case 'project': return '📁';
      case 'email': return '📧';
      case 'meeting': return '📅';
      default: return '🔔';
    }
  };

  if (activities.length === 0) {
    return <p className="text-gray-500">No recent activity.</p>;
  }

  return (
    <div className="space-y-4">
      {activities.map(activity => (
        <div key={activity.id} className="flex">
          <div className="mr-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              {getActivityIcon(activity.type)}
            </div>
          </div>
          <div>
            <p className="text-gray-800">
              <span className="font-medium">{activity.action.charAt(0).toUpperCase() + activity.action.slice(1)}</span> {activity.type} - {activity.subject}
            </p>
            <p className="text-sm text-gray-500">{activity.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;