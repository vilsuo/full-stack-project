import { NavLink, Outlet, useLoaderData, useOutletContext } from 'react-router-dom';

import Banner from '../components/Banner';
import relationsService from '../services/relations';

import usersService from '../services/users';

export const userLoader = async ({ params }) => {
  const { username } = params;
  const user =  await usersService.getUser(username);

  const query = { type: 'follow' };

  const sources = await relationsService
    .getRelationsBySource(username, query);

  const targets = await relationsService
    .getRelationsByTarget(username, query);

  return { 
    user, 
    relations: { 
      following: sources.length,
      followers: targets.length
    }
  };
};

const BannerNav = ({ user, showExtra }) => {

  const PUBLIC_ROUTES = [
    { value: 'images', label: 'Images'},
    { value: 'relations', label: 'Relations'},
    { value: 'details', label: 'Details'},
  ];
  const PRIVATE_ROUTES = [{ value: 'settings', label: 'Settings' }];

  const ROUTES = showExtra ? [ ...PUBLIC_ROUTES, ...PRIVATE_ROUTES ] : PUBLIC_ROUTES;

  return (
    <nav>
      {ROUTES.map(route => (
        <NavLink key={`banner-nav-${route.value}`} to={route.value}>
          {route.label}
        </NavLink>
      ))}
    </nav>
  );
};

/*
const Ban = ({ user, authenticatedUser, relations }) => {

  const showActions = authenticatedUser && (authenticatedUser.id !== user.id);
  const isOwnPage = authenticatedUser && (authenticatedUser.id === user.id);

  return (
    <div className='ban'>
      <BannerPotrait user={user} />

      <BannerNav user={user} showExtra={isOwnPage} />
    </div>
  );
};
*/

const UserLayout = () => {
  const { authenticatedUser } = useOutletContext();
  const { user, relations } = useLoaderData();

  const isOwnPage = authenticatedUser && (authenticatedUser.id === user.id);

  return (
    <div className='user-layout'>
      <Banner 
        user={user}
        relations={relations}
        authenticatedUser={authenticatedUser}
      />

      <BannerNav user={user} showExtra={isOwnPage} />

      <Outlet context={{ user, authenticatedUser }} />
    </div>
  );
};

export default UserLayout;