import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import util from '../util';
import { loadUser } from '../reducers/users';
import usersService from '../services/users';
import relationsService from '../services/relations';

const BannerPotrait = ({ user }) => {
  const [potrait, setPotrait] = useState({ loading: true });

  const { username } = user;

  useEffect(() => {
    const fetchPotrait = async () => {
      try {
        const data = await usersService.getPotraitContent(username);
        const potraitUrl = URL.createObjectURL(data);

        setTimeout(() => {
          setPotrait({
            loading: false,
            url: potraitUrl,
          });
        }, [2000]);
    
      } catch (error) {
        setTimeout(() => {
          setPotrait({ loading: false });
        }, [2000]);

        if (error.response.status !== 404) {
          throw error;
        }
      }
    };

    fetchPotrait();
  }, [username]);

  if (potrait.loading) {
    return <p>loading potrait</p>
  }

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

const BannerActions = ({ user }) => {
  /*
  const dispatch = useDispatch();

  const authRelations = useSelector(state => state.auth.relations);

  // Array of { relation.type: relation.id }
  const authRelationsWithUser = authRelations
    .filter(relation => relation.targetUserId === user.id)
    .map(relation => ({ [relation.type]: relation.id }));

  const [relations, setRelations] = useState(
    Object.assign({}, ...authRelationsWithUser)
  );

  console.log('relations', relations);

  const handleFollow = async () => {
    if (!relations['follow']) {
      // add
      console.log('adding follow..')

      dispatch(addRelation({ targetUserId: user.id, type: 'follow' })).unwrap()
        .then(relation => {
          setRelations({ ...relations, 'follow': relation.id });
          console.log('added follow', relation);
        })
        .catch(error => {
          console.log('error adding relation', error);
        });

    } else {
      // remove
      console.log('removing follow..')

      const relationToRemoveId = relations['follow'];
      dispatch(removeRelation(relationToRemoveId)).unwrap()
        .then((removedRelationId) => {
          const { follow, ...rest } = relations;
          setRelations(rest);
          console.log('removed follow', relationToRemoveId);
        })
        .catch(error => {
          console.log('error removing relation', error);
        });
    }
  };
  */

  const authUsername = useSelector(state => state.auth.user.username);

  const [relations, setRelations] = useState();

  useEffect(() => {
    const fetch = async () => {
      const data = await relationsService.getTargetRelations(
        authUsername, { targetUserId: user.id }
      );

      const authRelationsWithUser = data
        .map(relation => ({ [relation.type]: relation.id }));

      setRelations(Object.assign({}, ...authRelationsWithUser));
    };

    fetch();
  }, [user]);

  console.log('relations with target', relations)

  const handleRelationChange = async (type) => {
    if (!relations[type]) {
      const addedRelation = await relationsService.addRelation(
        authUsername, user.id, type
      );

      setRelations({ ...relations, [type]: addedRelation.id });
      console.log('added', addedRelation);

    } else {
      const relationId = relations[type];
      await relationsService.removeRelation(authUsername, relationId);

      setRelations({ ...relations, [type]: undefined });
      console.log('removed', relationId);
    }
  };

  return (
    <div className='banner-actions'>
      <button className='follow-btn' onClick={() => handleRelationChange('follow')}>
        {relations['follow'] ? 'Unfollow' : 'Follow'}
      </button>
      <button className='block-btn' onClick={() => handleRelationChange('block')}>
        {relations['block'] ? 'Unblock' : 'Block'}
      </button>
    </div>
  );
};

const Banner = ({ user, viewer }) => {
  const showActions = (viewer.isAuthenticated && !viewer.isOwnPage);

  return (
    <div className='banner container'>
      <BannerPotrait user={user} />

      <div className='banner-details'>
        <BannerInfo user={user} />

        { showActions && <BannerActions user={user} /> }
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