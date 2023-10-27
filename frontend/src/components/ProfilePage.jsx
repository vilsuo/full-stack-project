import { useContext } from "react";
import { AuthContext } from "../context/AuthContextProvider";

const Profile = () => {
  const {currentUser } = useContext(AuthContext);

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
