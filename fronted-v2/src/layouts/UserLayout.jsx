import { Outlet, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { loadUser } from '../reducers/users';
import Banner from '../components/Banner';
import relationsService from '../services/relations';

const UserLayout = () => {
  const { authenticatedUser } = useOutletContext();
  const { username } = useParams();

  const [userInfo, setUserInfo] = useState({ loading: true });
  const [userRelationsInfo, setUserRelationsInfo] = useState({ loading: true });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setUserInfo({ ...userInfo, loading: true });
        setUserRelationsInfo({ ...userRelationsInfo, loading: true });

        // load user
        const loadedUser = await dispatch(loadUser(username)).unwrap();
        setUserInfo({ loading: false, user: loadedUser });

        // load users relations
        const loadedUserRelationsAsSource = await relationsService
          .getRelationsBySource(loadedUser.username);

        const loadedUserRelationsAsTarget = await relationsService
          .getRelationsByTarget(loadedUser.username);
        
        setUserRelationsInfo({
          loading: false,
          asSource: loadedUserRelationsAsSource,
          asTarget: loadedUserRelationsAsTarget,
        });

      } catch (rejectedValueError) {

        return navigate('/error', { 
          replace: true, 
          state: { error: rejectedValueError } 
        });
      }
    };

    fetchUser();
  }, [username]);

  if (userInfo.loading) {
    return <p>loading user</p>
  }

  return (
    <div className='user-layout'>
      <Banner 
        user={userInfo.user}
        userRelationsInfo={userRelationsInfo}
        setUserRelationsInfo={setUserRelationsInfo}
        authenticatedUser={authenticatedUser}
      />

      <Outlet context={{ user: userInfo.user, authenticatedUser }} />
    </div>
  );
};

export default UserLayout;