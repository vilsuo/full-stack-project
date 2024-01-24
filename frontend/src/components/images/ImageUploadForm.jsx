import { useRef, useState } from 'react';
import { IMAGE_PRIVACIES, IMAGE_PUBLIC } from '../../constants';
import { createErrorMessage } from '../../util/error';
import imagesService from '../../services/images';
import Alert from '../Alert';
import RadioGroup from '../RadioGroup';

const ImageUploadForm = ({ user, addImage }) => {
  const [loading, setLoading] = useState(false);

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

    if (loading) return null;
    setLoading(true);

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
      setAlert({
        type: 'error',
        prefix: 'Image upload failed',
        details: createErrorMessage(error),
      });
    }

    setLoading(false);
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

        <RadioGroup
          options={IMAGE_PRIVACIES}
          value={privacy}
          setValue={setPrivacy}
          optionName={'Privacy'}
        />

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
