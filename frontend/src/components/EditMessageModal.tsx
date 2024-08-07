import React from 'react';
import Modal from 'react-modal';

interface EditMessageModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  editableMessage: string;
  setEditableMessage: (message: string) => void;
  handleSaveMessage: () => void;
}

const EditMessageModal: React.FC<EditMessageModalProps> = ({
  isOpen,
  onRequestClose,
  editableMessage,
  setEditableMessage,
  handleSaveMessage,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Edit Message"
    >
      <h2>Edit Message</h2>
      <textarea
        value={editableMessage}
        onChange={(e) => setEditableMessage(e.target.value)}
      />
      <button onClick={handleSaveMessage}>Save</button>
      <button onClick={onRequestClose}>Cancel</button>
    </Modal>
  );
};

export default EditMessageModal;