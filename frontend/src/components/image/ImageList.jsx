import util from '../../util';

import { useEffect, useState } from 'react';
import usersService from '../../services/users';
import { ImageListItem, ImageListItemBar, ImageList as List, Skeleton } from '@mui/material';

const openEditor = (image, content) => {
  console.log('image.id', image.id);
};

const Image = ({ username, image }) => {
  const [content, setContent] = useState();

  const imageId = image.id;

  useEffect(() => {
    const fetch = async () => {
      const data = await usersService.getImageContent(username, imageId);

      const imageUrl = URL.createObjectURL(data);
      setContent(imageUrl)
    };

    fetch();
  }, [imageId]);

  // show skeleton while loading
  if (!content) {
    return (
      <Skeleton variant='rectangular'>
        <ImageListItem />
      </Skeleton>
    );
  }

  const title = image.title;

  return (
    <ImageListItem onClick={() => openEditor(image, content)}>
      <ImageListItemBar 
        position='top'
        title={title}
        subtitle={util.formatDate(image.createdAt)}
      />
      <img
        src={content}
        alt={title}
      />
    </ImageListItem>
  );
};


const ImageList = ({ images, pageUsername }) => {
  if (!images) {
    return 'loading';
  }

  return (
    <List sx={{ maxWidth: 600 }} cols={3} rowHeight={164}>
      {images.map((img) => (
        <Image key={img.id} username={pageUsername} image={img} />
      ))}
    </List>
  );
};

export default ImageList;