import React, { Component } from 'react';
import Modal from 'react-modal';
import './editMessageModal.scss';

interface EditMessageModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  editableMessage: string;
  setEditableMessage: (message: string) => void;
  handleSaveMessage: () => void;
}

interface EditMessageModalState {
  localEditableMessage: string;
}

class EditMessageModal extends Component<EditMessageModalProps, EditMessageModalState> {
  constructor(props: EditMessageModalProps) {
    super(props);
    this.state = {
      localEditableMessage: props.editableMessage,
    };
  }

  componentDidUpdate(prevProps: EditMessageModalProps) {
    if (prevProps.editableMessage !== this.props.editableMessage) {
      this.setState({ localEditableMessage: this.props.editableMessage });
    }
  }

  handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({ localEditableMessage: event.target.value });
    this.props.setEditableMessage(event.target.value);
  };

  handleSave = () => {
    this.props.handleSaveMessage();
  };

  render() {
    const { isOpen, onRequestClose } = this.props;
    const { localEditableMessage } = this.state;

    return (
      <Modal
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        contentLabel="Edit Message"
        ariaHideApp={false}
      >
        <h2>Edit Message</h2>
        <textarea
          value={localEditableMessage}
          onChange={this.handleChange}
          rows={10}
          cols={50}
        />
        <div className='edit-action-buttons'>
          <button className='save-button' onClick={this.handleSave}>Save</button>
          <button className='delete-button' onClick={onRequestClose}>Cancel</button>
        </div>
      </Modal>
    );
  }
}

export default EditMessageModal;
