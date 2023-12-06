import { useState, useEffect, useRef } from 'react';

import { useParams } from 'react-router-dom';
import ImageForm from '../components/file/ImageForm';
import { useSelector } from 'react-redux';

const UserPage = () => {
  const currentUser = useSelector(state => state.auth.user);

  const userPage = useParams().username; // username of the page owner

  const isOwnPage = currentUser && (currentUser.username === userPage);

  return (
    <>
      { isOwnPage && <ImageForm username={currentUser.username} /> }
      { !isOwnPage && <p>Not own page</p> }
    </>
  );
};

export default UserPage;
