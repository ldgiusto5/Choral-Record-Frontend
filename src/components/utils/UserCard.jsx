import { Link } from 'react-router-dom';
import { BACKEND_URL } from '../../api/api';

const UserCard = ({ userItem }) => {
  return (
    <Link to={`/profile/${userItem.username || userItem.id}`} className="user-card-link">
      <div className="photo-card user-card">
        <div className="user-card-avatar">
          <img
            src={userItem.profile_image_url || `${BACKEND_URL}/assets/default-avatar.png`}
            alt={userItem.name}
            className="avatar-img"
          />
        </div>
        <div className="user-card-info">
          <h4 className="user-card-name">{userItem.name}</h4>
          <span className="user-card-username">@{userItem.username}</span>
        </div>
      </div>
    </Link>
  );
};

export default UserCard;
