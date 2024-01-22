import IconButton from '../IconButton';

import { 
  FaAngleDoubleLeft, FaAngleLeft, 
  FaAngleRight, FaAngleDoubleRight
} from 'react-icons/fa';

const PaginationNav = ({ currentPage, lastPage, setPage, loading }) => {
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === lastPage;

  const handleFirst = () => setPage(0);

  const handlePrevious = () => setPage(Math.max(currentPage - 1, 0));

  const handleNext = () => setPage(Math.min(currentPage + 1, lastPage));

  const handleLast = () => setPage(lastPage);

  return (
    <div className='pagination-nav'>
      <IconButton disabled={loading || isFirstPage} onClick={handleFirst}>
        <FaAngleDoubleLeft />
      </IconButton>

      <IconButton disabled={loading || isFirstPage} onClick={handlePrevious}>
        <FaAngleLeft />
      </IconButton>

      { !loading
        ? <span>{currentPage + 1}/{lastPage + 1}</span>
        : <span>?/?</span>
      }

      <IconButton disabled={loading || isLastPage} onClick={handleNext}>
        <FaAngleRight />
      </IconButton>

      <IconButton disabled={loading || isLastPage} onClick={handleLast}>
        <FaAngleDoubleRight />
      </IconButton>
    </div>
  );
};

export default PaginationNav;