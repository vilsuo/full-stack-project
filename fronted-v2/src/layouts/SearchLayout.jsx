import { Outlet } from 'react-router-dom';
import SearchForm from '../components/SearchForm';

const SearchLayout = () => {

  return (
    <div className='search-layout'>
      <SearchForm />

      <Outlet />
    </div>
  );
};

export default SearchLayout;