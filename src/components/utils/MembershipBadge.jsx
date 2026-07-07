const MembershipBadge = ({ isAdmin, isMember, isPending }) => {
  if (isAdmin) return <span className="role-badge badge-admin">Admin</span>;
  if (isMember) return <span className="role-badge badge-member">Miembro</span>;
  if (isPending) return <span className="role-badge badge-pending">⏳ Solicitud Pendiente</span>;
  return null;
};
export default MembershipBadge;