import { useState, useEffect } from 'react';

import contentService from '../services/content';

const Home = () => {
  const [content, setContent] = useState('');

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await contentService.getPublicContent();
        setContent(data);

      } catch (error) {
        const _content =
          (error.response && error.response.data) ||
          error.message ||
          error.toString();

        setContent(_content);
      }
    };

    getData();
  }, []);

  return (
    <div>
      <h3>{content}</h3>
    </div>
  );
};

export default Home;
