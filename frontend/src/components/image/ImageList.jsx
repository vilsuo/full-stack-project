
const ImageList = ({ images }) => {

  return (
    <ul>
      {images.map(img =>
        <li key={img.id}>
          {img.title} {img.privacy}
        </li>  
      )}
    </ul>
  );
};

export default ImageList;