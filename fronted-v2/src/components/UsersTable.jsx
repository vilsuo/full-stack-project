import util from '../util';

const UsersTable = ({ users }) => {
  
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Username</th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id} className='user-row'>
            <td className='user-name'>{user.name}</td>
            <td className='user-username'>{user.username}</td>
            <td className='user-created-at'>{util.formatDate(user.createdAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default UsersTable;