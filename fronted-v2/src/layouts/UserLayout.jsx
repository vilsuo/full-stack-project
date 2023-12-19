import { Outlet, useLoaderData } from 'react-router-dom';

import usersService from '../services/users';

export const userLoader = async ({ params }) => {
  const { username } = params;

  return await usersService.getUser(username);
};

const UserLayout = () => {
  const user = useLoaderData();

  return (
    <div className='user-layout'>
      <h2>username from loaderData: {user.username}</h2>

      <Outlet context={user} />
    </div>
  );
};

export default UserLayout;