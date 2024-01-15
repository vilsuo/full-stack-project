import { useLoaderData, useOutletContext } from 'react-router-dom';

import imagesService from '../../services/images';
import { useRef, useState } from 'react';
import { createErrorMessage } from '../../util/error';
import Alert from '../../components/Alert';

export const imageLoader = async ({ params }) => {
  const { username } = params;

  return await imagesService.getImages(username);
};

const IMAGE_PUBLIC = { value: 'public', label: 'Public' };
const IMAGE_PRIVATE = { value: 'private', label: 'Private' };
const IMAGE_PRIVACIES = [IMAGE_PUBLIC, IMAGE_PRIVATE];

const ImageForm = ({ authenticatedUser }) => {

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

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('caption', caption);
      formData.append('privacy', privacy);
      formData.append('image', file, file.name);

      const image = await imagesService.createImage(authenticatedUser.username, formData);

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
            { file && <button className='close-btn' onClick={handleFormReset} /> }
          </div>
        </div>

        <button>Submit</button>
      </form>
    </div>
  );
};

const Profile = () => {
  const { user, authenticatedUser } = useOutletContext();
  const images = useLoaderData();

  return (
    <div className='profile'>
      <h3>Profile of {user.username}</h3>

      { authenticatedUser && (authenticatedUser.id === user.id) && <p>Own page</p> }

      <ImageForm authenticatedUser={authenticatedUser} />

      <h4>Images</h4>
      <ul>
        {images.map(image => 
          <li key={image.id}>
            {image.title}, privacy: {image.privacy}
          </li>
        )}
      </ul>
    </div>
  );
};

export default Profile;