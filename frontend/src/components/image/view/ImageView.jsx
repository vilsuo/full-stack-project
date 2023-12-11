import { useEffect, useState } from 'react';
import usersService from '../../../services/users';
import { useNavigate } from 'react-router-dom';

import ImageUpload from '../upload/ImageUpload';
import ImageList from './ImageList';

/*
TODO
- split to multiple files: image posting to its own & image viewing/editing to its own
- add hower listener to Image
- add sorting
- show tag on private images
- implement editing/deleting
*/

const ImageView = ({ pageUsername, isOwnPage }) => {
  const [images, setImages] = useState([]);

  const navigate = useNavigate();

  // load users images
  useEffect(() => {
    const fetch = async () => {
      try {
        const returnedImages = await usersService.getImages(pageUsername);
        setImages(returnedImages);

      } catch (error) {
        const message = error.response.data.message;
        navigate('/error', { state: { message } });
      }
    };

    fetch();
  }, [pageUsername]);

  const addImage = async (formData) => {
    const addedImage = await usersService.addImage(pageUsername, formData);
    setImages([ ...images, addedImage ]);
  };

  const deleteImage = async (imageId) => {
    await usersService.deleteImage(pageUsername, imageId);

    const filteredImages = images.filter(image => image.id !== imageId);
    setImages(filteredImages);
  };

  if (!images) {
    return null;
  }

  return (
    <>
      { isOwnPage && <ImageUpload pageUsername={pageUsername} addImage={addImage} /> }

      <ImageList
        username={pageUsername}
        images={images}
        canModify={isOwnPage}
        deleteImage={deleteImage}
      />
    </>
  );
};

export default ImageView;