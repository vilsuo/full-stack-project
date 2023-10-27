import { useState, useEffect } from "react";

import contentService from "../services/content";
import { useDispatch } from "react-redux";
import { logout } from "../reducers/user";

const BoardUser = () => {
  const [content, setContent] = useState("");

  const dispatch = useDispatch();

  useEffect(() => {
    contentService.getUserBoard().then(
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
          dispatch(logout())
            .unwrap()
            .then((user) => {
              console.log('logout link success', user)
            })
            .catch((error) => {
              console.log('logout link error', error);
            });
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
