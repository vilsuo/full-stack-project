import { useState, useEffect, useContext } from "react";

import userService from "../services/user";
import { AuthContext } from "../context/AuthContextProvider";

const BoardUser = () => {
  const [content, setContent] = useState("");
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    userService.getUserBoard().then(
      (response) => {
        setContent(response.data);
      },
      (error) => {
        const _content =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();

        setContent(_content);

        if (error.response && error.response.status === 401) {
          logout()
            .then(() => console.log('logged out'))
            .catch((error) => console.log('error loggin out', error));
        }
      }
    );
  }, []);

  return (
    <div>
      <header>
        <h3>{content}</h3>
      </header>
    </div>
  );
};

export default BoardUser;
