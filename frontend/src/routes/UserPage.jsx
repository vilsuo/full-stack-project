import { useEffect, useState } from 'react';

import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ImageFormModal from '../components/image/upload/ImageFormModal';
import { Button } from '@mui/material';

import usersService from '../services/users';
import ImageList from '../components/image/ImageList';

/*
TODO
- create new userpage
  - change this page to 
- where to show success message?
- add image to (new) user page
*/

const UserPage = ({ setSuccessMessage }) => {
  const currentUser = useSelector(state => state.auth.user);
  const pageUsername = useParams().username; // username of the page owner

  const isOwnPage = currentUser && (currentUser.username === pageUsername);

  const [images, setImages] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => { setModalOpen(false); };

  const [error, setError] = useState();
  const clearError = () => setError({});

  useEffect(() => {
    const fetch = async () => {
      const returnedImages = await usersService.getImages(pageUsername);

      setImages(returnedImages);
    };

    fetch();
  }, [pageUsername]);

  const onFileUpload = async (formData) => {
    try {
      const addedImage = await usersService.addImage(pageUsername, formData);

      setImages([ ...images, addedImage ]);
      /*
      setSuccessMessage({
        severity: 'success',
        title: 'File uploaded',
      });
      */

      closeModal();

    } catch (error) {
      const errorMessages = error.response.data.message;

      setError({
        severity: 'error',
        title: 'Upload failed',
        message: errorMessages,
      });
    }
  };

  return (
    <>
      { isOwnPage && <>
          <ImageFormModal
            modalOpen={modalOpen}
            onSubmit={onFileUpload}
            error={error}
            clearError={clearError}
            onClose={closeModal}
            username={pageUsername}
          />
          <Button variant='contained' onClick={() => openModal()}>
            Add New Image
          </Button>
        </>
      }

      <ImageList images={images} />
    </>
  );
};

export default UserPage;
