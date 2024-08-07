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
      ariaHideApp={false} 
    >
      <h2>Edit Message</h2>
      <textarea
        value={editableMessage}
        onChange={(e) => setEditableMessage(e.target.value)}
        rows={10}
        cols={50}
      />
      <div>
        <button onClick={handleSaveMessage}>Save</button>
        <button onClick={onRequestClose}>Cancel</button>
      </div>
    </Modal>
  );
};

export default EditMessageModal;
