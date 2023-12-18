import { useLoaderData } from "react-router-dom";

import usersService from '../../services/users';

export const userLoader = async ({ params }) => {
  const { username } = params;

  return await usersService.getUser(username);
};

const User = () => {
  const user = useLoaderData();

  return (
    <div className='user'>
      <h2>username from loaderData: {user.username}</h2>
    </div>
  );
};

export default User;