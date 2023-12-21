import { Outlet, useLoaderData } from 'react-router-dom';

import usersService from '../services/users';
import util from '../util';

export const userLoader = async ({ params }) => {
  const { username } = params;

  const user = await usersService.getUser(username);
  let imageUrl;

  try {
    const data = await usersService.getPotraitContent(username);
    imageUrl = URL.createObjectURL(data);

  } catch (error) {
    if (error.response.status === 404) {
      // show default avatar?
      // make sure this is not the 'user not found' case

    } else {
      throw error;
    }
  }

  return { user, imageUrl }
};

const BannerInfo = ({ user }) => {
  const { name, username, createdAt } = user;

  return (
    <div className='banner-info'>
      <span>{name}</span>
      <span>{username}</span>
      <span className='date'>
        {util.formatDate(createdAt)}
      </span>
    </div>
  );
};

const BannerActions = () => {
  return (
    <div className='banner-actions'>
      <button className='follow-btn'>Follow</button>
      <button className='block-btn'>Block</button>
    </div>
  );
};

const Banner = ({ user, imageUrl }) => {
  const { name, username, createdAt } = user;

  return (
    <div className='banner container'>
      <img className='avatar profile'
        src={imageUrl}
        alt={`${user.username} profile picture`}
      />
      <div className='banner-details'>
        <BannerInfo user={user} />

        <BannerActions />
      </div>
    </div>
  );
};

const UserLayout = () => {
  const { user, imageUrl } = useLoaderData();

  const { name, username, createdAt } = user;

  return (
    <div className='user-layout'>
      <Banner user={user} imageUrl={imageUrl} />

      <Outlet context={user} />
    </div>
  );
};

export default UserLayout;