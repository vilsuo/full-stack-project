import { useSelector } from "react-redux";

const Profile = () => {
  const currentUser = useSelector(state => state.auth.user);

  if (!currentUser) {
    return <h1>TODO: show error page</h1>
  }

  return (
    <div>
      <header>
        <h3>
          <strong>{currentUser.username}</strong> Profile
        </h3>
      </header>
      <p>
        <strong>Id:</strong> {currentUser.id}
      </p>
    </div>
  );
};

export default Profile;
