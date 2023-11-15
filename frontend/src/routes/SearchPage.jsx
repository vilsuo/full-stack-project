import { useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import usersService from '../services/users';

/*
TODO
- show loader
- add also name and created date (age?) to users
- implement with mui
- add links to user pages
*/
const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('search');

  const [users, setUsers] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      if (query) {
        setIsLoading(true);

        const data = await usersService.getUsers(query);
        setUsers(data);

        setIsLoading(false);
      }
    };

    fetch();
  }, [query]);

  if (isLoading) {
    return (
      <>
        loading...
      </>
    );
  }

  if (users === null) {
    return <h1>give a search param</h1>;
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