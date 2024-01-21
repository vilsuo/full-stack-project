
const PaginationNav = ({ currentPage, lastPage, setPage }) => {
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === lastPage;

  const handleFirst = () => setPage(0);

  const handlePrevious = () => setPage(Math.max(currentPage - 1, 0));

  const handleNext = () => setPage(Math.min(currentPage + 1, lastPage));

  const handleLast = () => setPage(lastPage);

  return (
    <div className='pagination-nav'>
      <button disabled={isFirstPage} onClick={handleFirst}>{'<<'}</button>
      <button disabled={isFirstPage} onClick={handlePrevious}>{'<'}</button>
      <span>{currentPage + 1}/{lastPage + 1}</span>
      <button disabled={isLastPage} onClick={handleNext}>{'>'}</button>
      <button disabled={isLastPage} onClick={handleLast}>{'>>'}</button>
    </div>
  );
};

export default PaginationNav;