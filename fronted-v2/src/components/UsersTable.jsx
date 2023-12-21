import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import util from '../util';
import { addUser } from '../reducers/users';

const UsersTable = ({ users }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleClick = (user) => {
    dispatch(addUser(user));
    navigate(`/users/${user.username}/profile`);
  };

  return (
    <table className='users-table'>
      <thead>
        <tr>
          <th>Name</th>
          <th>Username</th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id} className='user-row' onClick={() => handleClick(user)}>
            <td>{user.name}</td>
            <td>{user.username}</td>
            <td>{util.formatDate(user.createdAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default UsersTable;