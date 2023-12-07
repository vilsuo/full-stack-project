import { Grid, Button, Typography, Tooltip, IconButton } from '@mui/material';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ClearIcon from '@mui/icons-material/Clear';

const FileUploader = forwardRef(({ selectedFile, setSelectedFile }, refs) => {
  // Create a reference to the hidden file input element
  const hiddenFileInput = useRef(null);

  useImperativeHandle(refs, () => {
    return { handleReset }
  });
  
  // Programatically click the hidden file input element
  // when the Button component is clicked
  const handleClick = event => {
    hiddenFileInput.current.click();
  };

  // Call a function (passed as a prop from the parent component)
  // to handle the user-selected file 
  const handleChange = event => {
    const fileUploaded = event.target.files[0];
    //console.log('fileUploaded', fileUploaded)
    if (fileUploaded) {
      setSelectedFile(fileUploaded);
    }
  };

  const handleReset = () => {
    hiddenFileInput.current.value = '';
    setSelectedFile(undefined);
  }

  return (
    <Grid container
      direction='row'
      justifyContent='center'
      alignItems='center'
    >
      <Grid item>
        <Button
          component='label'
          variant='contained'
          onClick={handleClick}
          startIcon={<AttachFileIcon />}
        >
          Upload a file
        </Button>
        <input
          type='file'
          onChange={handleChange}
          ref={hiddenFileInput}
          style={{ display: 'none' }}
        />
      </Grid>
      { selectedFile ? (
        <>
          <Grid item sx={{ p: 1 }}>
            <Typography>{selectedFile.name}</Typography>
          </Grid>
          <Grid item>
            <Tooltip title='clear'>
              <IconButton onClick={handleReset}>
                <ClearIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </>
        ) : null 
      }
    </Grid>
  );
});

FileUploader.displayName = 'FileUploader';

export default FileUploader;