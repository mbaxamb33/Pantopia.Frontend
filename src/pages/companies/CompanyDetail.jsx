// src/pages/companies/CompanyDetail.jsx
import { useParams } from 'react-router-dom';

const CompanyDetail = () => {
  const { id } = useParams();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Company Details</h1>
      <div className="bg-white p-8 rounded shadow-md text-center">
        <h2 className="text-lg text-gray-600">Company Detail for ID: {id}</h2>
        <p className="text-gray-500 mt-2">This feature is under development</p>
      </div>
    </div>
  );
};

export default CompanyDetail;