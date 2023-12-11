import util from '../../../util';
import usersService from '../../../services/users';

import { useEffect, useState } from 'react';
import { ImageListItem, ImageListItemBar, Skeleton } from '@mui/material';

const Image = ({ username, image, handleImageClick }) => {
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

export default Image;