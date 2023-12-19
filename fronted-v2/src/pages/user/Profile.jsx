import { useOutletContext } from 'react-router-dom';

const Profile = () => {
  const user = useOutletContext();

  return (
    <div className='profile'>
      <h3>Profile of {user.username}</h3>
    </div>
  );
};

export default Profile;