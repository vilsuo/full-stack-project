import { Button } from "@mui/material";
import ImageUploadFormModal from "./ImageUploadFormModal";
import { useState } from "react";

const ImageUpload = ({ addImage }) => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const openUploadModal = () => setUploadModalOpen(true);
  const closeUploadModal = () => { setUploadModalOpen(false); };

  const [uploadError, setUploadError] = useState();
  const clearUploadError = () => setUploadError({});

  // when uploading a new image
  const onFileUpload = async (formData) => {
    try {
      addImage(formData);
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

  return (
    <>
      <ImageUploadFormModal
        modalOpen={uploadModalOpen}
        onSubmit={onFileUpload}
        error={uploadError}
        clearError={clearUploadError}
        onClose={closeUploadModal}
      />
      <Button variant='contained' onClick={() => openUploadModal()}>
        Add New Image
      </Button>
    </>
  );
};

export default ImageUpload;