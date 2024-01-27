import { RotatingLines } from 'react-loader-spinner'

const Spinner = ({ size = '24' }) => {
  return (
    <div className='spinner'>
      <RotatingLines
        visible={true}
        height={size}
        width={size}
        strokeColor='white'
        strokeWidth='4'
      />
    </div>
  );
};

export default Spinner;