
import util from '../../util';

const Info = ({ userDetails }) => {
  const { name, username, createdAt } = userDetails;

  return (
    <>
      name: {name}
      username: {username},
      created: {util.formatDate(createdAt)}
    </>
  );
};

export default Info;