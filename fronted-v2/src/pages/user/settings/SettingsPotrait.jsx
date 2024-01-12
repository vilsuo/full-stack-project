import { useRef, useState } from 'react';
import ErrorAlert from '../../../components/ErrorAlert';
import { changePotrait, removePotrait } from '../../../reducers/auth';
import { useDispatch, useSelector } from 'react-redux';

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
    <div className='file-input'>
      <div>
        <input 
          type='file'
          ref={inputRef}
          onChange={handleFileChange}
        />
        { file && <button className='close-btn' onClick={handleReset} /> }
      </div>
      <button disabled={!file} onClick={handleUpload}>Upload</button>
    </div>
  );
};

const SettingsPotrait = () => {
  const potrait = useSelector(state => state.auth.potrait);
  const dispatch = useDispatch();

  const [message, setMessage] = useState('');

  const handleUpload  = async (formData) => {
    try {
      await dispatch(changePotrait(formData)).unwrap();
    } catch (error) {
      setMessage(`Potrait upload failed: ${error}.`);
    }
  };

  const handleRemove  = async (formData) => {
    try {
      await dispatch(removePotrait()).unwrap();
    } catch (error) {
      setMessage(`Removing potrait failed: ${error}.`);
    }
  };

  return (
    <div className='container'>
      <ErrorAlert message={message} clearMessage={() => setMessage('')} />

      <div>
        <p>Change potrait</p>
        <FileInput upload={handleUpload} />
      </div>

      { potrait && <div>
        <p>Remove potrait</p>
        <button onClick={handleRemove}>Remove</button>
      </div>}
    </div>
  );
};

export default SettingsPotrait;