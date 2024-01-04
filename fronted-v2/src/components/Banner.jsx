import { useEffect, useState } from 'react';

import util from '../util';
import potraitService from '../services/potrait';
import { addRelation, removeRelation } from '../reducers/auth';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

/*
TODO
- increment/decrement the follow relations when toggling relation of type 'follow'
*/

const BannerPotrait = ({ user }) => {
  const [potrait, setPotrait] = useState({ loading: true });
  const authPotrait = useSelector(state => state.auth.potrait);

  const { username } = user;

  useEffect(() => {
    const fetchPotrait = async () => {
      try {
        setPotrait({ ...potrait, loading: true });
        
        const data = await potraitService.getPotraitContent(username);
      
        setPotrait({
          loading: false,
          url: URL.createObjectURL(data),
        });

      } catch (error) {
        setPotrait({ ...potrait, loading: false });

        if (error.response.status !== 404) {
          throw error;
        }
      }
    };

    fetchPotrait();

    return () => { if (potrait.url) URL.revokeObjectURL(potrait.url); }
  }, [username, authPotrait]);

  if (potrait.loading) {
    return <Skeleton circle={true} className='avatar profile' />
  }

  // if user does not have a potrait, show default
  const potraitUrl = potrait.url || '/static/images/blank.jpg';

  return (
    <img className='avatar profile'
      src={potraitUrl}
    />
  );
};

const BannerInfo = ({ user, relations }) => {
  const { name, username, createdAt } = user;
  const { following, followers } = relations;

  return (
    <div className='banner-info'>
      <span>{name}</span>
      <span>{username}</span>
      <span>Followers: {followers}</span>
      <span>Following: {following}</span>
      <span className='date'>
        Joined {util.formatDate(createdAt)}
      </span>
    </div>
  );
};

const BannerRelationActions = ({ user, relations, authenticatedUser }) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  let authRelations = useSelector(state => state.auth.relations)
    .filter(relation => relation.targetUserId === user.id)
    .map(relation => ({ [relation.type]: relation.id }));
  authRelations = Object.assign({}, ...authRelations);

  const handleRelationChange = async (type) => {
    if (loading) return;

    setLoading(true);

    if (authRelations[type]) {
      // removing relation
      dispatch(removeRelation(authRelations[type]))
        .unwrap()
        .then(relationId => {
          console.log('removed', relationId);
          setLoading(false);
        })
        .catch(error => {
          console.log('error in removeRelation', error);
          setLoading(false);
        });

    } else {
      // adding relation
      dispatch(addRelation({ targetUserId: user.id, type }))
        .unwrap()
        .then(addedRelation=> {
          console.log('added', addedRelation)
          setLoading(false);
        })
        .catch(error => {
          setLoading(false);
          console.log('error in addRelation', error);
        });
    }
  };

  return (
    <div className='banner-actions'>
      <button className='follow-btn' onClick={() => handleRelationChange('follow')}>
        {authRelations['follow'] ? 'Unfollow' : 'Follow'}
      </button>
      <button className='block-btn' onClick={() => handleRelationChange('block')}>
        {authRelations['block'] ? 'Unblock' : 'Block'}
      </button>
    </div>
  );
};

const Banner = ({ user, relations, authenticatedUser }) => {
  const navigate = useNavigate();

  const showActions = authenticatedUser && (authenticatedUser.id !== user.id);
  const isOwnPage = authenticatedUser && (authenticatedUser.id === user.id);

  return (
    <div className='banner container'>
      <BannerPotrait user={user} />

      <div className='banner-details'>
        <BannerInfo user={user} relations={relations} />

        { showActions && (
          <BannerRelationActions 
            user={user}
            relations={relations}
            authenticatedUser={authenticatedUser}
          /> 
        )}

        { isOwnPage && (
          <div className='banner-actions'>
            <button onClick={() => navigate('settings')}>
              Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Banner;