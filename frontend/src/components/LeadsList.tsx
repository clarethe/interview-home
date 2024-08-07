import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import EditMessageModal from './modals/EditMessageModal';
import Papa from 'papaparse';
import ImportCSVModal from './modals/ImportCSVModal';

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
  const [selectedOption, setSelectedOption] = useState<string>('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editableMessage, setEditableMessage] = useState<string>('');
  const [currentLead, setCurrentLead] = useState<any>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

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

  const guessGenderMutation = useMutation({
    mutationFn: async ({ leadId, firstName }: { leadId: number; firstName: string }) => {
      const response = await api.leads.guessGender({ id: leadId, name: firstName });
      return { leadId, gender: response.gender };
    },
    onSuccess: (data: { leadId: number; gender: string }) => {
      queryClient.setQueryData(['leads', 'getMany'], (oldData: any) => {
        return oldData.map((lead: any) =>
          lead.id === data.leadId ? { ...lead, gender: data.gender } : lead
        );
      });
    },
  });

  const handleImport = (file: File) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {

        const validLeads = (results.data).filter((lead: any) =>
          lead.firstName && lead.lastName && lead.email
        );

        const csvString = Papa.unparse(validLeads);

        api.leads.insertFromCSV({ csvData: csvString })
          .then((response) => {
            console.log('🚀 Leads created successfully', response);
            queryClient.invalidateQueries({ queryKey: ['leads', 'getMany'] });
          })
          .catch((error) => {
            console.error('Error inserting leads:', error);
          });
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
      }
    });
  };

  const handleGuessGender = (leadId: number, firstName: string) => {
    guessGenderMutation.mutate({ leadId, firstName });
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

  const handleGenerateMessage = (lead: any) => {
    const message = `Hello ${lead.firstName} ${lead.lastName},\n\nWe would love to learn more about how you are doing at ${lead.companyName} and if you would be interested in new job opportunities.`;
    setEditableMessage(message);
    setCurrentLead(lead);
    setIsModalOpen(true);
  };

  const handleSaveMessage = async () => {
    if (currentLead) {
      await handleUpdateLeadMessage(currentLead.id, editableMessage);
      setIsModalOpen(false);
    }
  };

  const handleUpdateLeadMessage = async (leadId: number, message: string) => {
    try {
      console.log(`Attempting to update lead with ID: ${leadId}`);
      await api.leads.update({
        id: leadId,
        message: message
      });
      queryClient.invalidateQueries({ queryKey: ['leads', 'getMany'] });
      console.log('Update successful!');
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error updating lead:', apiError);
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
      <div>
      <span> {selectedLeads.length} selected</span> 
        <button onClick={handleDeleteSelected} disabled={selectedLeads.length === 0}>
          Delete Selected
        </button>
        <button onClick={() => setIsImportModalOpen(true)}>
          Import from CSV
        </button>
      </div>
      <div>
        <select
          id="enrich-select"
          value={selectedOption}
           onChange={(e) => setSelectedOption(e.target.value)}
        >
          <option value="" disabled>
            Enrich
          </option>
          <option value="Gender">Gender</option>
          <option value="Message">Message</option>
        </select>
      </div>
      <table className="lead-table">
        <thead>
          <tr>
            <th>Select</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Gender</th>
            <th>Country</th>
            <th>Job Position</th>
            <th>Email</th>
            <th>Message</th>
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
              <td>{lead.gender || ''}</td>
              <td>{lead.countryCode}</td>
              <td>{lead.jobTitle}</td>
              <td>{lead.email}</td>
              <td>{lead.message || ''}</td>
              <td>{new Date(lead.createdAt).toLocaleString()}</td>
              <td>{new Date(lead.updatedAt).toLocaleString()}</td>
              <td>
                <button>Edit</button>
                <button onClick={() => handleDelete(lead.id)}>Delete</button>
                <button onClick={() => handleGenerateMessage(lead)}>Generate Message</button>
                <button onClick={() => handleGuessGender(lead.id, lead.firstName)}>Guess Gender</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <EditMessageModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        editableMessage={editableMessage}
        setEditableMessage={setEditableMessage}
        handleSaveMessage={handleSaveMessage}
      />
      <ImportCSVModal
        isOpen={isImportModalOpen}
        onRequestClose={() => setIsImportModalOpen(false)}
        handleImport={handleImport}
      />
    </div>
  );
};
