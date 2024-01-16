import { useNavigate } from 'react-router-dom';

import util from '../util';

const UsersTable = ({ users }) => {
  const navigate = useNavigate();

  const handleClick = (user) => {
    navigate(`/users/${user.username}`);
  };

  return (
    <table className='navigable'>
      <thead>
        <tr>
          <th>Name</th>
          <th>Username</th>
          <th className='date'>Created</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id} className='user-row' onClick={() => handleClick(user)}>
            <td>{user.name}</td>
            <td>{user.username}</td>
            <td className='date'>{util.formatDate(user.createdAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default UsersTable;