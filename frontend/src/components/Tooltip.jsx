
const ToolTip = ({ children, tooltipText }) => {

  return (
    <div className='tooltip'>
      { children }
      <span className='tooltip-text'>{tooltipText}</span>
    </div>
  );
};

export default ToolTip;