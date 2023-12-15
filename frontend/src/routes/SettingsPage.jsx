import { useSelector } from "react-redux";
import usersService from "../services/users";

const SettingsPage = () => {
  const currentUser = useSelector(state => state.auth.user);
  
  return (
    <>
      settings of {currentUser.username}
    </>
  );
};

export default SettingsPage;