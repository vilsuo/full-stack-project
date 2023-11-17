import { Link, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import usersService from '../services/users';
import { Backdrop, CircularProgress, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

/*
TODO
- add sorting to columns
*/

const formatDate = date => {
  return date.split('T')[0];
}

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
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color='inherit' />
      </Backdrop>
    );
  }

  if (users === null) {
    return <h1>give a search param</h1>;
  }

  if (users.length === 0) {
    return <h1>no results</h1>;
  }

  return (
    <>
      <h1>Search Results for: {query}</h1>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>
                <Grid container direction='row' alignItems='center'>
                  <Grid item>
                    Created
                  </Grid>
                  <Grid item sx={{ ml: 1 }}>
                    <Tooltip title='(YYYY-MM-DD)'>
                      <InfoOutlinedIcon fontSize='small' sx={{ verticalAlign: 'sub' }} />
                    </Tooltip>
                  </Grid>
                </Grid>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(user =>
              <TableRow key={user.id}>
                <TableCell>
                  <Link to={`/user/${user.id}`} key={user.id}>
                    {user.username}
                  </Link>
                </TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default SearchPage;