import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { FaLock } from 'react-icons/fa';

import util from '../../util';
import { IMAGE_PRIVATE, OPTION_NONE } from '../../constants';
import ImagesFilterGroup from './ImagesFilterGroup';

const ImageList = ({ user, images, showExtra }) => {
  const [filter, setFilter] = useState('none');

  const navigate = useNavigate();

  const handleClick = (image) => {
    const { username } = user;
    navigate(`/users/${username}/images/${image.id}`);
  };

  return (
    <div className='container'>
      <h3>Images</h3>

      { showExtra && <ImagesFilterGroup filter={filter} setFilter={setFilter} /> }

      <table className='image-table navigable'>
        <thead>
          <tr>
            { showExtra && <th className='icon'></th> }
            <th className='title'>Title</th>
            <th className='date'>Created</th>
          </tr>
        </thead>
        <tbody>
          {images
            .filter(image => (filter === OPTION_NONE.value) ? true : image.privacy === filter)
            .map(image => (
              <tr key={image.id} onClick={() => handleClick(image)}>
                { showExtra && <td className='table-icon icon'>
                  { image.privacy === IMAGE_PRIVATE.value && <FaLock /> }
                </td> }
                <td className='title'>{image.title}</td>
                <td className='date'>{util.formatDate(image.createdAt)}</td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
};

export default ImageList;