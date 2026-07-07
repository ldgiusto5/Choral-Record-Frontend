const RoleBadge = ({ role }) => {
  const isAdmin = role === 'admin';
  const badgeClass = isAdmin ? 'role-badge-admin' : 'role-badge-member';
  const badgeLabel = isAdmin ? 'Admin' : 'Miembro';

  return (
    <span className={`role-badge ${badgeClass}`}>
      {badgeLabel}
    </span>
  );
};

export default RoleBadge;