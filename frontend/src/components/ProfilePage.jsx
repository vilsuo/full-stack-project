import { useSelector } from "react-redux";

const Profile = () => {
  const currentUser = useSelector(state => state.auth.user);

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
