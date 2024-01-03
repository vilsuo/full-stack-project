import { Outlet, useLoaderData, useOutletContext } from 'react-router-dom';

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

const UserLayout = () => {
  const { authenticatedUser } = useOutletContext();
  const { user, relations } = useLoaderData();
  
  return (
    <div className='user-layout'>
      <Banner 
        user={user}
        relations={relations}
        authenticatedUser={authenticatedUser}
      />

      <Outlet context={{ user, authenticatedUser }} />
    </div>
  );
};

export default UserLayout;