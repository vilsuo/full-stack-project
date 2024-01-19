import { useEffect, useState } from 'react';
import { useLoaderData, useNavigate, useOutletContext } from 'react-router-dom';

import imagesService from '../../../services/images';

import ToggleButton from '../../../components/ToggleButton';

import { FaEdit, FaTrash } from 'react-icons/fa';
import { IconContext } from 'react-icons';
import ImageChips from '../../../components/images/ImageChips';
import Alert from '../../../components/Alert';
import { createErrorMessage } from '../../../util/error';

export const imageContentLoader = async ({ params }) => {
  const { username, imageId } = params;
  const image = await imagesService.getImage(username, imageId);
  const content = await imagesService.getImageContent(username, imageId);

  return { image, content };
};

const Image = () => {
  const { user, authenticatedUser } = useOutletContext();
  const { image, content } = useLoaderData();
  const [imageUrl, setImageUrl] = useState();

  const [editing, setEditing] = useState(false);

  const [alert, setAlert] = useState({});
  const clearAlert = () => setAlert({});

  const navigate = useNavigate();

  useEffect(() => {
    if (content) setImageUrl(URL.createObjectURL(content));

    return () => { if (imageUrl) URL.revokeObjectURL(imageUrl); }
  }, []);

  const canEdit = authenticatedUser && (authenticatedUser.id === image.userId);

  const handleRemove = async (image) => {
    if (confirm('Are you sure you want to delete the image?')) {
      try {
        await imagesService.deleteImage(user.username, image.id);
        navigate(`/users/${user.username}/images`, { replace: true });
  
      } catch (error) {
        setAlert({
          type: 'error',
          prefix: 'Removing image failed',
          details: createErrorMessage(error),
        });
      }
    }
  };

  const { title, caption, privacy, createdAt, updatedAt } = image;

  return (
    <div className='container'>

      <div className='edit-actions'>
        { canEdit && (
          <ToggleButton toggled={editing} setToggled={setEditing}>
            {<FaEdit  />}
          </ToggleButton>
        )}

        { editing && (
          <button className='action-button' onClick={ () => handleRemove(image) }>
            <IconContext.Provider value={{ size: '15px' }}>
              <div>
                <FaTrash />
              </div>
            </IconContext.Provider>
          </button>
        )}
      </div>

      <Alert alert={alert} clearAlert={clearAlert} />

      <div className='image'>
        <h2>{title}</h2>

        <img src={imageUrl}/>

        { !editing && <ImageChips user={user} image={image} /> }

        <p className='text'>{caption}</p>
      </div>
    </div>
  );
};

export default Image;