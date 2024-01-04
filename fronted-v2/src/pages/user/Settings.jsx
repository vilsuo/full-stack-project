import { useOutletContext } from 'react-router-dom';

import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { changePotrait, removePotrait } from '../../reducers/auth';
import ErrorAlert from '../../components/ErrorAlert';

const FileInput = ({ upload }) => {
  const [file, setFile] = useState();
  const inputRef = useRef();

  const handleUpload = async () => {
    if (file) {
      const formData = new FormData();
      formData.append('image', file, file.name);

      await upload(formData);
      handleReset();
    }
  };

  const handleFileChange = (event) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleReset = () => {
    setFile(null);
    inputRef.current.value = '';
  };

  return (
    <div>
      <div>
        <input 
          type='file'
          ref={inputRef}
          onChange={handleFileChange}
        />
        <button type='close-btn' disabled={!file} onClick={handleReset}>×</button>
      </div>

      <button disabled={!file} onClick={handleUpload}>Upload</button>
    </div>
  );
};

const PotraitSettings = ({ user }) => {
  const potrait = useSelector(state => state.auth.potrait);
  const dispatch = useDispatch();

  const [message, setMessage] = useState('');

  const handleUpload  = async (formData) => {
    try {
      await dispatch(changePotrait(formData)).unwrap();
    } catch (error) {
      const errorMessage = error.message || error;
      setMessage(`Potrait upload failed: ${errorMessage}.`);
    }
  };

  const handleRemove  = async (formData) => {
    try {
      await dispatch(removePotrait()).unwrap();
    } catch (error) {
      const errorMessage = error.message || error;
      setMessage(`Removing potrait failed: ${errorMessage}.`);
    }
  };

  return (
    <div>
      <ErrorAlert message={message} clearMessage={() => setMessage('')} />

      <p>Change potrait</p>
      <FileInput upload={handleUpload} />

      <p>Remove potrait</p>
      <button disabled={!potrait} onClick={handleRemove}>Remove</button>
    </div>
  );
};

const Settings = () => {
  const { user, authenticatedUser } = useOutletContext();

  return (
    <div className='settings'>
      <h3>Settings</h3>

      <PotraitSettings user={user} />
    </div>
  );
};

export default Settings;