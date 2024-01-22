import IconButton from './IconButton';

const ToggleButton = ({ toggled, setToggled, children }) => {

  const handleChange = () => setToggled(!toggled);

  return (
    <IconButton 
      className={`action-button ${toggled ? 'on' : 'off'}`}
      onClick={handleChange}
    >
      {children}
    </IconButton>
  );
};

export default ToggleButton;