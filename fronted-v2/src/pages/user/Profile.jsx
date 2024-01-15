import { useLoaderData, useNavigate, useOutletContext } from 'react-router-dom';

import imagesService from '../../services/images';
import util from '../../util';
import { useEffect, useRef, useState } from 'react';
import { createErrorMessage } from '../../util/error';
import Alert from '../../components/Alert';

import { FaLock } from 'react-icons/fa';

export const imageLoader = async ({ params }) => {
  const { username } = params;
  return await imagesService.getImages(username);
};

const IMAGE_PUBLIC = { value: 'public', label: 'Public' };
const IMAGE_PRIVATE = { value: 'private', label: 'Private' };
const IMAGE_PRIVACIES = [IMAGE_PUBLIC, IMAGE_PRIVATE];

const ImageForm = ({ user, addImage }) => {

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

        <button>Submit</button>
      </form>
    </div>
  );
};

const FilterGroup = ({ filter, setFilter }) => {

  const FilterOptions = [
    { 'value': 'none', 'label': 'All' },
    ...IMAGE_PRIVACIES,
  ];

  return (
    <label>
      <span>Filter:</span>
      <div className='radio-group'>
        {FilterOptions.map(option => (
          <div key={`filter-privacy-${option.value}`} className='radio'>
              <input
                type='radio'
                name='filter'
                value={option.value}
                id={`radio-filter-privacy-${option.value}`}
                checked={filter === option.value}
                onChange={ ({ target}) => setFilter(target.value) }
              />
              <label htmlFor={`radio-filter-privacy-${option.value}`}>{option.label}</label>
          </div>
          ))}
      </div>
    </label>
  );
};

const ImageList = ({ user, images, showExtra }) => {
  const [filter, setFilter] = useState('none');

  const navigate = useNavigate();

  const handleClick = (image) => {
    const { username } = user;
    navigate(`/users/${username}/images/${image.id}`);
  };

  return (
    <div className='container'>
      <h4>Images</h4>

      { showExtra && <FilterGroup filter={filter} setFilter={setFilter} /> }

      <table className='image-table navigable'>
        <thead>
          <tr>
            { showExtra && <th className='icon'></th> }
            <th className='title'>Title</th>
            <th className='date'>Created</th>
          </tr>
        </thead>
        <tbody>
          {images
            .filter(image => (filter === 'none') ? true : image.privacy === filter)
            .map(image => (
              <tr key={image.id} onClick={() => handleClick(image)}>
                { showExtra && <td className='table-icon icon'>
                  { image.privacy === IMAGE_PRIVATE.value && <FaLock /> }
                </td> }
                <td className='title'>{image.title}</td>
                <td className='date'>{util.formatDate(image.createdAt)}</td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
};

const Profile = () => {
  const { user, authenticatedUser } = useOutletContext();
  const [images, setImages] = useState([]);

  const loadedImages = useLoaderData();
  useEffect(() => {
    setImages(loadedImages);
  }, [loadedImages]);

  const addImage = image => setImages([ ...images, image ]);

  const isOwnPage = authenticatedUser && (authenticatedUser.id === user.id);

  return (
    <div className='profile'>
      <h3>Profile of {user.username}</h3>

      { isOwnPage && (
        <ImageForm user={user} addImage={addImage} />
      )}

      <ImageList user={user} images={images} showExtra={isOwnPage} />
    </div>
  );
};

export default Profile;