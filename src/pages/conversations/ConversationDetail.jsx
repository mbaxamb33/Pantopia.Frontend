// src/pages/conversations/ConversationDetail.jsx
import { useParams } from 'react-router-dom';

const ConversationDetail = () => {
  const { id } = useParams();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Conversation Details</h1>
      <div className="bg-white p-8 rounded shadow-md text-center">
        <h2 className="text-lg text-gray-600">Conversation Detail for ID: {id}</h2>
        <p className="text-gray-500 mt-2">This feature is under development</p>
      </div>
    </div>
  );
};

export default ConversationDetail;