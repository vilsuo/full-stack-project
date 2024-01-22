import { useLoaderData, useOutletContext } from 'react-router-dom';

import imagesService from '../../../services/images';
import { useEffect, useState } from 'react';
import ImageUploadForm from '../../../components/images/ImageUploadForm';
import ImageList from '../../../components/images/ImageList';

export const imagesLoader = async ({ params }) => {
  const { username } = params;
  return await imagesService.getImages(username);
};

const Images = () => {
  const { user, authenticatedUser } = useOutletContext();
  const [images, setImages] = useState([]);

  const loadedImages = useLoaderData();
  
  useEffect(() => {
    setImages(loadedImages);
  }, [loadedImages]);

  const addImage = image => setImages([ ...images, image ]);

  const isOwnPage = authenticatedUser && (authenticatedUser.id === user.id);

  return (
    <div>
      <ImageList
        user={user}
        images={images}
        showExtra={isOwnPage}
      />
      
      { isOwnPage && (
        <ImageUploadForm user={user} addImage={addImage} />
      )}
    </div>
  );
};

export default Images;