import { useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import usersService from '../services/users';

/*
TODO
- show loader
*/
const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('search');

  const [users, setUsers] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const data = await usersService.getUsers(query);
      setUsers(data);
    };

    fetch();
  }, [query]);

  if (users === null) {
    return null;
  }

  return (
    <>
      <h1>Search Results for: {query}</h1>
      <ul>
        {users.map(user =>
          <li key={user.id}>
            {user.username}
          </li>
        )}
      </ul>
    </>
  );
};

export default SearchPage;