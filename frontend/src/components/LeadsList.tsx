import  { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

interface ApiError {
  response?: {
    data: any;
    status: number;
    headers: any;
  };
  request?: any;
  message: string;
}

export const LeadsList = () => {
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const queryClient = useQueryClient();

  const leads = useQuery({
    queryKey: ['leads', 'getMany'],
    queryFn: async () => api.leads.getMany(),
  });
 
  const handleSelectLead = (leadId: number) => {
    setSelectedLeads((prevSelected) =>

      prevSelected.includes(leadId)
        ? prevSelected.filter((id) => id !== leadId)
        : [...prevSelected, leadId]
    );
  };

  const handleDeleteSelected = async () => {
    try {
      console.log(`Attempting to delete leads with IDs: ${selectedLeads}`);
      const objectIds = { ids: selectedLeads };
    
      await api.leads.deleteMany(objectIds);
      queryClient.invalidateQueries({ queryKey: ['leads', 'getMany'] });
      console.log('Deletion successful!');
      setSelectedLeads([]);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error deleting leads:', apiError);
      console.error('Full error object:', error);
      if (apiError.response) {
        console.error('Response data:', apiError.response.data);
        console.error('Response status:', apiError.response.status);
        console.error('Response headers:', apiError.response.headers);
      } else if (apiError.request) {
        console.error('Request data:', apiError.request);
      } else {
        console.error('Error message:', apiError.message);
      }
    }
  };

  const handleDelete = async (leadId: number) => {
    try {
      console.log(`Attempting to delete lead with ID: ${leadId}`);
      await api.leads.delete({ id: leadId });
      queryClient.invalidateQueries({ queryKey: ['leads', 'getMany'] });
      console.log('Deletion successful!');
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error deleting lead:', apiError);
      console.error('Full error object:', error);
      if (apiError.response) {
        console.error('Response data:', apiError.response.data);
        console.error('Response status:', apiError.response.status);
        console.error('Response headers:', apiError.response.headers);
      } else if (apiError.request) {
        console.error('Request data:', apiError.request);
      } else {
        console.error('Error message:', apiError.message);
      }
    }
  };

  if (leads.isLoading) return <div>Loading...</div>;
  if (leads.isError) return <div>Error: {leads.error.message}</div>;

  return (
  <div>
    <h2 className="lead-list-title">All leads</h2>
    <p>
      <code>POST</code> <code>/leads</code>
    </p>
    <div> 
      <span> {selectedLeads.length} selected</span> 
      <button onClick={handleDeleteSelected} disabled={selectedLeads.length === 0}>
        Delete Selected
      </button>
    </div>
    <table className="lead-table">
      <thead>
        <tr>
          <th>Select</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Country</th>
          <th>Job Position</th>
          <th>Email</th>
          <th>Created At</th>
          <th>Updated At</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {leads.data?.map((lead) => (
          <tr key={lead.id}>
            <td>
              <input
                type="checkbox"
                checked={selectedLeads.includes(lead.id)}
                onChange={() => handleSelectLead(lead.id)}
              />
             </td>
              <td>{lead.firstName}</td>
              <td>{lead.lastName}</td>
              <td>{lead.countryCode}</td>
              <td>{lead.jobTitle}</td>
              <td>{lead.email}</td>
              <td>{new Date(lead.createdAt).toLocaleString()}</td>
              <td>{new Date(lead.updatedAt).toLocaleString()}</td>
              <td>
                <button>Edit</button>
                <button onClick={() => handleDelete(lead.id)}>Delete</button>
              </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
};

