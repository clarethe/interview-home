import Papa from 'papaparse';
import { api } from '../api';
import { QueryClient } from '@tanstack/react-query';
import { Lead } from '../types';
import { Dispatch, SetStateAction } from 'react';

export const handleImport = (file: File, queryClient: QueryClient) => {
  Papa.parse(file, {
    header: true,
    complete: (results) => {
      const validLeads = (results.data as any[]).filter((lead: any) =>
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

export const handleDeleteSelected = async (selectedLeads: number[], setSelectedLeads: Dispatch<SetStateAction<number[]>>, queryClient: QueryClient) => {
  try {
    console.log(`Attempting to delete leads with IDs: ${selectedLeads}`);
    const objectIds = { ids: selectedLeads };
    await api.leads.deleteMany(objectIds);
    queryClient.invalidateQueries({ queryKey: ['leads', 'getMany'] });
    setSelectedLeads([]);
    console.log('Deletion successful!');
  } catch (error) {
    console.error('Error deleting leads:', error);
  }
};

export const handleDelete = async (leadId: number, queryClient: QueryClient) => {
  try {
    console.log(`Attempting to delete lead with ID: ${leadId}`);
    await api.leads.delete({ id: leadId });
    queryClient.invalidateQueries({ queryKey: ['leads', 'getMany'] });
    console.log('Deletion successful!');
  } catch (error) {
    console.error('Error deleting lead:', error);
  }
};

export const handleGenerateMessage = (lead: any, setEditableMessage: (message: string) => void, setCurrentLead: (lead: Lead | null) => void, setIsModalOpen: (open: boolean) => void) => {
  const message = `Hello ${lead.firstName} ${lead.lastName},\n\nWe would love to learn more about how you are doing at ${lead.companyName} and if you would be interested in new job opportunities.`;
  setEditableMessage(message);
  setCurrentLead(lead);
  setIsModalOpen(true);
};

export const handleSaveMessage = async (currentLead: Lead | null, editableMessage: string, queryClient: QueryClient, setIsModalOpen: (open: boolean) => void) => {
  if (currentLead) {
    try {
      console.log(`Attempting to update lead with ID: ${currentLead.id}`);
      await api.leads.update({
        id: currentLead.id,
        message: editableMessage
      });
      queryClient.invalidateQueries({ queryKey: ['leads', 'getMany'] });
      console.log('Update successful!');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  }
};

export const handleGuessGender = (leadId: number, firstName: string, mutation: any) => {
  mutation.mutate({ leadId, firstName });
};
