import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { addRelation, removeRelation } from '../../reducers/auth';

/*
TODO add error handlers for removing & adding relations
*/

const SideBarRelations = ({ user }) => {

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
        .then(addedRelation => {
          console.log('added', addedRelation);
          setLoading(false);
        })
        .catch(error => {
          setLoading(false);
          console.log('error in addRelation', error);
        });
    }
  };

  return (
    <div className='relation-actions'>
      <button className='follow-btn' onClick={() => handleRelationChange('follow')}>
        {authRelations['follow'] ? 'Unfollow' : 'Follow'}
      </button>
      <button className='block-btn' onClick={() => handleRelationChange('block')}>
        {authRelations['block'] ? 'Unblock' : 'Block'}
      </button>
    </div>
  );
};

export default SideBarRelations;