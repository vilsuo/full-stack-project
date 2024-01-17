import { useEffect, useState } from 'react';
import { NavLink, useLoaderData, useOutletContext } from 'react-router-dom';

import util from '../../../util';
import imagesService from '../../../services/images';

import { FaArrowLeft, FaWrench } from 'react-icons/fa';

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

  useEffect(() => {
    if (content) setImageUrl(URL.createObjectURL(content));

    return () => { if (imageUrl) URL.revokeObjectURL(imageUrl); }
  }, []);

  const canEdit = authenticatedUser && (authenticatedUser.id === image.userId);

  const { title, caption, privacy, createdAt, updatedAt } = image;

  return (
    <div className='container'>
      <div className='image'>
        <div className='image-info'>
          <button>
            <NavLink to={`/users/${user.username}/images`}>
              <FaArrowLeft />
            </NavLink>
          </button>

          { canEdit && (
            <div className='image-info-end'>
              <button>
                <FaWrench />
              </button>
            </div>
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

      <p>{caption}</p>
    </div>
  );
};

export default Image;