import SideBarNav from './SideBarNav';
import SideBarPotrait from './SideBarPotrait';
import SideBarRelations from './SideBarRelations';

const SideBar = ({ user, authenticatedUser }) => {

  const isOwnPage = authenticatedUser && (authenticatedUser.id === user.id);

  return (
    <div className='sidebar'>
      <h3>{user.username}</h3>

      <SideBarPotrait user={user} />

      { (authenticatedUser && !isOwnPage) && <SideBarRelations user={user} /> }

      <SideBarNav user={user} showExtra={isOwnPage} />
    </div>
  );
};

export default SideBar;