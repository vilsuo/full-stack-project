import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import util from '../util';
import { loadUser } from '../reducers/users';
import usersService from '../services/users';
import axios from 'axios';

const BannerPotrait = ({ potrait }) => {

  // if user does not have a potrait, show default
  if (!potrait.url) {
    return (
      <img className='avatar profile'
        src={'/static/images/blank.jpg'}
      />
    );
  }

  return (
    <img className='avatar profile'
      src={potrait.url}
    />
  );
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

const Banner = ({ user, viewer }) => {
  const [potrait, setPotrait] = useState({ loading: true });
  const showActions = (viewer.isAuthenticated && !viewer.isOwnPage);

  const { username } = user;

  useEffect(() => {
    const fetchPotrait = async () => {
      try {
        const data = await usersService.getPotraitContent(username);
        const potraitUrl = URL.createObjectURL(data);

        setPotrait({
          loading: false,
          url: potraitUrl,
        });
    
      } catch (error) {
        setPotrait({ loading: false });

        if (error.response.status !== 404) {
          throw error;
        }
      }
    };

    fetchPotrait();
  }, [username]);

  return (
    <div className='banner container'>
      <BannerPotrait potrait={potrait} />

      <div className='banner-details'>
        <BannerInfo user={user} />

        { showActions && <BannerActions /> }
      </div>
    </div>
  );
};

const UserLayout = () => {
  const currentUser = useSelector(state => state.auth.user);
  const { username } = useParams();

  const viewer = {
    isAuthenticated: currentUser ? true : false,
    isOwnPage: currentUser && (currentUser.username === username),
  };

  const [user, setUser] = useState();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const loadedUser = await dispatch(loadUser(username)).unwrap();
        setUser(loadedUser);
      } catch (rejectedValueError) {
        return navigate('/error', { 
          replace: true, 
          state: { error: rejectedValueError } 
        });
      }
    };

    fetchUser();
  }, [username]);

  if (!user) {
    return <p>loading</p>
  }

  return (
    <div className='user-layout'>
      <Banner user={user} viewer={viewer} />

      <Outlet context={{ user, viewer }} />
    </div>
  );
};

export default UserLayout;