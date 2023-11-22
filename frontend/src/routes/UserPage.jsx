import { useState, useEffect, useRef } from 'react';

import { 
  Box, Button, Card, 
  //CardContent, CardHeader, Typography,
  CardMedia, Checkbox, FormControlLabel, FormGroup, Grid, Stack, TextField, 
} from '@mui/material';


import usersService from '../services/users';
import FileUploader from '../components/file/FileUploader';
import Alert from '../components/Alert';
import { useParams } from 'react-router-dom';

/*
TODO
- cache blank image?
*/

const Preview = ({ preview }) => {
  return (
    <Card sx={{ p: 2 }}>
      { preview && (
        /*<CardHeader title='preview' />*/
        <CardMedia component='img' image={preview} />
        /*
        <CardContent>
          <Typography>
            {caption}
          </Typography>
        </CardContent>
        */
      )}
      { !preview && (
        <CardMedia
          component='img'
          image='/static/images/blank.jpg'
          alt='blank image'
        />
      )}
    </Card>
  );
};

const UserPage = () => {
  const userPage = useParams().username; // username of the page owner

  const [alertInfo, setAlertInfo] = useState({});
  const fileUploaderRef = useRef();

  const [selectedFile, setSelectedFile] = useState(undefined);
  const [preview, setPreview] = useState(undefined);

  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [privacy, setPrivacy] = useState(false);

  const clearMessage = () => setAlertInfo({});

  const reset = () => {
    setTitle('');
    setCaption('');

    // reset file uploader
    fileUploaderRef.current.handleReset();
  }

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
    formData.append('private', privacy);
    
    try {
      await usersService.addImage(userPage, formData);
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
    <Grid container spacing={2} sx={{ mt: 2 }}>
      <Grid item xs={12} sm={6}>
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
            <FormGroup>
              <FormControlLabel
                label='Private'
                control={
                  <Checkbox
                    checked={privacy}
                    onChange={ (event) => setPrivacy(event.target.checked) }
                  />
                }
              />
            </FormGroup>
          </Stack>
          <Button
            id='img-button'
            type='submit'
            fullWidth
            variant='contained'
            sx={{ mt: 2 }}
            disabled={!selectedFile}
          >
            Upload
          </Button>
        </Box>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Preview
          preview={preview}
          title={title}
          caption={caption}
        />
      </Grid>
    </Grid>
  );
};

export default UserPage;
