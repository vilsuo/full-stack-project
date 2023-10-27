import { useState, useEffect } from "react";

import contentService from "../services/content";

const Home = () => {
  const [content, setContent] = useState("");

  useEffect(() => {
    contentService.getPublicContent().then(
      (response) => {
        setContent(response.data);
      },
      (error) => {
        const _content =
          (error.response && error.response.data) ||
          error.message ||
          error.toString();

        setContent(_content);
      }
    );
  }, []);

  return (
    <div>
      <h3>{content}</h3>
    </div>
  );
};

export default Home;
