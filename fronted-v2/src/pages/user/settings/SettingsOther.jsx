import { useOutletContext } from 'react-router-dom';

const SettingsOther = () => {
  const { user, authenticatedUser } = useOutletContext();

  return (
    <div className='container'>
      <p>Empty currently</p>
    </div>
  );
};

export default SettingsOther;