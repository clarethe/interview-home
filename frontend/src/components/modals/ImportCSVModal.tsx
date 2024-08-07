import React, { useState, ChangeEvent } from 'react';
import Modal from 'react-modal';

interface ImportCSVModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  handleImport: (file: File) => void;
}

const ImportCSVModal: React.FC<ImportCSVModalProps> = ({ isOpen, onRequestClose, handleImport }) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (file) {
      handleImport(file);
      onRequestClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      <h2>Import Leads from CSV</h2>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button onClick={handleSubmit}>Import</button>
      <button onClick={onRequestClose}>Cancel</button>
    </Modal>
  );
};

export default ImportCSVModal;
