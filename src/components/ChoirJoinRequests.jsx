const ChoirJoinRequests = ({ requests, resolvingRequest, onRequestResponse }) => {
  if (!requests || requests.length === 0) return null;

  return (
    <div className="photo-card join-requests-card">
      <h3 className="join-requests-title">
        🔔 Solicitudes ({requests.length})
      </h3>
      
      <div className="join-requests-list">
        {requests.map(req => (
          <div key={req.user_id} className="join-request-item">
            <div className="join-request-user-info">
              <div className="user-avatar join-request-avatar">
                <img className="avatar-img" src={req.profile_image_url || 'http://localhost:3000/assets/default-avatar.png'} alt={req.name} />
              </div>
              <div className="join-request-text-col">
                <h4 className="join-request-name">{req.name}</h4>
                <span className="join-request-username">@{req.username}</span>
              </div>
            </div>
            
            <div className="join-request-actions">
              <button 
                className="btn btn-accent join-request-btn-accept" 
                onClick={() => onRequestResponse(req.user_id, 'accepted')}
                disabled={resolvingRequest}
              >
                Aceptar
              </button>
              <button 
                className="btn btn-ghost join-request-btn-reject" 
                onClick={() => onRequestResponse(req.user_id, 'rejected')}
                disabled={resolvingRequest}
              >
                Rechazar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChoirJoinRequests;