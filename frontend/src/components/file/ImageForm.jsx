import { useState, useEffect, useRef } from 'react';

import { 
  Box, Button, Card, CardMedia, 
  FormControl, FormControlLabel, FormLabel, 
  Radio, RadioGroup, Stack, TextField
} from '@mui/material';

import usersService from '../../services/users';
import FileUploader from './FileUploader';
import Alert from '../Alert';

/*
TODO
- cache blank image?
*/

const Preview = ({ preview }) => {
  return (
    <Card sx={{ p: 2 }}>
      { preview && <CardMedia component='img' image={preview} />}
    </Card>
  );
};

const PrivacyGroup = ({ privacy, setPrivacy }) => {
  const privacyOptions = ['public', 'private'];

  /*
  const StyledFormControlLabel = styled((props) => (
    <FormControlLabel { ...props } />
  ))(({ theme, checked }) => ({
    '.MuiFormControlLabel-label': checked && {
      // Change color here
      color: "red"
    }
  }));

  const MyFormControlLabel = (props) => {
    const radioGroup = useRadioGroup();

    let checked = false;

    if (radioGroup) {
      checked = radioGroup.value === props.value;
    }

    return <StyledFormControlLabel checked={checked} { ...props } />;
  };
  */

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

const ImageForm = ({ username }) => {
  const [alertInfo, setAlertInfo] = useState({});
  const fileUploaderRef = useRef();

  const [selectedFile, setSelectedFile] = useState(undefined);
  const [preview, setPreview] = useState(undefined);

  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [privacy, setPrivacy] = useState('public');

  const clearMessage = () => setAlertInfo({});

  const reset = () => {
    setTitle('');
    setCaption('');

    // reset file uploader
    fileUploaderRef.current.handleReset();
  };

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

  // On file upload (click the upload button)
  const onFileUpload = async (event) => {
    event.preventDefault();
    clearMessage();

    // Create an object of formData
    const formData = new FormData();
    formData.append(
      'image',
      selectedFile,
      selectedFile.name
    );
    formData.append('title', title);
    formData.append('caption', caption);
    formData.append('privacy', privacy);
    
    try {
      await usersService.addImage(username, formData);
      setAlertInfo({
        severity: 'success',
        title: 'File uploaded',
        message: selectedFile.name
      });
      reset();

    } catch (error) {
      console.log('error', error);
      const errorMessages = error.response.data.message;
      setAlertInfo({
        severity: 'error',
        title: 'Upload failed',
        message: errorMessages,
      });
    }
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
          <FileUploader
            ref={fileUploaderRef}
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

export default ImageForm;
