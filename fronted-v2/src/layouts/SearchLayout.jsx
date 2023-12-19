import { Outlet } from 'react-router-dom';
import SearchForm from '../components/SearchForm';

const SearchLayout = () => {

  return (
    <div className='search-layout'>
      <h2>Search users</h2>
      <SearchForm />

      <Outlet />
    </div>
  );
};

export default SearchLayout;