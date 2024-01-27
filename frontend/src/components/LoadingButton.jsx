import Spinner from './Spinner';

const LoadingButton = ({ text, loading, ...props }) => {
  return (
    <button 
      className='loading-button'
      disabled={loading}
      { ...props }
    >
      { loading ? <Spinner size={16} /> : text }
    </button>
  );
};

export default LoadingButton;