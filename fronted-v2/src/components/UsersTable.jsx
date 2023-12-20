import { Navigate, useNavigate } from 'react-router-dom';
import util from '../util';

const UsersTable = ({ users }) => {

  const navigate = useNavigate();
  // <Navigate to={`/users/${user.username}`} />

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
          <tr key={user.id} className='user-row' onClick={() => navigate(`/users/${user.username}/profile`)}>
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