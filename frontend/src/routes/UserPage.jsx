import { useState, useEffect } from 'react';

import axios from 'axios';
import { Card, CardContent, CardHeader, CardMedia, Typography } from '@mui/material';

const Preview = ({ preview, name, caption }) => {
  return (
    <Card sx={{ maxWidth: 350, p: 2 }}>
      <CardHeader title={name} />
      <CardMedia
        component='img'
        image={preview}
      />
      <CardContent>
        <Typography>
          {caption}
        </Typography>
      </CardContent>
    </Card>
  );
};

const UserPage = () => {
  const [selectedFile, setSelectedFile] = useState(undefined);
  const [preview, setPreview] = useState(undefined);

  const [caption, setCaption] = useState('');

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
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile])

  const onFileChange = event => {
    setSelectedFile(event.target.files[0]);
  };

  // On file upload (click the upload button)
  const onFileUpload = (event) => {
    event.preventDefault();

    // Create an object of formData
    const formData = new FormData();

    formData.append(
      'image',
      selectedFile,
      selectedFile.name
    );

    formData.append('caption', caption);
    
    //console.log(selectedFile);
    axios.post('/api/user/profilepicture', formData);
  };

  const fileData = () => {
    if (selectedFile) {
      return (
        <div>
          <Preview
            preview={preview}
            name={selectedFile.name}
            caption={caption}
          />
          {/*
          <h2>File Details:</h2>
          <p>File Name: {selectedFile.name}</p>
          <p>File Type: {selectedFile.type}</p>
          <p>
            Last Modified:{" "}
            {selectedFile.lastModifiedDate.toDateString()}
          </p>
          */}
        </div>
      );
    } else {
      return (
        <div>
          <br />
          <h4>Choose before Pressing the Upload button</h4>
        </div>
      );
    }
  };

  return (
    <div>
      <form
        onSubmit={onFileUpload}
        method='POST'
      >
        <input type='file' onChange={onFileChange} />
        <label>
          Caption:
          <input
            type='text'
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
          />
        </label>
        <button type='submit'>Upload!</button>
      </form>
      {fileData()}
    </div>
  );
};

export default UserPage;
