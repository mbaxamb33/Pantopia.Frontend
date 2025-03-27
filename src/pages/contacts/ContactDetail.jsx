// src/pages/contacts/ContactDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { contactsService } from '../../api';
import { useNotification } from '../../context/NotificationContext';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';

const ContactDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const showEditModal = searchParams.get('edit') === 'true';
  
  const [contact, setContact] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEdit, setShowEdit] = useState(showEditModal);
  const [editContact, setEditContact] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company_name: '',
    address: ''
  });
  
  const notification = useNotification();

  // Fetch contact details
  useEffect(() => {
    const fetchContact = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await contactsService.getContact(id);
        setContact(data);
        
        // Initialize edit form with current values
        setEditContact({
          first_name: data.first_name?.Valid ? data.first_name.String : '',
          last_name: data.last_name?.Valid ? data.last_name.String : '',
          email: data.email?.Valid ? data.email.String : '',
          phone: data.phone?.Valid ? data.phone.String : '',
          company_name: data.company_name?.Valid ? data.company_name.String : '',
          address: data.address?.Valid ? data.address.String : ''
        });
      } catch (err) {
        console.error(`Error fetching contact ${id}:`, err);
        setError('Failed to load contact details. Please try again later.');
        notification.showError('Error', 'Failed to load contact details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContact();
  }, [id, notification]);

  const handleDeleteContact = async () => {
    try {
      setIsLoading(true);
      await contactsService.deleteContact(id);
      notification.showSuccess('Success', 'Contact deleted successfully');
      navigate('/contacts');
    } catch (err) {
      console.error(`Error deleting contact ${id}:`, err);
      notification.showError('Error', 'Failed to delete contact');
      setIsLoading(false);
    }
  };

  const handleUpdateContact = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      const contactData = {
        id: parseInt(id),
        first_name: editContact.first_name,
        last_name: editContact.last_name,
        email: editContact.email,
        phone: editContact.phone,
        company_name: editContact.company_name,
        address: editContact.address
      };
      
      const updatedContact = await contactsService.updateContact(id, contactData);
      setContact(updatedContact);
      setShowEdit(false);
      navigate(`/contacts/${id}`);
      notification.showSuccess('Success', 'Contact updated successfully');
    } catch (err) {
      console.error(`Error updating contact ${id}:`, err);
      notification.showError('Error', 'Failed to update contact');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCancel = () => {
    setShowEdit(false);
    navigate(`/contacts/${id}`);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditContact({ ...editContact, [name]: value });
  };

  const handleStartConversation = () => {
    // Navigate to the conversations page with the selected contact
    navigate(`/conversations?action=new&contact_id=${id}`);
  };

  const handleScheduleMeeting = () => {
    // Navigate to the meetings page with the selected contact
    navigate(`/meetings?action=new&contact_id=${id}`);
  };

  const handleAddToProject = () => {
    // Navigate to the projects page with add contact action
    navigate(`/projects?action=add_contact&contact_id=${id}`);
  };

  if (isLoading && !contact) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
        <p className="font-bold">Error</p>
        <p>{error}</p>
        <button
          onClick={() => navigate('/contacts')}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Back to Contacts
        </button>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
        <p className="font-bold">Not Found</p>
        <p>Contact not found. It may have been deleted or you don't have access.</p>
        <button
          onClick={() => navigate('/contacts')}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Contacts
        </button>
      </div>
    );
  }

  const fullName = `${contact.first_name?.Valid ? contact.first_name.String : ''} ${contact.last_name?.Valid ? contact.last_name.String : ''}`.trim();

  return (
    <div className="space-y-6">
      {isLoading && <Spinner fullPage />}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{fullName}</h1>
          {contact.company_name?.Valid && (
            <p className="text-gray-600">{contact.company_name.String}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowEdit(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
          <button
            onClick={() => navigate('/contacts')}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Back
          </button>
        </div>
      </div>

      {/* Contact Details */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <div className="mt-1">{contact.email?.Valid ? contact.email.String : '-'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Phone</label>
                  <div className="mt-1">{contact.phone?.Valid ? contact.phone.String : '-'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Company</label>
                  <div className="mt-1">{contact.company_name?.Valid ? contact.company_name.String : '-'}</div>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-4">Additional Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Address</label>
                  <div className="mt-1">{contact.address?.Valid ? contact.address.String : '-'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Created</label>
                  <div className="mt-1">{new Date(contact.created_at).toLocaleDateString()}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Updated</label>
                  <div className="mt-1">{new Date(contact.updated_at).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={handleStartConversation}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Start Conversation
            </button>
            <button 
              onClick={handleScheduleMeeting}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Schedule Meeting
            </button>
            <button 
              onClick={handleAddToProject}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Add to Project
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity or Related Information Placeholder */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="p-4 border border-gray-200 rounded bg-gray-50 text-gray-500 text-center">
          Recent activity with this contact will appear here once available.
        </div>
      </div>

      {/* Edit Contact Modal */}
      <Modal
        isOpen={showEdit}
        onClose={handleEditCancel}
        title="Edit Contact"
        size="lg"
      >
        <form onSubmit={handleUpdateContact}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                name="first_name"
                value={editContact.first_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={editContact.last_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={editContact.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                name="phone"
                value={editContact.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input
                type="text"
                name="company_name"
                value={editContact.company_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                name="address"
                value={editContact.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleEditCancel}
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
            Are you sure you want to delete contact{' '}
            <span className="font-semibold">{fullName}</span>? This action cannot be undone.
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
              onClick={handleDeleteContact}
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

export default ContactDetail;