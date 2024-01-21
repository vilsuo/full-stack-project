import { useRouteError } from 'react-router-dom';
import { createErrorMessage } from '../util/error';

const ErrorElement = ({ header }) => {
  const error = useRouteError();

  let message = createErrorMessage(error);

  return (
    <div className='error-boundary'>
      <h3>{ header }</h3>
      <p>{ message }</p>
    </div>
  );
};

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