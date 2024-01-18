import { Link, useLoaderData } from 'react-router-dom';
import statisticsService from '../services/statistics';

export const statisticsLoader = async () => {
  return await statisticsService.getCounts();
};

/*
write short description of app

talk about...
- 'PostgreSQL hosted by ElephantSql',
- 'Redis hosted by Redist Cloud',
*/
const about = '';

const technologies = {
  'Frontend': [
    {
      href: 'https://www.npmjs.com/package/react-router-dom',
      title: 'React Router DOM',
      description: 'React Router is a lightweight, fully-featured routing library for the React JavaScript library. React Router runs everywhere that React runs; on the web, on the server (using node.js), and on React Native.'
    },
    {
      href: 'https://www.npmjs.com/package/redux',
      title: 'Redux',
      description: 'Redux is a predictable state container for JavaScript apps.'
    },
    {
      href: 'https://www.npmjs.com/package/axios',
      title: 'Axios',
      description: 'Axios is a simple promise based HTTP client for the browser and node.js. Axios provides a simple to use library in a small package with a very extensible interface.'
    },
  ],
  'Backend': [
    {
      href: 'https://www.npmjs.com/package/bcrypt',
      title: 'BCrypt',
      description: 'A library to help you hash passwords.'
    },
    {
      href: 'https://www.npmjs.com/package/dotenv',
      title: 'Dotenv',
      description: 'Loads environment variables.'
    },
    {
      href: 'https://www.npmjs.com/package/express-session',
      title: 'Express Session',
      description: 'Session management.'
    },
    {
      href: 'https://www.npmjs.com/package/multer',
      title: 'Multer',
      description: 'Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files. Axios provides a simple to use library in a small package with a very extensible interface.'
    },
  ],
  'Database': [
    {
      href: 'https://www.npmjs.com/package/pg',
      title: 'Pg',
      description: 'Non-blocking PostgreSQL client for Node.js.'
    },
    {
      href: 'https://www.npmjs.com/package/connect-redis',
      title: 'Connect Redis',
      description: 'Redis session storage for Express.'
    },
    {
      href: 'https://www.npmjs.com/package/sequelize',
      title: 'Sequelize',
      description: 'Sequelize is an easy-to-use and promise-based Node.js ORM tool for Postgres, MySQL, MariaDB, SQLite, DB2, Microsoft SQL Server, and Snowflake. It features solid transaction support, relations, eager and lazy loading, read replication and more.'
    },
    {
      href: 'https://www.npmjs.com/package/umzug',
      title: 'Umzug',
      description: 'Umzug is a framework-agnostic migration tool for Node. It provides a clean API for running and rolling back tasks.'
    },
  ],
  'Testing': [
    {
      href: 'https://www.npmjs.com/package/jest',
      title: 'Jest',
      description: 'JavaScript Testing Framework.'
    },
    {
      href: 'https://www.npmjs.com/package/supertest',
      title: 'SuperTest',
      description: 'HTTP testing.'
    },
    {
      href: 'https://www.docker.com/',
      title: 'Docker',
      description: 'Postgres and Redis in Docker container.'
    },
  ],
};

const TechStack = () => {
  
  return (
    <div className='container'>
      <h3>Technologies used</h3>

      {
        Object.keys(technologies).map(header =>
          <div key={header}>
            <h3>{header}</h3>
            { technologies[header].map(tech =>
              <div key={tech.title} className='technology'>
                <a href={tech.href}>{tech.title}</a>
                <p>
                  {tech.description}
                </p>
              </div>
            )}
          </div>
        )
      }

      {/*
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
      */}
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
        You can view all the details about the tables in <Link to={dbdocks}>DB Docks</Link>.
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