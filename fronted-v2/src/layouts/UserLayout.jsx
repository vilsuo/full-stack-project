import { Outlet, useLoaderData, useOutletContext } from 'react-router-dom';

import usersService from '../services/users';
import SideBar from '../components/sidebar/SideBar';

export const userLoader = async ({ params }) => {
  const { username } = params;
  return await usersService.getUser(username);
};

const UserLayout = () => {
  const { authenticatedUser } = useOutletContext();
  const user = useLoaderData();

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