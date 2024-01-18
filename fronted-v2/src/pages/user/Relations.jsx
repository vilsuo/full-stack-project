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

const RELATION_DIRECTION_FILTER_OPTIONS = [
  { value: 'sourceUser', label: 'Source' }, 
  { value: 'targetUser', label: 'Target' }, 
];

const RELATION_TYPE_FILTER_OPTIONS = [
  OPTION_NONE,
  ...RELATION_TYPES,
];

const Relations = () => {
  const { user, authenticatedUser } = useOutletContext();
  const [relations, setRelations] = useState({ loading: true });

  const [directionFilter, setDirectionFilter] = useState('sourceUser');
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

  if (relations.loading) {
    return <p>Loading relations</p>
  }

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

      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {/*
          {users.map(user => (
            <tr key={user.id} className='user-row' onClick={() => handleClick(user)}>
              <td>{user.name}</td>
              <td>{user.username}</td>
              <td className='date'>{util.formatDate(user.createdAt)}</td>
            </tr>
          ))}
          */}
        </tbody>
      </table>
    </div>
  );
};

export default Relations;