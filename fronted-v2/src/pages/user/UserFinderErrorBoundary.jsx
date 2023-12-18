import { useRouteError } from "react-router-dom";

const UserFinderErrorBoundary = () => {
  const error = useRouteError();

  let { message } = error.response.data;

  return (
    <div className='error-boundary'>
      <h3>Error</h3>
      { message 
        ? <p>{message}</p>
        : <p>Some error happened while loading the user</p>
      }
    </div>
  );
};

export default UserFinderErrorBoundary;