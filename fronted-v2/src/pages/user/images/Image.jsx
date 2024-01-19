import { useEffect, useState } from 'react';
import { NavLink, useLoaderData, useNavigate, useOutletContext } from 'react-router-dom';

import util from '../../../util';
import imagesService from '../../../services/images';

import ToggleButton from '../../../components/ToggleButton';

import { FaArrowLeft, FaEdit, FaTrash } from 'react-icons/fa';
import { IconContext } from 'react-icons';

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
        console.log('image removed', image);
        
        navigate(`/users/${user.username}/images`, { replace: true });
  
      } catch (error) {
        console.log('error removing image', error);
      }
    }
  };

  const { title, caption, privacy, createdAt, updatedAt } = image;

  return (
    <div className='container'>
      <div className='image'>

        <div className='image-actions'>
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

        <h3>{title}</h3>

        <img src={imageUrl}/>

        <div className='image-info'>
          <div className='chip'>Image by {user.username}</div>
          <div className='chip'>Created {util.formatDate(createdAt)}</div>
          { (createdAt !== updatedAt) && 
            <div className='chip'>Last edited {util.formatDate(updatedAt)}</div>
          }
          <div className='chip'>{privacy}</div>
        </div>
      </div>

      <p className='text'>{caption}</p>
    </div>
  );
};

export default Image;