import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';

import relationsService from '../../services/relations';
import { createErrorMessage } from '../../util/error';
import RadioGroup from '../../components/RadioGroup';
import { OPTION_NONE, RELATION_TYPES } from '../../constants';

import { 
  FaUserAltSlash, // block icon
} from 'react-icons/fa';

/*
Table
  - add radio (All | follow | block)
  - add radio (source | target)

  - add footer to count total

  - add sort based on ASC | DESC on username
*/

/*
relation action icons
FOLLOW:
import { FaUserCheck } from "react-icons/fa"; // WHEN FOLLOWING
import { FaUserPlus } from "react-icons/fa"; // WHEN NOT FOLLOWING

BLOCK



*/

const RELATION_SOURCE = { value: 'sourceUser', label: 'User Relations' };
const RELATION_TARGET = { value: 'targetUser', label: 'Relations to User' };

const RELATION_DIRECTION_FILTER_OPTIONS = [
  RELATION_SOURCE, RELATION_TARGET,
];

const RELATION_TYPE_FILTER_OPTIONS = [
  OPTION_NONE,
  ...RELATION_TYPES,
];

const Relations = () => {
  const { user, authenticatedUser } = useOutletContext();
  const [relations, setRelations] = useState({ loading: true });

  const [directionFilter, setDirectionFilter] = useState(RELATION_SOURCE.value);
  const [typeFilter, setTypeFilter] = useState(OPTION_NONE.value);

  const { username } = user;

  useEffect(() => {
    const fetchRelations = async () => {
      setRelations({ loading: true});
      try {
        const source = await relationsService.getRelationsBySource(username);
        const target = await relationsService.getRelationsByTarget(username);
        setRelations({ source, target, loading: false });

      } catch (error) {
        setRelations({ loading: false });
        console.log('error in loading relations', createErrorMessage(error));
      }
    };

    fetchRelations();
  }, [username]);

  const handleClick = (relation) => {
    console.log('clicker', relation);
  };

  if (relations.loading) {
    return <p>Loading relations</p>
  }

  // filter relation direction
  const directionRelations = (directionFilter === RELATION_SOURCE.value)
    ? relations.source
    : relations.target;

  // filter relation type
  const filteredRelations = directionRelations.filter(relation => 
    (typeFilter === OPTION_NONE.value) ? true : (relation.type === typeFilter)
  );

  // object key to select the other user from relation
  const relationOtherUser = (directionFilter === RELATION_SOURCE.value)
    ? RELATION_TARGET.value
    : RELATION_SOURCE.value;

  return (
    <div className='container'>
      <h3>Relations</h3>

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

      <p>Relations: {filteredRelations.length}</p>

      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Relation Type</th>
          </tr>
        </thead>
        <tbody>
          {filteredRelations.map(relation => (
            <tr key={relation.id} className='user-row' onClick={() => handleClick(relation)}>
              <td>{relation[relationOtherUser].username}</td>
              <td>{relation.type}</td>
            </tr>
          ))}
        </tbody>
        {/*
        <tfoot>
          <tr>
            <td>Total</td>
            <td>{filteredRelations.length}</td>
          </tr>
        </tfoot>
        */}
      </table>
    </div>
  );
};

export default Relations;