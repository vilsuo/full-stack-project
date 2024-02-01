import { useEffect, useState } from 'react';
import { useLoaderData, useNavigate, useOutletContext } from 'react-router-dom';

import imagesService from '../../../services/images';
import ToggleButton from '../../../components/ToggleButton';
import ImageChips from '../../../components/images/ImageChips';
import Alert from '../../../components/Alert';
import { createErrorMessage } from '../../../util/error';
import RadioGroup from '../../../components/RadioGroup';
import { IMAGE_PRIVACIES } from '../../../constants';
import IconButton from '../../../components/IconButton';

import { FaEdit, FaTrash } from 'react-icons/fa';
import ToolTip from '../../../components/ToolTip';
import Spinner from '../../../components/Spinner';

export const imageContentLoader = async ({ params }) => {
  const { username, imageId } = params;
  const image = await imagesService.getImage(username, imageId);
  const content = await imagesService.getImageContent(username, imageId);

  return { image, content };
};

const ImageViewing = ({ user, image, imageUrl }) => {
  const { title, caption, views } = image;

  return (
    <div className='image-view'>
      <h2>{title}</h2>

      <img src={imageUrl}/>

      <div className='info'>
        <ImageChips user={user} image={image} />

        <span className='views'>{views} views</span>
      </div>

      <p className='text'>{caption}</p>
    </div>
  );
};

const ImageEditing = ({ image, handleEdit }) => {
  const [title, setTitle] = useState(image.title);
  const [caption, setCaption] = useState(image.caption);
  const [privacy, setPrivacy] = useState(image.privacy);

  const [changeMade, setChangeMade] = useState(false);

  return (
    <div className='image-edit'>
      <label>
        <span>Title:</span>
        <input
          type='text'
          value={title}
          onChange={ ({ target }) => { setTitle(target.value); setChangeMade(true); }}
        />
      </label>

      <label>
        <span>Caption:</span>
        <textarea
          value={caption}
          onChange={ ({ target }) => { setCaption(target.value); setChangeMade(true); }}
        />
      </label>

      <RadioGroup
        options={IMAGE_PRIVACIES}
        value={privacy}
        setValue={(value) => { setPrivacy(value); setChangeMade(true); }}
        optionName={'Privacy'}
      />

      <button
        disabled={!changeMade}
        onClick={() => handleEdit({ title, caption, privacy })}
      >
        Save
      </button>
    </div>
  );
};

const Image = () => {
  const { user, authenticatedUser } = useOutletContext();
  const { image: loadedImage, content } = useLoaderData();

  const [image, setImage] = useState(loadedImage);
  const [imageUrl, setImageUrl] = useState();

  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const [alert, setAlert] = useState({});
  const clearAlert = () => setAlert({});

  const navigate = useNavigate();

  useEffect(() => {
    if (content) setImageUrl(URL.createObjectURL(content));

    return () => { if (imageUrl) URL.revokeObjectURL(imageUrl); }
  }, []);

  const canEdit = authenticatedUser && (authenticatedUser.id === image.userId);

  const handleRemove = async (image) => {
    if (loading) return null;
    setLoading(true);

    if (confirm('Are you sure you want to delete the image?')) {
      try {
        await imagesService.deleteImage(user.username, image.id);
        navigate(`/users/${user.username}/images`, { replace: true });
  
      } catch (error) {
        setAlert({
          type: 'error',
          prefix: 'Removing image failed',
          details: createErrorMessage(error),
        });
      }
    }

    setLoading(false);
  };

  const handleEdit = async (values) => {
    if (loading) return null;
    setLoading(true);

    try {
      const editedImage = await imagesService.editImage(user.username, image.id, values);
      setEditing(false);
      setImage(editedImage);

      setAlert({
        type: 'success',
        prefix: 'Edited image',
      });

    } catch (error) {
      setAlert({
        type: 'error',
        prefix: 'Editing image failed',
        details: createErrorMessage(error),
      });
    }

    setLoading(false);
  };

  return (
    <div className='image-page container'>

      <div className='edit-actions'>
        { canEdit && (
          <ToolTip tooltipText={!editing ? 'edit' : 'cancel'}>
            <ToggleButton
              toggled={editing}
              setToggled={setEditing}
            >
              <FaEdit  />
            </ToggleButton>
          </ToolTip>
        )}

        { editing && (
          <ToolTip tooltipText='delete'>
            <IconButton
              className='action-button'
              onClick={ () => handleRemove(image) }
            >
              <FaTrash />
            </IconButton>
          </ToolTip>
        )}

        { loading && <Spinner /> }
      </div>

      <Alert alert={alert} clearAlert={clearAlert} />

      { 
        editing
        ? <ImageEditing
            image={image}
            handleEdit={handleEdit}
          />
        : <ImageViewing
            user={user}
            image={image}
            imageUrl={imageUrl}
          />
      }

    </div>
  );
};

export default Image;