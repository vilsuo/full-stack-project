
import { useSearchParams } from 'react-router-dom';
import usersService from '../../services/users';
import { useEffect, useState } from 'react';
import PaginationNav from '../../components/search/PaginationNav';
import UsersTable from '../../components/search/UsersTable';
import SearchInfo from '../../components/search/SearchInfo';

/*
TODO
- add error handler
- do not show loader for currentPage/totalPages in PaginationNav when only changing page
*/

const Results = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState();
  const [pages, setPages] = useState();
  const [total, setTotal] = useState();

  const [time, setTime] = useState();
  const [loading, setLoading] = useState(true);

  // search parameters
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q');
  const page = searchParams.get('page');
  const size = searchParams.get('size');

  useEffect(() => {
    const fetchUsers = async () => {
      const startTime = new Date();

      setLoading(true);

      const { 
        users: returnedUsers,
        page: returnedPage,
        pages: totalPages,
        count: totalUsers
      } = await usersService.getUsers({ q, page, size });

      //setTimeout(() => {
      const endTime = new Date();
      setTime(endTime - startTime); //in ms

      //console.log({ q, page, size, returnedPage, totalPages, totalUsers });

      setUsers(returnedUsers);
      setCurrentPage(Number(returnedPage));
      setPages(Number(totalPages));
      setTotal(Number(totalUsers));

      setLoading(false);
      //}, [2000]);
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

  return (
    <div className='container search-results'>
      <SearchInfo query={q} total={total} time={time} loading={loading} />

      <UsersTable users={users} />

      <PaginationNav
        currentPage={currentPage}
        lastPage={lastPage}
        setPage={setPageParam}
        loading={loading}
      />
    </div>
  );
};


export default Results;