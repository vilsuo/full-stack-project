import { useState, useEffect } from 'react';

const Home = () => {
  const [content, setContent] = useState('default content');

  return (
    <div>
      <h3>{content}</h3>
    </div>
  );
};

export default Home;
