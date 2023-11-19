import { useState, useEffect } from 'react';

import { 
  Box, Button, Card, 
  //CardContent, CardHeader, Typography,
  CardMedia, Grid, Stack, TextField, 
} from '@mui/material';


import userService from '../services/user';
import FileUploader from '../components/file/FileUploader';
import Alert from '../components/Alert';

/*
TODO
- can not reselect cleared image again

- cache blank image
- show success/error message
- reset fields with success
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
  const [alertInfo, setAlertInfo] = useState({});

  const [selectedFile, setSelectedFile] = useState(undefined);
  const [preview, setPreview] = useState(undefined);

  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');

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
    
    try {
      await userService.addImage(formData);
      setAlertInfo({
        severity: 'success',
        title: 'File uploaded',
        message: selectedFile.name
      });
    } catch (error) {
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
