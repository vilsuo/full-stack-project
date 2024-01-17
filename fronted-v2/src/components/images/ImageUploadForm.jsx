import { useRef, useState } from 'react';
import { IMAGE_PRIVACIES, IMAGE_PUBLIC } from '../../constants';
import { createErrorMessage } from '../../util/error';
import imagesService from '../../services/images';
import Alert from '../Alert';

const ImageUploadForm = ({ user, addImage }) => {

  // alert
  const [alert, setAlert] = useState({});
  const clearAlert = () => setAlert({});

  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [privacy, setPrivacy] = useState(IMAGE_PUBLIC.value);

  // file
  const [file, setFile] = useState();
  const inputRef = useRef();

  const handleFormReset = () => {
    setTitle('');
    setCaption('');
    // do not reset privacy

    handleFileReset();
  };

  const handleFileReset = () => {
    setFile(null);
    inputRef.current.value = '';
  };

  const handleFileChange = (event) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit  = async (event) => {
    event.preventDefault();
    const { username } = user;

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('caption', caption);
      formData.append('privacy', privacy);
      formData.append('image', file, file.name);

      const image = await imagesService.createImage(username, formData);
      addImage(image);

      setAlert({
        type: 'success',
        prefix: 'Image uploaded'
      });
      handleFormReset();

    } catch (error) {
      console.log('error uploading', error)
      setAlert({
        type: 'error',
        prefix: 'Image upload failed',
        details: createErrorMessage(error),
      });
    }
  };

  return (
    <div className='container'>
      <h3>Upload Image</h3>

      <Alert alert={alert} clearAlert={clearAlert} />

      <form method='post' onSubmit={handleSubmit}>
        <label>
          <span>Title:</span>
          <input
            type='text'
            value={title}
            onChange={ ({ target }) => setTitle(target.value) }
          />
        </label>

        <label>
          <span>Caption:</span>
          <textarea
            value={caption}
            onChange={ ({ target }) => setCaption(target.value) }
          />
        </label>

        <label>
          <span>Privacy:</span>
          <div className='radio-group'>
            {IMAGE_PRIVACIES.map(option => (
              <div key={`privacy-${option.value}`} className='radio'>
                  <input
                    type='radio'
                    name='privacy'
                    value={option.value}
                    id={`radio-privacy-${option.value}`}
                    checked={privacy === option.value}
                    onChange={ ({ target}) => setPrivacy(target.value) }
                  />
                  <label htmlFor={`radio-privacy-${option.value}`}>{option.label}</label>
              </div>
              ))}
          </div>
        </label>

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

        <button disabled={!file}>Upload</button>
      </form>
    </div>
  );
};

export default ImageUploadForm;
