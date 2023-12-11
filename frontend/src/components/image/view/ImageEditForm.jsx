import { useState } from 'react';

import { 
  Box, Button, Card, CardMedia, 
  FormControl, FormControlLabel, FormLabel, 
  Radio, RadioGroup, Stack, TextField
} from '@mui/material';

import Alert from '../../Alert';

const Preview = ({ preview }) => {
  return (
    <Card sx={{ p: 2 }}>
      { preview && <CardMedia component='img' image={preview} />}
    </Card>
  );
};

const PrivacyGroup = ({ privacy, setPrivacy }) => {
  const privacyOptions = ['public', 'private'];

  return (
    <FormControl>
      <FormLabel id='file-view-privacy-group-label'>
        Privacy
      </FormLabel>
      <RadioGroup
        row
        aria-labelledby='file-view-privacy-group-label'
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

const ImageEditForm = ({ image, content }) => {
  const [alertInfo, setAlertInfo] = useState({});

  const [title, setTitle] = useState(image.title);
  const [caption, setCaption] = useState(image.caption);
  const [privacy, setPrivacy] = useState(image.privacy);

  const clearMessage = () => setAlertInfo({});

  return (
    <Stack spacing={2} sx={{ mt: 2 }}>
      <Alert
        clearMessage={clearMessage}
        { ...alertInfo }
      />
      <Box id='image-form' component='form' /*onSubmit={onFileUpload}*/ >
        <Stack spacing={2}>
          <Preview preview={content} />
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
        >
          Edit image
        </Button>
      </Box>
    </Stack>
  );
};

export default ImageEditForm;
