import { Link, useLoaderData } from 'react-router-dom';
import statisticsService from '../services/statistics';

export const statisticsLoader = async () => {
  return await statisticsService.getCounts();
};

const TechStack = () => {
  const technologies = {
    'Frontend': [
      'React router dom navigation',
      'Redux state management',
      'Axios HTTP client'
    ],
    'Backend': [
      'BCrypt password encoder',
      'Dotenv environment variables',
      'Express session management',
      'Multer file upload',
    ],
    'Database': [
      'PostgreSQL hosted at ElephantSql',
      'Sequelize object–relational mapper',
      'Umzug migration tool',
      'Redis hosted at Redist Cloud',
    ],
    'Testing': [
      'Jest testing framework',
      'Supertest HTTP testing',
      'Postgres and Redis in Docker container',
    ],
  };

  return (
    <div className='container'>
      <h3>Technologies used</h3>

      {Object.keys(technologies).map((header, idx) =>
        <ul key={'x' + idx}>
          <li>{header}</li>
          <ul>
            {technologies[header].map((technology, idy) =>
            <ul key={'y' + idy}>
              <li>{technology}</li>
            </ul>
            )}
          </ul>
        </ul>
      )}
    </div>
  );
};

const CountTables = () => {
  const { users, images, potraits, relations } = useLoaderData();

  const dbdocks = 'https://dbdocs.io/vilsuo1/Fullstack-project';

  return (
    <div className='container'>
      <h3>Existing entities</h3>
      <p>
        You can view the table details in <Link to={dbdocks}>DB docks</Link>
      </p>
      <div className='count-tables'>
        <table className='count-table'>
          <thead>
            <tr>
              <th colSpan='2'>Users</th>
            </tr>
            <tr>
              <th>active</th>
              <th>disabled</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{users['active']}</td>
              <td>{users['disabled']}</td>
            </tr>
          </tbody>
        </table>

        <table className='count-table'>
          <thead>
            <tr>
              <th colSpan='2'>Images</th>
            </tr>
            <tr>
              <th>public</th>
              <th>private</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{images['public']}</td>
              <td>{images['private']}</td>
            </tr>
          </tbody>
        </table>

        <table className='count-table'>
          <thead>
            <tr>
              <th>Potraits</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{potraits}</td>
            </tr>
          </tbody>
        </table>

        <table className='count-table'>
          <thead>
            <tr>
              <th colSpan='2'>Relations</th>
            </tr>
            <tr>
              <th>follows</th>
              <th>blocks</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{relations['follow']}</td>
              <td>{relations['block']}</td>
            </tr>
          </tbody>
        </table>
      </div>  
    </div>
  );
};

const About = () => {
  const repo = 'https://github.com/vilsuo/full-stack-project';

  return (
    <div className='about'>
      <div className='container'>
        <h2>About</h2>
        <p>
          Full stack practice project. See code at <Link to={repo}>Github</Link>.
        </p>
      </div>

      <TechStack />

      <CountTables />
    </div>
  );
};

export default About;