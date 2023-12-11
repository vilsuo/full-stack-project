import util from '../../util';

import { useEffect, useState } from 'react';
import usersService from '../../services/users';
import { ImageListItem, ImageListItemBar, ImageList as List, Skeleton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
//import ImageViewFormModal from './view/ImageViewFormModal';

import ImageUpload from './upload/ImageUpload';

/*
TODO
- split to multiple files: image posting to its own & image viewing/editing to its own
- add hower listener to Image
- add sorting
- show tag on private images
- implement editing/deleting
*/

const Image = ({ username, image }) => {
  const [content, setContent] = useState();

  const { id, title, createdAt } = image;

  // load image content
  useEffect(() => {
    const fetch = async () => {
      const data = await usersService.getImageContent(username, id);

      const imageUrl = URL.createObjectURL(data);
      setContent(imageUrl)
    };

    fetch();
  }, [id]);

  const handleImageClick = (img, content) => {
    console.log('cliked', img.id);
  };

  // show skeleton while loading
  if (!content) {
    return (
      <Skeleton variant='rectangular'>
        <ImageListItem />
      </Skeleton>
    );
  }

  return (
    <ImageListItem onClick={() => handleImageClick(image, content)}>
      <ImageListItemBar 
        position='top'
        title={title}
        subtitle={util.formatDate(createdAt)}
      />
      <img
        src={content}
        alt={title}
      />
    </ImageListItem>
  );
};

const ImageList = ({ pageUsername, isOwnPage }) => {
  const [images, setImages] = useState([]);
  /*
  const [currentImage, setCurrentImage] = useState();
  const [currentContent, setCurrentContent] = useState();
  */
  const navigate = useNavigate();

  /*
  // image viewing
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const openViewModal = () => setViewModalOpen(true);

  const closeViewModal = () => { 
    setViewModalOpen(false);

    setCurrentContent(null);
    setCurrentImage(null);
  };

  const [viewError, setViewError] = useState();
  const clearViewError = () => setViewError({});
  */

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

  // when uploading a new image
  const addImage = async (formData) => {
    const addedImage = await usersService.addImage(pageUsername, formData);
    setImages([ ...images, addedImage ]);
  };

  /*
  // when editing a new image
  const onFileEdit = async (formData) => {
  };

  const handleImageClick = (image, content) => {
    setCurrentImage(image);
    setCurrentContent(content);

    openViewModal();
  };
  */

  if (!images) {
    return null;
  }

  return (
    <>
      { isOwnPage && <ImageUpload pageUsername={pageUsername} addImage={addImage} /> }
      {/*
      <ImageViewFormModal
        modalOpen={viewModalOpen}
        onSubmit={onFileEdit}
        error={viewError}
        clearError={clearViewError}
        onClose={closeViewModal}
        image={currentImage}
        content={currentContent}
      />*/}
      <List sx={{ maxWidth: 600 }} cols={3} rowHeight={164}>
        {images.map((img) => (
          <Image key={img.id} 
            username={pageUsername} 
            image={img}
            //handleImageClick={handleImageClick}
          />
        ))}
      </List>
    </>
  );
};

export default ImageList;