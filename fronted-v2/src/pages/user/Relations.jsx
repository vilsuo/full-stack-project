import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import relationsService from '../../services/relations';
import { createErrorMessage } from '../../util/error';
import RadioGroup from '../../components/RadioGroup';
import { OPTION_NONE, RELATION_BLOCK, RELATION_FOLLOW, RELATION_TYPES } from '../../constants';
import { removeRelation } from '../../reducers/auth';

import { 
  FaEdit,         // edit icon
  FaTimesCircle,  // delete icon

  FaUser,         // follow icon
  FaUserSlash,    // block icon
} from 'react-icons/fa';
import { IconContext } from 'react-icons';
import ToggleButton from '../../components/ToggleButton';

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

const relationsInitialValue = { source: [], target: [] };

const Relations = () => {
  const { user, authenticatedUser } = useOutletContext();
  const [relations, setRelations] = useState(relationsInitialValue);

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const [directionFilter, setDirectionFilter] = useState(RELATION_SOURCE.value);
  const [typeFilter, setTypeFilter] = useState(OPTION_NONE.value);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { username } = user;

  useEffect(() => {
    const fetchRelations = async () => {
      setRelations(relationsInitialValue);
      setLoading(true);

      try {
        const source = await relationsService.getRelationsBySource(username);
        const target = await relationsService.getRelationsByTarget(username);
        setRelations({ source, target, loading: false });
        setLoading(false);

      } catch (error) {
        setLoading(false);
        console.log('error in loading relations', createErrorMessage(error));
      }
    };

    fetchRelations();
  }, [username]);

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
    (typeFilter === OPTION_NONE.value) ? true : (relation.type === typeFilter)
  );

  // object key to select the other user from relation
  const relationOtherUser = isUsersRelations
    ? RELATION_TARGET.value
    : RELATION_SOURCE.value;

  const canEdit = authenticatedUser && (authenticatedUser.id === user.id) && isUsersRelations;
  const showEdit = editing && isUsersRelations;

  return (
    <div className='container'>
      <div className='action-header'>
        <h3>Relations</h3>

        { canEdit && (
          <ToggleButton toggled={editing} setToggled={setEditing}>
            {<FaEdit  />}
          </ToggleButton>
        )}
      </div>

      <RadioGroup
        options={RELATION_DIRECTION_FILTER_OPTIONS}
        value={directionFilter}
        setValue={setDirectionFilter}
        optionName='Relation Direction'
      />

      <RadioGroup
        options={RELATION_TYPE_FILTER_OPTIONS}
        value={typeFilter}
        setValue={setTypeFilter}
        optionName='Relation Type'
      />

      <p>Relations: { !loading && filteredRelations.length }</p>

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
                  <button onClick={(event) => handleRemove(event, relation)}>
                    <IconContext.Provider value={{ size: '20px' }}>
                      <div>
                        <FaTimesCircle  />
                      </div>
                    </IconContext.Provider>
                  </button>
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