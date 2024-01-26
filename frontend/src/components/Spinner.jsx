import { RotatingLines } from 'react-loader-spinner'

const Spinner = () => {
  return (
    <div className='spinner'>
      <RotatingLines
        visible={true}
        height='24'
        width='24'
        strokeColor='white'
        strokeWidth='4'
      />
    </div>
  );
};

export default Spinner;