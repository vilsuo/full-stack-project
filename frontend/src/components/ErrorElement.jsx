import { useNavigate, useRouteError } from 'react-router-dom';
import { createErrorMessage } from '../util/error';

const ErrorElement = ({ header }) => {
  const error = useRouteError();
  const message = error ? createErrorMessage(error) : undefined;

  const navigate = useNavigate();

  return (
    <div className='container error-element'>
      <h2>{ header }</h2>
    
      <p className='italic'>{ message }</p>

      <button onClick={ () => navigate('/') }>Home</button>
    </div>
  );
};

export default ErrorElement;

// USER
export const UserErrorElement = () => {
  return <ErrorElement header='Error happened while loading the user' />
};

// IMAGES
export const ImagesErrorElement = () => {
  return <ErrorElement header='Error happened while loading the images' />
};

export const ImageErrorElement = () => {
  return <ErrorElement header='Error happened while loading the image' />
};

// RELATIONS
export const RelationsErrorElement = () => {
  return <ErrorElement header='Error happened while loading the relations' />
};