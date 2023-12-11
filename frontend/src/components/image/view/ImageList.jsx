import { ImageList as List} from '@mui/material';
import Image from './Image';
import { useState } from 'react';
import ImageViewFormModal from './ImageViewFormModal';

const ImageList = ({ username, images, canModify, deleteImage }) => {
  const [currentImage, setCurrentImage] = useState();
  const [currentContent, setCurrentContent] = useState();

  const [viewModalOpen, setViewModalOpen] = useState(false);

  const openViewModal = (image, content) => {
    setCurrentImage(image);
    setCurrentContent(content);

    setViewModalOpen(true);
  };

  const closeViewModal = () => { 
    setCurrentImage(null);
    setCurrentContent(null);

    setViewModalOpen(false); 
  };

  return (
    <>
      { currentImage && <ImageViewFormModal
          modalOpen={viewModalOpen}
          onClose={closeViewModal}
          image={currentImage}
          content={currentContent}
          canModify={canModify}
          deleteImage={deleteImage}
        />
      }
      <List sx={{ maxWidth: 600 }} cols={3} rowHeight={164}>
        {images.map((img) => (
          <Image key={img.id} 
            username={username} 
            image={img}
            handleImageClick={openViewModal}
          />
        ))}
      </List>
    </>
  );
};

export default ImageList;