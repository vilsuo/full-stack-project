import { IconContext } from 'react-icons';
import { SIZE_MEDIUM } from '../constants';

const IconButton = ({ children, ...props }) => {
  const size = props.size || SIZE_MEDIUM;

  return (
    <button { ...props }>
      <IconContext.Provider value={{ size }}>
        <div className='icon-button'>
          {children}
        </div>
      </IconContext.Provider>
    </button>
  );
};

export default IconButton;