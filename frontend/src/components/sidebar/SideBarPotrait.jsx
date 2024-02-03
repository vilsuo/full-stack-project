import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import potraitService from '../../services/potrait';

import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const SideBarPotrait = ({ user }) => {
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
        setPotrait({ loading: false });

        if (!error.response || error.response.status !== 404) {
          throw error;
        }
      }
    };

    fetchPotrait();

    return () => { if (potrait.url) URL.revokeObjectURL(potrait.url); };
  }, [username, authPotrait]);

  if (potrait.loading) {
    return <Skeleton circle={true} className='avatar profile' />;
  }

  // if user does not have a potrait, show default
  const potraitUrl = potrait.url || '/static/images/blank.jpg';

  return (
    <img className='avatar profile'
      src={potraitUrl}
    />
  );
};

export default SideBarPotrait;