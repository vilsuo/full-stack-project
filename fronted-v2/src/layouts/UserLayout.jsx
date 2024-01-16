import { NavLink, Outlet, useLoaderData, useOutletContext } from 'react-router-dom';

import util from '../util';
import { BannerPotrait } from '../components/Banner';

import usersService from '../services/users';

export const userLoader = async ({ params }) => {
  const { username } = params;
  return await usersService.getUser(username);
};

const SideBarNav = ({ user, showExtra }) => {

  const PUBLIC_ROUTES = [
    { value: 'images', label: 'Images'},
    { value: 'relations', label: 'Relations'},
    { value: 'details', label: 'Details'},
  ];
  const PRIVATE_ROUTES = [{ value: 'settings', label: 'Settings' }];

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

const SideBar = ({ user, authenticatedUser }) => {

  const showActions = authenticatedUser && (authenticatedUser.id !== user.id);
  const isOwnPage = authenticatedUser && (authenticatedUser.id === user.id);

  return (
    <div className='sidebar'>
      <h3>{user.username}</h3>
      <p className='date'>
        Joined {util.formatDate(user.createdAt)}
      </p>
      <BannerPotrait user={user} />

      <SideBarNav user={user} showExtra={isOwnPage} />
    </div>
  );
};

const UserLayout = () => {
  const { authenticatedUser } = useOutletContext();
  const user = useLoaderData();

  const isOwnPage = authenticatedUser && (authenticatedUser.id === user.id);

  return (
    <div className='wrapper'>
      <SideBar user={user} authenticatedUser={authenticatedUser} />

      <div className='main_content'>
        <Outlet context={{ user, authenticatedUser }} />
      </div>
    </div>
  );
};

export default UserLayout;