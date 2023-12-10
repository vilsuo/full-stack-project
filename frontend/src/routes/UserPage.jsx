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
- add loading animations
- (show success message on image post?)
*/

const UserPage = () => {
  const pageUsername = useParams().username;  // username of the page owner
  const [pageUser, setPageUser] = useState(); // user details of the page owner

  const currentUser = useSelector(state => state.auth.user);
  const isOwnPage = currentUser && (currentUser.username === pageUsername);

  const [images, setImages] = useState([]);

  const navigate = useNavigate();

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const openUploadModal = () => setUploadModalOpen(true);
  const closeUploadModal = () => { setUploadModalOpen(false); };

  const [uploadError, setUploadError] = useState();
  const clearUploadError = () => setUploadError({});

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
      closeUploadModal();

    } catch (error) {
      const errorMessages = error.response.data.message;

      setUploadError({
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
      <Info userDetails={pageUser} />

      { isOwnPage && <>
          <ImageFormModal
            modalOpen={uploadModalOpen}
            onSubmit={onFileUpload}
            error={uploadError}
            clearError={clearUploadError}
            onClose={closeUploadModal}
            username={pageUsername}
          />
          <Button variant='contained' onClick={() => openUploadModal()}>
            Add New Image
          </Button>
        </>
      }

      <ImageList images={images} pageUsername={pageUsername} />
    </Box>
  );
};

export default UserPage;
