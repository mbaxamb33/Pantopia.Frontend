// src/components/agents/AgentActionsList.jsx
import { useState, useEffect } from 'react';
import Spinner from '../ui/Spinner';

const AgentActionsList = ({ agentId, limit = 10, refreshTrigger }) => {
  const [actions, setActions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActions = async () => {
      if (!agentId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const apiClient = (await import('../../api/apiClient')).default;
        
        const response = await apiClient.get(`/api/agents/${agentId}/recent-actions`, {
          params: { limit }
        });
        
        setActions(response.data || []);
      } catch (err) {
        console.error('Error fetching actions:', err);
        setError('Failed to load recent actions');
        setActions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActions();
  }, [agentId, limit, refreshTrigger]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Spinner size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-200 rounded bg-red-50 text-red-500 text-center">
        {error}
      </div>
    );
  }

  if (!actions || actions.length === 0) {
    return (
      <div className="p-4 border border-gray-200 rounded bg-gray-50 text-gray-500 text-center">
        No recent actions found for this agent.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Time
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Details
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {actions.map((action, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  action.type.includes('email') ? 'bg-blue-100 text-blue-800' : 
                  action.type.includes('meeting') ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {action.type}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  action.status === 'completed' ? 'bg-green-100 text-green-800' : 
                  action.status === 'failed' ? 'bg-red-100 text-red-800' : 
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {action.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(action.executed_at).toLocaleString()}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {action.details && Object.keys(action.details).length > 0 ? (
                  <details>
                    <summary className="cursor-pointer hover:text-blue-600">Show details</summary>
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs whitespace-pre-wrap">
                      {JSON.stringify(action.details, null, 2)}
                    </div>
                  </details>
                ) : (
                  <span className="text-gray-400">No details</span>
                )}
                {action.error_detail && (
                  <div className="mt-1 text-xs text-red-600">
                    Error: {action.error_detail}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AgentActionsList;