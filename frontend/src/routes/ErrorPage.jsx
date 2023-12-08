import { Alert, AlertTitle, Box, Button } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

const ErrorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const message = location.state.message;

  return (
    <Box
      display= 'flex'
      justifyContent= 'center'
      alignItems= 'center'
      minHeight='75vh' // put center of screen: '100vh'
    >
      <Alert 
        sx={{ alignItems: 'center' }}
        variant='filled'
        severity='error'
        action={
          <Button
            onClick={() => navigate(-2)}
            variant='contained'
          >
            Back
          </Button>
        }
      >
        <AlertTitle>Error</AlertTitle>
        {message}
      </Alert>
    </Box>
  );
};

export default ErrorPage;