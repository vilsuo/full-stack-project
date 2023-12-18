
import { useLoaderData, useSearchParams } from 'react-router-dom';
import usersService from '../../services/users';
import util from '../../util';

export const usersLoader = async ({ request }) => {
  const query = new URL(request.url).searchParams.get('search');
  return await usersService.getUsers(query ? query : '');
};

const SearchPage = () => {
  const users = useLoaderData();

  const [searchParams] = useSearchParams();
  const query = searchParams.get('search');

  return (
    <div className='user-search-results'>
      <h2>Search Results for: {query}</h2>
      <p>Results in total: {users.length}</p>
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
    </div>
  );
};

export default SearchPage;