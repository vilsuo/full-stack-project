import { Grid, Button, Typography, Tooltip, IconButton } from '@mui/material';
import { useRef } from 'react';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ClearIcon from '@mui/icons-material/Clear';

const FileUploader = ({ selectedFile, setSelectedFile }) => {
  // Create a reference to the hidden file input element
  const hiddenFileInput = useRef(null);
  
  // Programatically click the hidden file input element
  // when the Button component is clicked
  const handleClick = event => {
    hiddenFileInput.current.click();
  };

  // Call a function (passed as a prop from the parent component)
  // to handle the user-selected file 
  const handleChange = event => {
    const fileUploaded = event.target.files[0];
    console.log('fileUploaded', fileUploaded)
    if (fileUploaded) {
      setSelectedFile(fileUploaded);
    }
  };

  const handleReset = () => {
    setSelectedFile(undefined);
  }

  return (
    <Grid container
      direction='row'
      justifyContent="space-between"
      alignItems="center"
    >
      <Grid item xs={12}>
        <Button
          component='label'
          variant='contained'
          onClick={handleClick}
          startIcon={<AttachFileIcon />}
        >
          Upload a file
        </Button>
        <input
          type="file"
          onChange={handleChange}
          ref={hiddenFileInput}
          style={{ display: 'none' }} // Make the file input element invisible
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
}

export default FileUploader;