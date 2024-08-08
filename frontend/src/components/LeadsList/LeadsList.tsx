import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';
import EditMessageModal from '../modals/EditMessageModal/EditMessageModal';
import ImportCSVModal from '../modals/ImportCSVModal/ImportCSVModal';
import { handleGuessGender, handleImport, handleDelete, handleDeleteSelected, handleGenerateMessage, handleSaveMessage } from '../../utils/leadHandlers';
import { Lead } from '../../types';
import './leadList.scss';

export const LeadsList = () => {
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
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
    <div className="lead-table-container">
      <div className="button-container">
        <span>{selectedLeads.length} selected</span>
        <button onClick={() => handleDeleteSelected(selectedLeads, queryClient)} disabled={selectedLeads.length === 0}>
          Delete Selected
        </button>
        <button onClick={() => setIsImportModalOpen(true)}>
          Import from CSV
        </button>
      </div>
      <div className="table-wrapper">
        <table className="lead-table">
          <thead>
            <tr>
              <th className="th-select"></th>
              <th className="th-first-name">Name</th>
              <th className="th-last-name">Last Name</th>
              <th className="th-gender">Gender</th>
              <th className="th-country">Country</th>
              <th className="th-job-position">Job Position</th>
              <th className="th-email">Email</th>
              <th className="th-message">Message</th>
              <th className="th-created-at">Created At</th>
              <th className="th-updated-at">Updated At</th>
              <th className="th-action-delete"></th>
              <th className="th-action-generate"></th>
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
                    style={{
                      cursor: 'pointer',
                      width: '23px',
                      height: '17px',
                      marginTop: '6px'
                    }}
                  />
                </td>
                <td className="td-first-name">{lead.firstName}</td>
                <td className="td-last-name">{lead.lastName}</td>
                <td className="td-gender">{lead.gender || ''}</td>
                <td className="td-country-code">{lead.countryCode}</td>
                <td className="td-job-title">{lead.jobTitle}</td>
                <td className="td-email">{lead.email}</td>
                <td className="td-message">{lead.message || ''}</td>
                <td className="td-created-at">{new Date(lead.createdAt).toLocaleString()}</td>
                <td className="td-updated-at">{new Date(lead.updatedAt).toLocaleString()}</td>
                <td><button className="btn-delete" onClick={() => handleDelete(lead.id, queryClient)}>Delete</button></td>
                <td><button className="btn-generate-message" onClick={() => handleGenerateMessage(lead, setEditableMessage, setCurrentLead, setIsModalOpen)}>Generate Message ✉️</button>
                <button className="btn-guess-gender" onClick={() => handleGuessGender(lead.id, lead.firstName, guessGenderMutation)}>Guess Gender ⚥</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
