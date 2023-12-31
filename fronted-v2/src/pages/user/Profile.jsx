import { useLoaderData, useOutletContext } from 'react-router-dom';

import imagesService from '../../services/images';

export const imageLoader = async ({ params }) => {
  const { username } = params;

  return await imagesService.getImages(username);
};

const Profile = () => {
  const { user, authenticatedUser } = useOutletContext();
  const images = useLoaderData();

  return (
    <div className='profile'>
      <h3>Profile of {user.username}</h3>

      { authenticatedUser && (authenticatedUser.id === user.id) && <p>Own page</p> }

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