import { Card, CardMedia } from "@mui/material";

const Preview = ({ preview }) => {
  return (
    <Card sx={{ p: 2 }}>
      { preview && <CardMedia component='img' image={preview} />}
    </Card>
  );
};

export default Preview;