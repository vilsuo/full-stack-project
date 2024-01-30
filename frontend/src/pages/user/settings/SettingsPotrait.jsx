import { useRef, useState } from 'react';
import { changePotrait, removePotrait } from '../../../reducers/auth';
import { useDispatch, useSelector } from 'react-redux';
import Alert from '../../../components/Alert';

const SettingsPotrait = () => {
  const potrait = useSelector(state => state.auth.potrait);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

  // alert
  const [alert, setAlert] = useState({});
  const clearAlert = () => setAlert({});

  // file
  const [file, setFile] = useState();
  const inputRef = useRef();

  const handleFileReset = () => {
    setFile(null);
    inputRef.current.value = '';
  };

  const handleFileChange = (event) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleFileUpload  = async () => {
    if (loading) return null;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', file, file.name);

      await dispatch(changePotrait(formData)).unwrap();
      setAlert({
        type: 'success',
        prefix: 'Potrait uploaded'
      });
      handleFileReset();
    } catch (rejectedValueError) {
      setAlert({
        type: 'error',
        prefix: 'Potrait upload failed',
        details: rejectedValueError,
      });
    }

    setLoading(false);
  };

  const handlePotraitRemove  = async () => {
    if (loading) return null;
    setLoading(true);

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

    setLoading(false);
  };

  return (
    <div className='settings-potrait-page'>
      <Alert alert={alert} clearAlert={clearAlert} />

      {/* uploading the potrait */}
      <div className='container'>
        <h3>Change Potrait</h3>
        <p>Changing the potrait will <strong>delete</strong> the current potrait if it exists.</p>

        <div>
          <div className='file-input'>
            <label htmlFor=''>Select Image: *</label>
            <div className='resettable'>
              <input 
                type='file'
                ref={inputRef}
                onChange={handleFileChange}
                required
              />
              { file && <button className='close-btn' onClick={handleFileReset} /> }
            </div>
          </div>

          <button disabled={!file} onClick={handleFileUpload}>Upload</button>
        </div>
      </div>

      {/* removing the potrait */}
      { potrait && <div className='container'>
        <h3>Remove Potrait</h3>
        <p>The potrait will be deleted <strong>permanently!</strong></p>
        <button onClick={handlePotraitRemove}>Remove</button>
      </div>}
    </div>
  );
};

export default SettingsPotrait;