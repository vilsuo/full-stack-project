import { useNavigate, useOutletContext } from 'react-router-dom';
import usersService from '../../../services/users';
import { useDispatch } from 'react-redux';
import { resetAll } from '../../../reducers/auth';
import { useState } from 'react';
import LoadingButton from '../../../components/LoadingButton';

const SettingsOther = () => {
  const { user } = useOutletContext();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);

    if (confirm('Are you sure you want to delete your user?')) {
      await usersService.deleteUser(user.username);
      dispatch(resetAll());
      navigate('/login', { replace: true } );
    }
    
    setLoading(false);
  };

  return (
    <div className='settings-other-page container'>
      <h3>Delete User</h3>
      <p>
        Deleting a user will also delete the potrait and all images of the user.
        The deletion is <strong>irreversible!</strong>
      </p>
      <LoadingButton
        text='Delete'
        disabled={loading}
        loading={loading}
        onClick={handleDelete}
      />
    </div>
  );
};

export default SettingsOther;