import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';

import relationsService from '../../services/relations';
import { createErrorMessage } from '../../util/error';

const Relations = () => {
  const { user, authenticatedUser } = useOutletContext();

  const [relations, setRelations] = useState({ loading: true });

  useEffect(() => {
    const fetchRelations = async () => {
      const { username } = user;
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
  }, []);

  if (relations.loading) {
    return <p>Loading relations</p>
  }

  return (
    <div className='container'>
      <h3>Relations</h3>
      <table>

      </table>
    </div>
  );
};

export default Relations;