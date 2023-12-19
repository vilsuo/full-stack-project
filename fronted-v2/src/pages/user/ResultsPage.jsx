
import { Link, useSearchParams } from 'react-router-dom';
import usersService from '../../services/users';
import { useEffect, useState } from 'react';
import PaginationNav from '../../components/PaginationNav';
import UsersTable from '../../components/UsersTable';

/*
TODO
- show total number of results
- show proper loader
- add error handler
*/

const Summary = () => {
  return (
    <div>

    </div>
  );
};

const ResultsPage = () => {
  const [users, setUsers] = useState();
  const [pages, setPages] = useState();
  const [currentPage, setCurrentPage] = useState();

  const [loading, setLoading] = useState(true);

  // search parameters
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q');
  const page = searchParams.get('page');
  const size = searchParams.get('size');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const { users: returnedUsers, page: returnedPage, pages: totalPages }
        = await usersService.getUsers({ q, page, size });

      console.log({ q, page, size, returnedPage, totalPages });

      setUsers(returnedUsers);
      setCurrentPage(Number(returnedPage));
      setPages(Number(totalPages));

      setLoading(false);
    };

    fetchUsers();
  }, [q, page, size]);

  const lastPage = Math.max(pages - 1, 0);

  const setPageParam = (value) => {
    setSearchParams(params => {
      params.set('page', value);
      return params;
    });
  };

  if (loading) {
    return <p>loading...</p>
  }

  return (
    <div className='user-search-results'>
      <h2>Search Results for: {q}</h2>
      <p>Returned users: {users.length}</p>
      <p>Pages in total: {pages}</p>
      
      <Link to='/search'>Do another search</Link>

      <PaginationNav
        currentPage={currentPage}
        lastPage={lastPage}
        setPage={setPageParam}
      />

      <UsersTable users={users} />
    </div>
  );
};


export default ResultsPage;