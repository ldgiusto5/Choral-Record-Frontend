import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  getUserProfile, 
  updateProfile, 
  deleteProfileImage, 
  getMyChoirs, 
  getExternalUserChoirs, 
  deleteUserProfile, 
  getFollowedChoirs, 
  getExternalUserFollowedChoirs,
  logoutAllDevices,
  BACKEND_URL
} from '../api/api';
import Navbar from '../components/Navbar';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import toast from 'react-hot-toast';
import ChoirCard from '../components/ChoirCard';
import ProfileHeader from '../components/ProfileHeader';
import ProfileEditForm from '../components/ProfileEditForm';
import Pagination from '../components/utils/Pagination';

const ProfilePage = () => {
  const { usernameOrId } = useParams();
  const { user: currentUser, token, updateUserLocalState, isAuthenticated, logout, loading: loadingAuth } = useAuth();
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState(null);
  const [choirs, setChoirs] = useState([]);
  const [followedChoirs, setFollowedChoirs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingChoirs, setLoadingChoirs] = useState(true);
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'followed' | 'edit'

  // Formulario de edición
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editFile, setEditFile] = useState(null);
  const [editPreview, setEditPreview] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Estados para eliminación de usuario
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmUsername, setConfirmUsername] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [loggingOutAll, setLoggingOutAll] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Estados de paginación
  const [infoPage, setInfoPage] = useState(1);
  const [followedPage, setFollowedPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  // Resetear páginas de pestañas
  useEffect(() => {
    setInfoPage(1);
    setFollowedPage(1);
  }, [usernameOrId, activeTab]);

  const fileInputRef = useRef(null);

  const targetId = usernameOrId || (currentUser?.username || currentUser?.id);

  const fetchProfileData = useCallback(async () => {
    if (loadingAuth) return;
    if (!isAuthenticated) {
      toast.error('Inicia sesión para ver perfiles');
      navigate('/login');
      return;
    }
    try {
      setLoading(true);
      setLoadingChoirs(true);
      const userData = await getUserProfile(targetId, token);
      setProfileUser(userData);
      setEditName(userData.name || '');
      setEditUsername(userData.username || '');
      setEditDescription(userData.description || '');
      setEditPreview(userData.profile_image_url || null);

      let choirsResponse;
      if (userData.isOwner) {
        choirsResponse = await getMyChoirs(token);
        try {
          const followedRes = await getFollowedChoirs(token);
          setFollowedChoirs(followedRes.data || []);
        } catch (err) {
          console.error('Error al cargar coros seguidos:', err);
        }
      } else {
        choirsResponse = await getExternalUserChoirs(userData.id, token);
        try {
          const followedRes = await getExternalUserFollowedChoirs(userData.username || userData.id, token);
          setFollowedChoirs(followedRes.data || []);
        } catch (err) {
          console.error('Error al cargar coros seguidos externos:', err);
        }
      }
      setChoirs(choirsResponse.data || []);
    } catch (error) {
      toast.error(error.message || 'Error al cargar perfil');
      if (error.message?.includes('No autorizado') || error.message?.includes('token')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
      setLoadingChoirs(false);
    }
  }, [targetId, token, isAuthenticated, loadingAuth, navigate]);

  useEffect(() => { fetchProfileData(); }, [fetchProfileData]);

  /* ── Image handling ─────────────────────────────────────────────────── */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 5MB');
      return;
    }
    setEditFile(file);
    setEditPreview(URL.createObjectURL(file));
  };

  const handleDeleteOrClearImage = async (e) => {
    if (e) e.preventDefault();
    if (editFile) {
      // Cancelar selección local
      setEditFile(null);
      setEditPreview(profileUser.profile_image_url || `${BACKEND_URL}/assets/default-avatar.png`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast.success('Selección de imagen cancelada');
    } else if (profileUser.user_image) {
      // Eliminar del servidor
      if (!window.confirm('¿Seguro que deseas eliminar tu imagen de perfil?')) return;
      try {
        setUpdating(true);
        const response = await deleteProfileImage(profileUser.id, token);
        toast.success(response.message || 'Imagen eliminada');
        const freshUser = { ...profileUser, user_image: null, profile_image_url: `${BACKEND_URL}/assets/default-avatar.png` };
        setProfileUser(freshUser);
        updateUserLocalState(freshUser);
        setEditPreview(freshUser.profile_image_url);
        setEditFile(null);
      } catch (error) {
        toast.error(error.message || 'Error al eliminar la imagen');
      } finally {
        setUpdating(false);
      }
    }
  };

  /* ── Save profile ───────────────────────────────────────────────────── */
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim()) { toast.error('El nombre no puede estar vacío'); return; }
    if (!editUsername.trim()) { toast.error('El nombre de usuario no puede estar vacío'); return; }
    try {
      setUpdating(true);
      const formData = new FormData();
      formData.append('name', editName);
      formData.append('username', editUsername);
      formData.append('description', editDescription);
      if (editFile) formData.append('user_image', editFile);

      if (currentPassword) {
        if (!newPassword || !confirmPassword) {
          toast.error('Debes proporcionar la nueva contraseña y su confirmación');
          setUpdating(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          toast.error('Las nuevas contraseñas no coinciden');
          setUpdating(false);
          return;
        }
        formData.append('currentPassword', currentPassword);
        formData.append('newPassword', newPassword);
        formData.append('confirmPassword', confirmPassword);
      }

      const response = await updateProfile(profileUser.id, formData, token);
      toast.success(response.message || 'Perfil actualizado correctamente');

      const freshUser = { ...profileUser, name: editName, username: editUsername, description: editDescription };
      if (response.user?.user_image) {
        freshUser.profile_image_url = `${BACKEND_URL}/uploads/profiles/${response.user.user_image}`;
        freshUser.user_image = response.user.user_image;
      }
      setProfileUser(freshUser);
      updateUserLocalState(freshUser);
      setEditFile(null);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setActiveTab('info');
      fetchProfileData();
    } catch (error) {
      toast.error(error.message || 'Error al actualizar el perfil');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (confirmUsername !== profileUser.username) {
      toast.error('El nombre de usuario no coincide');
      return;
    }

    const isSelf = Number(profileUser.id) === Number(currentUser.id);

    try {
      setDeleting(true);
      const response = await deleteUserProfile(profileUser.id, token, isSelf);
      toast.success(response.message || 'Usuario eliminado correctamente');
      
      if (isSelf) {
        logout();
        navigate('/');
      } else {
        navigate('/');
      }
    } catch (error) {
      toast.error(error.message || 'Error al eliminar the usuario');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    if (!window.confirm('¿Seguro que deseas cerrar la sesión en todos los dispositivos? Deberás volver a iniciar sesión.')) {
      return;
    }
    
    try {
      setLoggingOutAll(true);
      await logoutAllDevices(token);
      toast.success('Sesiones cerradas correctamente');
      logout();
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Error al cerrar las sesiones');
    } finally {
      setLoggingOutAll(false);
    }
  };

  /* ── Guards ─────────────────────────────────────────────────────────── */
  if (loading) return (
    <><Navbar /><div className="text-secondary-center-msg">Cargando perfil...</div></>
  );
  if (!profileUser) return (
    <><Navbar /><div className="text-secondary-center-msg">Usuario no encontrado.</div></>
  );

  /* ── Derived state ──────────────────────────────────────────────────── */
  const currentPreview = activeTab === 'edit' ? editPreview : profileUser.profile_image_url;

  const paginatedChoirs = choirs.slice((infoPage - 1) * ITEMS_PER_PAGE, infoPage * ITEMS_PER_PAGE);
  const paginatedFollowedChoirs = followedChoirs.slice((followedPage - 1) * ITEMS_PER_PAGE, followedPage * ITEMS_PER_PAGE);

  return (
    <>
      <Navbar />

      <main className="main-content profile-page-main">

        {/* ── Cabecera de perfil ─────────────────────────────────────── */}
        <ProfileHeader 
          profileUser={profileUser}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentPreview={currentPreview}
        />

        <div className="staff-divider profile-divider-spacing" />

        {/* ── Tab 1: Coros ──────────────────────────────────────────── */}
        {activeTab === 'info' && (
          <section className="profile-grid-section">
            <h2 className="section-title profile-grid-title">
              {profileUser.isOwner ? 'Mis Coros' : `Coros de ${profileUser.name}`}
            </h2>

            {loadingChoirs ? (
              <p className="text-secondary">Cargando coros...</p>
            ) : choirs.length > 0 ? (
              <>
                <div className="profile-grid-container">
                  {paginatedChoirs.map(choir => (
                    <ChoirCard key={choir.id} choir={choir} />
                  ))}
                </div>
                <Pagination 
                  currentPage={infoPage} 
                  totalItems={choirs.length} 
                  itemsPerPage={ITEMS_PER_PAGE} 
                  onPageChange={setInfoPage} 
                />
              </>
            ) : (
              <div className="empty-state">
                <p>No pertenece a ningún coro todavía.</p>
              </div>
            )}
          </section>
        )}

        {/* ── Tab 3: Coros Seguidos ─────────────────────────────────── */}
        {activeTab === 'followed' && (
          <section className="profile-grid-section">
            <h2 className="section-title profile-grid-title">
              {profileUser.isOwner ? 'Coros que Sigo' : `Coros que sigue ${profileUser.name}`}
            </h2>

            {loadingChoirs ? (
              <p className="text-secondary">Cargando coros seguidos...</p>
            ) : followedChoirs.length > 0 ? (
              <>
                <div className="profile-grid-container">
                  {paginatedFollowedChoirs.map(choir => (
                    <ChoirCard key={choir.id} choir={choir} />
                  ))}
                </div>
                <Pagination 
                  currentPage={followedPage} 
                  totalItems={followedChoirs.length} 
                  itemsPerPage={ITEMS_PER_PAGE} 
                  onPageChange={setFollowedPage} 
                />
              </>
            ) : (
              <div className="empty-state">
                <p>
                  {profileUser.isOwner ? 'No sigues a ningún coro todavía.' : 'Este usuario no sigue a ningún coro todavía.'}
                </p>
              </div>
            )}
          </section>
        )}

        {/* ── Tab 2: Editar perfil ───────────────────────────────────── */}
        {profileUser.isOwner && activeTab === 'edit' && (
          <ProfileEditForm 
            onSubmit={handleUpdateProfile}
            editName={editName}
            setEditName={setEditName}
            editUsername={editUsername}
            setEditUsername={setEditUsername}
            editDescription={editDescription}
            setEditDescription={setEditDescription}
            editPreview={editPreview}
            editFile={editFile}
            profileUser={profileUser}
            updating={updating}
            handleDeleteOrClearImage={handleDeleteOrClearImage}
            handleFileChange={handleFileChange}
            fileInputRef={fileInputRef}
            onCancel={() => {
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
              setActiveTab('info');
            }}
            currentPassword={currentPassword}
            setCurrentPassword={setCurrentPassword}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
          />
        )}

        {/* Botón para cerrar sesión en todos los dispositivos */}
        {profileUser.isOwner && (
          <div className="profile-logout-all-section">
            <button 
              className="btn btn-secondary profile-logout-all-btn" 
              onClick={handleLogoutAllDevices}
              disabled={loggingOutAll}
            >
              {loggingOutAll ? 'Cerrando sesiones...' : 'Cerrar sesión en todos los dispositivos'}
            </button>
          </div>
        )}

        {/* Botón para eliminar cuenta / usuario */}
        {(profileUser.isOwner || currentUser?.role === 'admin') && (
          <div className="profile-delete-section">
            <button 
              className="btn profile-delete-btn" 
              onClick={() => setShowDeleteModal(true)}
            >
              {profileUser.isOwner ? 'Eliminar mi cuenta' : 'Eliminar usuario'}
            </button>
          </div>
        )}
      </main>

      {/* Modal de confirmación de eliminación de usuario */}
      <DeleteConfirmationModal 
        isOpen={showDeleteModal}
        title={profileUser.isOwner ? '¿Eliminar tu cuenta de usuario?' : `¿Eliminar la cuenta de "${profileUser.name}"?`}
        warningText={
          <>
            Al eliminar esta cuenta:
            <ul className="profile-delete-warning-list">
              <li>Será {profileUser.isOwner ? 'expulsado' : 'expulsado el usuario'} de todos los coros a los que pertenece.</li>
              <li>Se borrarán permanentemente todos sus datos de perfil.</li>
              <li><strong>No podrás</strong> eliminar la cuenta si {profileUser.isOwner ? 'eres' : 'el usuario es'} el único administrador de algún coro.</li>
            </ul>
          </>
        }
        verificationLabel="Para confirmar, escribe el nombre de usuario a continuación:"
        expectedValue={profileUser.username}
        inputValue={confirmUsername}
        onInputChange={setConfirmUsername}
        onCancel={() => { setShowDeleteModal(false); setConfirmUsername(''); }}
        onConfirm={handleDeleteUser}
        isDeleting={deleting}
        confirmButtonText="Eliminar Cuenta"
      />
    </>
  );
};

export default ProfilePage;
