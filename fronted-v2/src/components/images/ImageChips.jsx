import util from '../../util';

const ImageChips = ({ image, user }) => {
  const { username } = user;
  const { privacy, createdAt, updatedAt } = image;

  return (
    <div className='chips'>
      <div className='chip'>Image by {username}</div>
      <div className='chip'>Created {util.formatDate(createdAt)}</div>
      { (createdAt !== updatedAt) && 
        <div className='chip'>Last edited {util.formatDate(updatedAt)}</div>
      }
      <div className='chip'>{privacy}</div>
    </div>
  )
};

export default ImageChips;