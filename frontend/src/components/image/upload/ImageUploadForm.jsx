import { useState, useEffect } from 'react';

import { 
  Box, Button, FormControl, FormControlLabel, FormLabel, 
  Radio, RadioGroup, Stack, TextField
} from '@mui/material';

import ImageInput from './ImageInput';
import Alert from '../../Alert';
import Preview from '../Preview';

const PrivacyGroup = ({ privacy, setPrivacy }) => {
  const privacyOptions = ['public', 'private'];

  return (
    <FormControl>
      <FormLabel id='file-upload-privacy-group-label'>
        Privacy
      </FormLabel>
      <RadioGroup
        row
        aria-labelledby='file-upload-privacy-group-label'
        name='privacy-buttons-group'
        value={privacy}
        onChange={ (event) => setPrivacy(event.target.value) }
      >
        {privacyOptions.map((option, index) => 
          <FormControlLabel 
            key={index}
            value={option}
            control={<Radio />}
            label={option}
          />
        )}
      </RadioGroup>
    </FormControl>
  );
};

const ImageUploadForm = ({ onSubmit }) => {
  const [alertInfo, setAlertInfo] = useState({});

  const [selectedFile, setSelectedFile] = useState(undefined);
  const [preview, setPreview] = useState(undefined);

  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [privacy, setPrivacy] = useState('public');

  const clearMessage = () => setAlertInfo({});

  // create a preview as a side effect, whenever selected file is changed
  useEffect(() => {
    if (!selectedFile) {
      setPreview(undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    // when effect returns a function, React will run it when it is time to clean up
    // free memory when ever this component is unmounted
    return () => {
      URL.revokeObjectURL(objectUrl);
    }
  }, [selectedFile])

  const onFileUpload = async (event) => {
    event.preventDefault();
    clearMessage();

    const formData = new FormData();
    formData.append('image', selectedFile, selectedFile.name);
    formData.append('title', title);
    formData.append('caption', caption);
    formData.append('privacy', privacy);
    
    onSubmit(formData);
  };

  return (
    <Stack spacing={2} sx={{ mt: 2 }}>
      <Alert
        id='upload-alert'
        clearMessage={clearMessage}
        { ...alertInfo }
      />
      <Box id='image-form' component='form' onSubmit={onFileUpload}>
        <Stack spacing={2}>
          <ImageInput
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
          />
          { preview && <Preview preview={preview} /> }
          <TextField
            id='title'
            type='text'
            label='Title'
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <TextField
            id='caption'
            type='text'
            label='Caption'
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            multiline={true}
          />
          <PrivacyGroup privacy={privacy} setPrivacy={setPrivacy} />
        </Stack>
        <Button
          id='img-button'
          type='submit'
          fullWidth
          variant='contained'
          sx={{ mt: 2 }}
          disabled={!selectedFile}
        >
          Upload image
        </Button>
      </Box>
    </Stack>
  );
};

export default ImageUploadForm;
