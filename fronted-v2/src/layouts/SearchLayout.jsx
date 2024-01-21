import { Outlet } from 'react-router-dom';
import SearchForm from '../components/search/SearchForm';

const SearchLayout = () => {

  return (
    <div className='search-layout'>
      <div className='container'>
        <SearchForm />
      </div>

      <Outlet />
    </div>
  );
};

export default SearchLayout;