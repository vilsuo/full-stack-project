import { useNavigate, useOutletContext } from 'react-router-dom';
import usersService from '../../../services/users';
import { useDispatch } from 'react-redux';
import { resetAll } from '../../../reducers/auth';

const SettingsOther = () => {
  const { user, authenticatedUser } = useOutletContext();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete your user?')) {
      await usersService.deleteUser(user.username);
      dispatch(resetAll());
      navigate('/login', { replace: true } );
    }
  };

  return (
    <div className='container'>
      <h3>Delete user</h3>
      <p>
        Deleting a user will also delete the potrait and all images of the user.
        The deletion is <strong>irreversible!</strong>
      </p>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
};

export default SettingsOther;