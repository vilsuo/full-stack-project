import { useState, useEffect, useRef } from 'react';

import { useParams } from 'react-router-dom';
import ImageForm from '../components/file/ImageForm';
import { useSelector } from 'react-redux';
import FormModal from '../components/file/FormModal';
import { Button } from '@mui/material';

const UserPage = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const currentUser = useSelector(state => state.auth.user);
  const pageUsername = useParams().username; // username of the page owner

  const isOwnPage = currentUser && (currentUser.username === pageUsername);

  const openModal = () => setModalOpen(true);

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      { isOwnPage && <>
          {/*<ImageForm username={currentUser.username} />*/}
          <FormModal
            username={pageUsername}
            modalOpen={modalOpen}
            //onSubmit={submitNewEntry}
            //error={error}
            onClose={closeModal}
          />
          <Button variant='contained' onClick={() => openModal()}>
            Add New Image
          </Button>
        </>
      }
      { !isOwnPage && <p>Not own page</p> }
    </>
  );
};

export default UserPage;
