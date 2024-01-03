import { useOutletContext } from 'react-router-dom';

import potraitService from '../../services/potrait';
import { useRef, useState } from 'react';

const FileInput = ({ upload }) => {
  const [file, setFile] = useState();
  const inputRef = useRef();

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('image', file, file.name);

    await upload(formData);
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
      <div className=''>
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

  const handleUpload  = async (formData) => {
    const created = await potraitService.putPotrait(user.username, formData);

    console.log('created', created);
  };

  return (
    <div>
      <p>Change potrait</p>
      <FileInput upload={handleUpload} />
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