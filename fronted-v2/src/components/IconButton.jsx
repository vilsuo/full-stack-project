import { IconContext } from 'react-icons';

const IconButton = ({ children, ...props }) => {
  const size = props.size || '20px';

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