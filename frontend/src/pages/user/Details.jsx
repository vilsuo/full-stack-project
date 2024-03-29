import { useOutletContext } from "react-router-dom";

import util from '../../util';

const Details = () => {
  const { user } = useOutletContext();

  const { name, username, createdAt } = user;

  return (
    <div className='details-page container'>
      <h2>Details</h2>
      
      <p className='text'>Name: {name}</p>
      <p className='text'>Username: {username}</p>
      <p className='text'>Joined: {util.formatDate(createdAt)}</p>
    </div>
  );
};

export default Details;