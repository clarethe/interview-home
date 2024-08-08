import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import EditMessageModal from './modals/EditMessageModal';
import ImportCSVModal from './modals/ImportCSVModal';
import { handleGuessGender, handleImport, handleDelete, handleDeleteSelected, handleGenerateMessage, handleSaveMessage } from '../utils/leadHandlers'
import { Lead } from '../types';

export const LeadsList = () => {
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editableMessage, setEditableMessage] = useState<string>('');
  const [currentLead, setCurrentLead] = useState<Lead | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const leads = useQuery({
    queryKey: ['leads', 'getMany'],
    queryFn: async () => api.leads.getMany(),
  });

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

  if (leads.isLoading) return <div>Loading...</div>;
  if (leads.isError) return <div>Error: {leads.error.message}</div>;

  return (
    <div>
      <div>
        <span> {selectedLeads.length} selected</span> 
        <button onClick={() => handleDeleteSelected(selectedLeads, queryClient)} disabled={selectedLeads.length === 0}>
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
                  onChange={() => setSelectedLeads(prev => prev.includes(lead.id) ? prev.filter(id => id !== lead.id) : [...prev, lead.id])}
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
                <button onClick={() => handleDelete(lead.id, queryClient)}>Delete</button>
                <button onClick={() => handleGenerateMessage(lead, setEditableMessage, setCurrentLead, setIsModalOpen)}>Generate Message</button>
                <button onClick={() => handleGuessGender(lead.id, lead.firstName, guessGenderMutation)}>Guess Gender</button>
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
        handleSaveMessage={() => handleSaveMessage(currentLead, editableMessage, queryClient, setIsModalOpen)}
      />
      <ImportCSVModal
        isOpen={isImportModalOpen}
        onRequestClose={() => setIsImportModalOpen(false)}
        handleImport={(file) => handleImport(file, queryClient)}
      />
    </div>
  );
};
