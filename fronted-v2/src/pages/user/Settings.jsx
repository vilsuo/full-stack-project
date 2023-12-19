import { useOutletContext } from 'react-router-dom';

const Settings = () => {
  const user = useOutletContext();

  return (
    <div className='settings'>
      <h3>Settings of {user.username}</h3>
    </div>
  );
};

export default Settings;