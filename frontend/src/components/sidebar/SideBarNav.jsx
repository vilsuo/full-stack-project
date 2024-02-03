import { NavLink } from 'react-router-dom';

const PUBLIC_ROUTES = [
  { value: 'images', label: 'Images' },
  { value: 'relations', label: 'Relations' },
  { value: 'details', label: 'Details' },
];

const PRIVATE_ROUTES = [{ value: 'settings', label: 'Settings' }];

const SideBarNav = ({ user, showExtra }) => {
  const ROUTES = showExtra ? [ ...PUBLIC_ROUTES, ...PRIVATE_ROUTES ] : PUBLIC_ROUTES;

  return (
    <ul>
      {ROUTES.map(route => (
        <li key={`banner-nav-${route.value}`}>
          <NavLink to={route.value}>
            {route.label}
          </NavLink>
        </li>
      ))}
    </ul>
  );
};

export default SideBarNav;