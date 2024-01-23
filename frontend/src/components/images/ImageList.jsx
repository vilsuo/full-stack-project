import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import util from '../../util';
import { IMAGE_PRIVACIES, IMAGE_PRIVATE, OPTION_NONE } from '../../constants';
import RadioGroup from '../RadioGroup';

import { FaLock, FaSortDown, FaSortUp } from 'react-icons/fa';

const IMAGE_PRIVACY_FILTER_OPTIONS = [
  OPTION_NONE, ...IMAGE_PRIVACIES,
];

// Ascending means smallest to largest, 0 to 9, and/or A to Z 
const SORT_ORDERS = { ASC: 'asc', DESC: 'desc' };

const SortIcon = ({ field, sortedField, sortedOrder }) => {
  if (field !== sortedField) return null;

  return (sortedOrder == SORT_ORDERS.ASC)
    ? <FaSortDown />
    : <FaSortUp />
};

const ImageTableHead = ({ 
    showExtra, sortField, setSortField, sortOrder, setSortOrder
  }) => {

  const handleSortingChange = (columnName) => {
    const order = ((columnName === sortField) && (sortOrder === SORT_ORDERS.DESC))
      ? SORT_ORDERS.ASC
      : SORT_ORDERS.DESC;
    
    setSortField(columnName);
    setSortOrder(order);
  };

  const heads = [
    { label: 'Title', field: 'title', className: 'title' },
    { label: 'Views', field: 'views', className: 'tiny-column' },
    { label: 'Created', field: 'createdAt', className: 'date' }
  ];

  return (
    <thead>
      <tr>
        { showExtra && <th className='icon'></th> }
        { heads.map(head => 
          <th
            key={`ìmage-head-${head.field}`}
            className={head.className}
            onClick={() => handleSortingChange(head.field)}
          >
            <div className='text-icon'>
              <span>{head.label}</span>
              <SortIcon
                field={head.field}
                sortedField={sortField}
                sortedOrder={sortOrder}
              />
            </div>
          </th>
        ) }
      </tr>
    </thead>
  );
};

const ImageList = ({ user, images, showExtra }) => {
  const navigate = useNavigate();

  const [privacyFilter, setPrivacyFilter] = useState(OPTION_NONE.value);

  // sorting
  const [sortedImages, setSortedImages] = useState([]);

  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState(SORT_ORDERS.DESC);

  // handle sorting
  useEffect(() => {
    const sorted = [ ...images ].sort((image1, image2) => {
      return (
        image1[sortField].toString()
          .localeCompare(image2[sortField].toString(), 'en', {
            numeric: true,
          }) * (sortOrder === SORT_ORDERS.ASC ? 1 : -1)
      );
    });

    setSortedImages(sorted);
  }, [images, sortField, sortOrder]);

  const handleClick = (image) => {
    const { username } = user;
    navigate(`/users/${username}/images/${image.id}`);
  };

  // filter image privacy
  const filteredImages = sortedImages.filter(image => 
    (privacyFilter === OPTION_NONE.value) ? true : (image.privacy === privacyFilter)
  );

  return (
    <div className='container'>
      <h2>Images</h2>

      { showExtra && (
        <RadioGroup
          options={IMAGE_PRIVACY_FILTER_OPTIONS}
          value={privacyFilter}
          setValue={setPrivacyFilter}
          optionName={'Image Privacy'}
        />
      )}

      <p>Images: { filteredImages.length }</p>

      <table className='navigable'>
        <ImageTableHead
          showExtra={showExtra}
          sortField={sortField} setSortField={setSortField}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
        />
        <tbody>
          {filteredImages
            .map(image => (
              <tr key={image.id} onClick={() => handleClick(image)}>
                { showExtra && <td className='icon lock-icon'>
                  { image.privacy === IMAGE_PRIVATE.value && <FaLock /> }
                </td> }
                <td className='title'>{image.title}</td>
                <td className='tiny-column'>{image.views}</td>
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