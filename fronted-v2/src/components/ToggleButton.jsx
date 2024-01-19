import { IconContext } from 'react-icons';

const ToggleButton = ({ toggled, setToggled, children }) => {

  const handleChange = () => setToggled(!toggled);

  return (
    <button
      className={`toggle-button ${toggled ? 'on' : 'off'}`}
      onClick={handleChange}
    >
      <IconContext.Provider value={{ size: '20px' }}>
        <div>
          {children}
        </div>
      </IconContext.Provider>
    </button>
  );
};

export default ToggleButton;