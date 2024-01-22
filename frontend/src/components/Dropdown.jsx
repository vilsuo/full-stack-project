import { cloneElement, useState } from 'react';
import { useOutsideClick } from '../util/hooks';

const Dropdown = ({ trigger, menu }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(!open);
  };

  const ref = useOutsideClick(() => setOpen(open));

  return (
    <div className='dropdown' ref={ref}>
      {cloneElement(trigger, {
        onClick: handleOpen,
      })}
      {open ? (
        <div className='menu'>
          {menu.map((menuItem, index) => (
            <li key={index} className='menu-item'>
              {cloneElement(menuItem, {
                onClick: () => {
                  menuItem.props.onClick();
                  setOpen(false);
                },
              })}
            </li>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default Dropdown;