import { Grid, Button, Typography, Tooltip, IconButton, Box } from '@mui/material';
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
    //console.log('fileUploaded', fileUploaded)
    if (fileUploaded) {
      setSelectedFile(fileUploaded);
    }
  };

  const handleReset = () => {
    hiddenFileInput.current.value = '';
    setSelectedFile(undefined);
  };

  return (
    <Grid container
      direction='row'
    >
      <Grid item xs={12}>
        <Button
          component='label'
          variant='contained'
          onClick={handleClick}
          startIcon={<AttachFileIcon />}
          fullWidth
        >
          Choose File
        </Button>
        <input
          type='file'
          onChange={handleChange}
          ref={hiddenFileInput}
          style={{ display: 'none' }}
        />
      </Grid>
      { selectedFile && 
        <Box sx={{
          display: 'flex', flexWrap: 'nowrap', 
          justifyContent: 'flex-end', alignItems: 'center', 
          width: 1
        }}>
          <Tooltip title={selectedFile.name}>
            <Typography noWrap>{selectedFile.name}</Typography>
          </Tooltip>

          <Tooltip title='clear'>
            <IconButton onClick={handleReset}>
              <ClearIcon />
            </IconButton>
          </Tooltip>
        </Box>
      }
    </Grid>
  );
};

export default FileUploader;