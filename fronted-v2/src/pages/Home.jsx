
const Home = () => {

  return (
    <div className='home'>
      <h2>Home page</h2>
      <ul>
        {[...Array(100).keys()].map(int => (
          <li key={int}>{int}</li>
        ))}
      </ul>
    </div>
  );
};

export default Home;