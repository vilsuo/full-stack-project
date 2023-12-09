import { useEffect, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ImageFormModal from '../components/image/upload/ImageFormModal';
import { Box, Button } from '@mui/material';

import usersService from '../services/users';
import ImageList from '../components/image/ImageList';
import Info from '../components/user/Info';

/*
TODO
- continue working on
  - Info.jsx
  - ImageList.jsx
- add loading animations
- (show success message on image post?)
*/

const UserPage = () => {
  const pageUsername = useParams().username;  // username of the page owner
  const [pageUser, setPageUser] = useState(); // user details of the page owner

  const currentUser = useSelector(state => state.auth.user);
  const isOwnPage = currentUser && (currentUser.username === pageUsername);

  const navigate = useNavigate();

  const [images, setImages] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => { setModalOpen(false); };

  const [error, setError] = useState();
  const clearError = () => setError({});

  useEffect(() => {
    const fetchPageUser = async () => {
      const returnedUser = await usersService.getUser(pageUsername);
      setPageUser(returnedUser);
    };

    const fetchPageUserImages = async () => {
      const returnedImages = await usersService.getImages(pageUsername);
      setImages(returnedImages);
    };

    const fetch = async () => {
      try {
        await fetchPageUser();
        await fetchPageUserImages();

      } catch (error) {
        const message = error.response.data.message;
        navigate('/error', { state: { message } });
      }
    };

    fetch();
  }, [pageUsername]);

  // TODO set success message?
  const onFileUpload = async (formData) => {
    try {
      const addedImage = await usersService.addImage(pageUsername, formData);

      setImages([ ...images, addedImage ]);
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

  if (!pageUser) {
    return 'loading';
  }

  return (
    <Box>
      <Info userDetails={pageUser}/>

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
    </Box>
  );
};

export default UserPage;
