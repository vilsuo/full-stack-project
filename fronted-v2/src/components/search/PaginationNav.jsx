
const PaginationNav = ({ currentPage, lastPage, setPage, loading }) => {
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === lastPage;

  const handleFirst = () => setPage(0);

  const handlePrevious = () => setPage(Math.max(currentPage - 1, 0));

  const handleNext = () => setPage(Math.min(currentPage + 1, lastPage));

  const handleLast = () => setPage(lastPage);

  return (
    <div className='pagination-nav'>
      <button disabled={loading || isFirstPage} onClick={handleFirst}>{'<<'}</button>
      <button disabled={loading || isFirstPage} onClick={handlePrevious}>{'<'}</button>
      { !loading
        ? <span>{currentPage + 1}/{lastPage + 1}</span>
        : <span>?/?</span>
      }
      <button disabled={loading || isLastPage} onClick={handleNext}>{'>'}</button>
      <button disabled={loading || isLastPage} onClick={handleLast}>{'>>'}</button>
    </div>
  );
};

export default PaginationNav;