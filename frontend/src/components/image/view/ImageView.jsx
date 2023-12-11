import { useEffect, useState } from 'react';
import usersService from '../../../services/users';
import { useNavigate } from 'react-router-dom';

import ImageUpload from '../upload/ImageUpload';
import ImageList from './ImageList';
import { useSelector } from 'react-redux';

/*
TODO
- split to multiple files: image posting to its own & image viewing/editing to its own
- add hower listener to Image
- add sorting
- show tag on private images
- implement editing/deleting
*/

const ImageView = ({ user }) => {
  const [images, setImages] = useState([]);
  const username = user.username;

  const currentUser = useSelector(state => state.auth.user);
  const canModify = currentUser && (currentUser.id === user.id);

  const navigate = useNavigate();

  // load users images
  useEffect(() => {
    const fetch = async () => {
      try {
        const returnedImages = await usersService.getImages(username);
        setImages(returnedImages);

      } catch (error) {
        const message = error.response.data.message;
        navigate('/error', { state: { message } });
      }
    };

    fetch();
  }, [username]);

  const addImage = async (formData) => {
    const addedImage = await usersService.addImage(username, formData);
    setImages([ ...images, addedImage ]);
  };

  const deleteImage = async (imageId) => {
    await usersService.deleteImage(username, imageId);

    const filteredImages = images.filter(image => image.id !== imageId);
    setImages(filteredImages);
  };

  if (!images) {
    return null;
  }

  return (
    <>
      { canModify && <ImageUpload username={username} addImage={addImage} /> }

      <ImageList
        username={username}
        images={images}
        canModify={canModify}
        deleteImage={deleteImage}
      />
    </>
  );
};

export default ImageView;