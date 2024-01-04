import { useOutletContext } from 'react-router-dom';

import { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { changePotrait } from '../../reducers/auth';

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
  const dispatch = useDispatch();

  const handleUpload  = async (formData) => {

    dispatch(changePotrait(formData))
      .unwrap()
      .then(potrait => {
        console.log('created potrait', potrait);
      })
      .catch(error => {
        console.log('error changing potrait', error)
      });
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