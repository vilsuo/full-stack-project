import { useRef, useState } from 'react';
import { changePotrait, removePotrait } from '../../../reducers/auth';
import { useDispatch, useSelector } from 'react-redux';
import Alert from '../../../components/Alert';

const SettingsPotrait = () => {
  const potrait = useSelector(state => state.auth.potrait);
  const dispatch = useDispatch();

  const [alert, setAlert] = useState({});

  // file
  const [file, setFile] = useState();
  const inputRef = useRef();

  const clearAlert = () => setAlert({});

  const handleReset = () => {
    setFile(null);
    inputRef.current.value = '';
  };

  const handleFileChange = (event) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload  = async () => {
    try {
      const formData = new FormData();
      formData.append('image', file, file.name);

      await dispatch(changePotrait(formData)).unwrap();
      setAlert({
        type: 'success',
        prefix: 'Potrait uploaded'
      });
      handleReset();
    } catch (rejectedValueError) {
      setAlert({
        type: 'error',
        prefix: 'Potrait upload failed',
        details: rejectedValueError,
      });
    }
  };

  const handleRemove  = async () => {
    try {
      await dispatch(removePotrait()).unwrap();
      setAlert({
        type: 'success',
        prefix: 'Potrait removed'
      });
    } catch (rejectedValueError) {
      setAlert({
        type: 'error',
        prefix: 'Removing potrait failed',
        details: rejectedValueError,
      });
    }
  };

  return (
    <div className='container'>
      <Alert alert={alert} clearAlert={clearAlert} />

      {/* uploading the potrait */}
      <div>
        <h3>Change potrait</h3>
        <p>Changing the potrait will <strong>delete</strong> the current potrait if it exists.</p>

        <div>
          <div className='file-input'>
            <input 
              type='file'
              ref={inputRef}
              onChange={handleFileChange}
            />
            { file && <button className='close-btn' onClick={handleReset} /> }
          </div>

          <button disabled={!file} onClick={handleUpload}>Upload</button>
        </div>
      </div>

      {/* removing the potrait */}
      { potrait && <div>
        <h3>Remove potrait</h3>
        <p>The potrait will be deleted <strong>permanently!</strong></p>
        <button onClick={handleRemove}>Remove</button>
      </div>}
    </div>
  );
};

export default SettingsPotrait;