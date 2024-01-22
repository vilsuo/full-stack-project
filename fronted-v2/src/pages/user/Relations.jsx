import { useState } from 'react';
import { useLoaderData, useNavigate, useOutletContext } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import relationsService from '../../services/relations';
import RadioGroup from '../../components/RadioGroup';
import { OPTION_NONE, RELATION_BLOCK, RELATION_FOLLOW, RELATION_TYPES } from '../../constants';
import { removeRelation } from '../../reducers/auth';
import ToggleButton from '../../components/ToggleButton';
import IconButton from '../../components/IconButton';

/*
Todo
- handle remove error
*/

import { 
  FaEdit,         // edit icon
  FaTimesCircle,  // delete icon

  FaUser,         // follow icon
  FaUserSlash,    // block icon
} from 'react-icons/fa';

export const relationsLoader = async ({ params }) => {
  const { username } = params;
  const source = await relationsService.getRelationsBySource(username);
  const target = await relationsService.getRelationsByTarget(username);

  return { source, target };
};

const RELATION_SOURCE = { value: 'sourceUser', label: 'User Relations' };
const RELATION_TARGET = { value: 'targetUser', label: 'Relations to User' };

const RELATION_DIRECTION_FILTER_OPTIONS = [
  RELATION_SOURCE, RELATION_TARGET,
];

const RELATION_TYPE_FILTER_OPTIONS = [
  OPTION_NONE,
  ...RELATION_TYPES,
];

const RELATION_TYPE_ICONS = { 
  [RELATION_FOLLOW.value]: <FaUser />,
  [RELATION_BLOCK.value]: <FaUserSlash />
};

const Relations = () => {
  const { user, authenticatedUser } = useOutletContext();

  const loadedRelations = useLoaderData();
  const [relations, setRelations] = useState(loadedRelations);

  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const [directionFilter, setDirectionFilter] = useState(RELATION_SOURCE.value);
  const [typeFilter, setTypeFilter] = useState(OPTION_NONE.value);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleClick = (otherUser) => {
    navigate(`/users/${otherUser.username}`);
  };

  const handleRemove = async (event, relation) => {
    event.stopPropagation(); // do not navigate

    if (loading) return;
    setLoading(true);

    try {
      await dispatch(removeRelation(relation.id)).unwrap();

      setRelations({
        ...relations,
        source: relations.source.filter(rel => rel.id !== relation.id)
      });
      setLoading(false);

    } catch (rejectedValueError) {
      setLoading(false);
      console.log('error removing relation', rejectedValueError);
    }
  };

  const isUsersRelations = (directionFilter === RELATION_SOURCE.value);

  // filter relation direction
  const directionRelations = isUsersRelations
    ? relations.source
    : relations.target;

  // filter relation type
  const filteredRelations = directionRelations.filter(relation =>
    // apply filter only if viewing users relations
    (!isUsersRelations || (typeFilter === OPTION_NONE.value))
      ? true : (relation.type === typeFilter)
  );

  // object key to select the other user from relation
  const relationOtherUser = isUsersRelations
    ? RELATION_TARGET.value
    : RELATION_SOURCE.value;

  const isOwnPage = authenticatedUser && (authenticatedUser.id === user.id);
  const canEdit = isOwnPage && isUsersRelations;
  const showEdit = editing && isUsersRelations;

  return (
    <div className='container'>
      <h2>Relations</h2>

      <RadioGroup
        options={RELATION_DIRECTION_FILTER_OPTIONS}
        value={directionFilter}
        setValue={setDirectionFilter}
        optionName='Relation Direction'
      />

      { (isOwnPage && isUsersRelations) && (
        <RadioGroup
          options={RELATION_TYPE_FILTER_OPTIONS}
          value={typeFilter}
          setValue={setTypeFilter}
          optionName='Relation Type'
        />
      )}

      <p>Relations: { !loading && filteredRelations.length }</p>

      { canEdit && (
        <div className='edit-actions'>
          <ToggleButton toggled={editing} setToggled={setEditing}>
            <FaEdit  />
          </ToggleButton>
        </div>
      )}

      <table className='navigable'>
        <thead>
          <tr>
            <th className='icon'></th>
            <th>Username</th>
            { showEdit && <th className='action-icon'>Remove</th> }
          </tr>
        </thead>
        <tbody>
          {filteredRelations.map(relation => (
            <tr key={relation.id}
              onClick={() => handleClick(relation[relationOtherUser])}
            >
              <td className={`icon ${relation.type}-icon`}>
                {RELATION_TYPE_ICONS[relation.type]}
              </td>

              <td>{relation[relationOtherUser].username}</td>

              { showEdit && (
                <td className='action-icon'>
                  <IconButton onClick={(event) => handleRemove(event, relation)}>
                    <FaTimesCircle />
                  </IconButton>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Relations;