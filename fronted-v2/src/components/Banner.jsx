import { useEffect, useState } from 'react';

import util from '../util';
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
  const potraitUrl = potrait.url || '/static/images/blank.jpg';

  return (
    <img className='avatar profile'
      src={potraitUrl}
    />
  );
};

const BannerInfo = ({ user, userRelationsInfo }) => {
  const { name, username, createdAt } = user;

  const countByRelationType = (relations, type) => {
    return relations.reduce(
      (acc, relation) => (relation.type === type ? 1 : 0) + acc, 0
    );
  };

  const following = countByRelationType(userRelationsInfo.asSource, 'follow');
  const followers = countByRelationType(userRelationsInfo.asTarget, 'follow');

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

const BannerActions = ({ 
      user, userRelationsInfo, setUserRelationsInfo, authenticatedUser
    }) => {

  const relations = userRelationsInfo.asTarget
    .filter(relation => relation.sourceUserId === authenticatedUser.id)
    .map(relation => ({ [relation.type]: relation.id }));

  const [authRelationsWithUser, setAuthRelationsWithUser] = useState(
    Object.assign({}, ...relations)
  );

  console.log('authRelationsWithUser', authRelationsWithUser);

  const handleRelationChange = async (type) => {
    const { username: authUsername } = authenticatedUser;

    if (!authRelationsWithUser[type]) {
      // adding relation
      const addedRelation = await relationsService.addRelation(
        authUsername, user.id, type
      );

      setAuthRelationsWithUser({ ...authRelationsWithUser, [type]: addedRelation.id });

      setUserRelationsInfo({ 
        ...userRelationsInfo, 
        asTarget: [ ...userRelationsInfo.asTarget, addedRelation ]
      });

      console.log('added', addedRelation);

    } else {
      // removing relation
      const relationId = authRelationsWithUser[type];
      await relationsService.removeRelation(authUsername, relationId);

      setAuthRelationsWithUser({ ...authRelationsWithUser, [type]: undefined });

      setUserRelationsInfo({
        ...userRelationsInfo, 
        asTarget: userRelationsInfo.asTarget.filter(relation => relation.id !== relationId)
      });

      console.log('removed', relationId);
    }
  };

  return (
    <div className='banner-actions'>
      <button className='follow-btn' onClick={() => handleRelationChange('follow')}>
        {authRelationsWithUser['follow'] ? 'Unfollow' : 'Follow'}
      </button>
      <button className='block-btn' onClick={() => handleRelationChange('block')}>
        {authRelationsWithUser['block'] ? 'Unblock' : 'Block'}
      </button>
    </div>
  );
};

const Banner = ({ 
      user, userRelationsInfo, setUserRelationsInfo, authenticatedUser
    }) => {

  const showActions = authenticatedUser && (authenticatedUser.id !== user.id);

  if (userRelationsInfo.loading) {
    return <p>loading relations info</p>;
  }

  console.log('relations info', userRelationsInfo);

  return (
    <div className='banner container'>
      <BannerPotrait user={user} />

      <div className='banner-details'>
        <BannerInfo user={user} userRelationsInfo={userRelationsInfo} />

        { showActions && (
          <BannerActions 
            user={user}
            userRelationsInfo={userRelationsInfo}
            setUserRelationsInfo={setUserRelationsInfo}
            authenticatedUser={authenticatedUser}
          /> 
        )}
      </div>
    </div>
  );
};

export default Banner;