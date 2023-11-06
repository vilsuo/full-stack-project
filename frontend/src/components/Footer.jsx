import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

const Footer = () => {
  return (
    <Typography color='text.secondary' align='center' sx={{ mt: 2 }}>
      <Link color='inherit' href='https://github.com/vilsuo/full-stack-project'>
        Fullstack project 2023
      </Link>
    </Typography>
  );
};

export default Footer;