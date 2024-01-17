import { useOutletContext } from "react-router-dom";

import util from '../../util';

const Details = () => {
  const { user } = useOutletContext();

  const { name, username, createdAt } = user;

  return (
    <div className='container'>
      <p>Name: {name}</p>
      <p>Username: {username}</p>
      <p>Joined: {util.formatDate(createdAt)}</p>
    </div>
  );
};

export default Details;