import { RotatingLines } from 'react-loader-spinner'

const Spinner = ({ size = '24' }) => {
  return (
    <div className='spinner-container'>
      <RotatingLines
        visible={true}
        height={size}
        width={size}
        strokeColor='white'
        strokeWidth='4'
        wrapperStyle={{ 
          flex: 1,
          justifyContent: 'center',
          alignItems:'center',
          alignSelf:'center'
        }}
      />
    </div>
  );
};

export default Spinner;