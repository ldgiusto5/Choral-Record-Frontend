import { Link } from 'react-router-dom';
import RoleBadge from './utils/RoleBadge';

const ChoirMembersList = ({ members }) => {
  return (
    <div className="photo-card choir-members-card">
      <h2 className="section-title choir-members-title">
        Miembros del Coro ({members.length})
      </h2>
      
      {members.length > 0 ? (
        <div className="choir-members-list">
          {members.map(member => (
            <div key={member.user_id} className="choir-member-item">
              <Link to={`/profile/${member.username || member.user_id}`} className="choir-member-link">
                <div className="choir-member-avatar">
                  <img 
                    src={member.profile_image_url || 'http://localhost:3000/assets/default-avatar.png'} 
                    alt={member.name} 
                    className="avatar-img"
                  />
                </div>
                <div className="choir-member-info">
                  <h4 className="choir-member-name">{member.name}</h4>
                  <span className="choir-member-username">@{member.username}</span>
                </div>
              </Link>
              <div>
                <RoleBadge role={member.role} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="choir-members-empty">No hay miembros activos en este coro.</p>
      )}
    </div>
  );
};

export default ChoirMembersList;