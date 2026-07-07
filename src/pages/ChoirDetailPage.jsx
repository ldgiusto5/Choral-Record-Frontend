import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  getChoirById, 
  joinChoir, 
  getChoirMembers, 
  getChoirRequests, 
  respondToJoinRequest,
  getChoirEvents,
  getPublicChoirEvents,
  getChoirPieces,
  deleteChoirEvent,
  deleteChoirPiece,
  swapPieces,
  deleteChoir,
  removeChoirMember,
  followChoir,
  unfollowChoir
} from '../api/api';
import Navbar from '../components/Navbar';
import EventCard from '../components/EventCard';
import PieceCard from '../components/PieceCard';
import ChoirHeader from '../components/ChoirHeader';
import ChoirMembersList from '../components/ChoirMembersList';
import ChoirJoinRequests from '../components/ChoirJoinRequests';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import toast from 'react-hot-toast';

const ChoirDetailPage = () => {
  const { id } = useParams();
  const { token, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  const [choir, setChoir] = useState(null);
  const [members, setMembers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [events, setEvents] = useState([]);
  const [publicEvents, setPublicEvents] = useState([]);
  const [pieces, setPieces] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [resolvingRequest, setResolvingRequest] = useState(false);
  const [activeAudio, setActiveAudio] = useState({ pieceId: null, fieldLabel: '', url: '' });
  const [activeLyricsPieceId, setActiveLyricsPieceId] = useState(null);
  const [closingAudioId, setClosingAudioId] = useState(null);
  const [closingLyricsId, setClosingLyricsId] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  // Reordenar piezas (Drag & Drop)
  const [draggedPieceId, setDraggedPieceId] = useState(null);
  const [dragOverPieceId, setDragOverPieceId] = useState(null);

  // Estados para eliminación de coro
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmChoirName, setConfirmChoirName] = useState('');
  const [deleting, setDeleting] = useState(false);

  const toggleLyrics = (pieceId) => {
    if (activeLyricsPieceId === pieceId) {
      setClosingLyricsId(pieceId);
      setTimeout(() => {
        setActiveLyricsPieceId(null);
        setClosingLyricsId(null);
      }, 150);
      return;
    }
    setActiveLyricsPieceId(pieceId);
  };

  const playAudio = (pieceId, fieldLabel, url) => {
    if (activeAudio.pieceId === pieceId && activeAudio.fieldLabel === fieldLabel) {
      setClosingAudioId(pieceId);
      setTimeout(() => {
        setActiveAudio({ pieceId: null, fieldLabel: '', url: '' });
        setClosingAudioId(null);
      }, 150);
      return;
    }
    setActiveAudio({ pieceId, fieldLabel, url });
  };

  const closeAudio = () => {
    if (activeAudio.pieceId) {
      const pieceId = activeAudio.pieceId;
      setClosingAudioId(pieceId);
      setTimeout(() => {
        setActiveAudio({ pieceId: null, fieldLabel: '', url: '' });
        setClosingAudioId(null);
      }, 150);
    }
  };

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Inicia sesión para poder seguir coros');
      navigate('/login');
      return;
    }
    
    try {
      setFollowLoading(true);
      if (isFollowing) {
        const response = await unfollowChoir(id, token);
        setIsFollowing(false);
        setFollowersCount(response.followers_count ?? (prev => Math.max(0, prev - 1)));
        toast.success(response.message || 'Has dejado de seguir a este coro');
      } else {
        const response = await followChoir(id, token);
        setIsFollowing(true);
        setFollowersCount(response.followers_count ?? (prev => prev + 1));
        toast.success(response.message || 'Ahora sigues a este coro');
      }
    } catch (error) {
      toast.error(error.message || 'Error al actualizar el estado de seguimiento');
    } finally {
      setFollowLoading(false);
    }
  };

  const fetchChoirData = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      
      const choirData = await getChoirById(id, token);
      setChoir(choirData);
      setIsFollowing(choirData.is_following === true || choirData.is_following === 1);
      setFollowersCount(choirData.followers_count || 0);

      const isUserMember = choirData.membership && choirData.membership.status === 'accepted';
      const isUserAdmin = choirData.membership && choirData.membership.role === 'admin' && choirData.membership.status === 'accepted';

      try {
        const membersData = await getChoirMembers(id, token);
        setMembers(membersData.data || []);
      } catch (err) {
        console.error('Error fetching members:', err);
      }

      if (isUserMember) {
        try {
          const eventsRes = await getChoirEvents(id, token);
          setEvents(eventsRes.data || []);
        } catch (err) {
          console.error('Error fetching events:', err);
        }

        try {
          const piecesRes = await getChoirPieces(id, token);
          setPieces(piecesRes.data || []);
        } catch (err) {
          console.error('Error fetching pieces:', err);
        }
      } else {
        try {
          const pubEventsRes = await getPublicChoirEvents(id);
          setPublicEvents(pubEventsRes.data || []);
        } catch (err) {
          console.error('Error fetching public events:', err);
        }
      }

      if (isUserAdmin) {
        try {
          const requestsData = await getChoirRequests(id, token);
          setRequests(requestsData.data || []);
        } catch (err) {
          console.error('Error fetching join requests:', err);
        }
      }
    } catch (error) {
      console.error('Error fetching choir detail:', error);
      toast.error(error.message || 'Error al cargar el coro');
      navigate('/');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [id, token, navigate]);

  useEffect(() => {
    fetchChoirData(true);
  }, [fetchChoirData]);

  const handleJoin = async () => {
    if (!isAuthenticated) {
      toast.error('Inicia sesión para unirte a este coro');
      navigate('/login');
      return;
    }

    try {
      setJoining(true);
      const response = await joinChoir(id, token);
      toast.success(response.message || 'Solicitud procesada');
      fetchChoirData();
    } catch (error) {
      toast.error(error.message || 'Error al unirte al coro');
    } finally {
      setJoining(false);
    }
  };

  const handleRequestResponse = async (targetUserId, status) => {
    try {
      setResolvingRequest(true);
      const response = await respondToJoinRequest(id, targetUserId, status, token);
      toast.success(response.message || `Solicitud ${status === 'accepted' ? 'aceptada' : 'rechazada'}`);
      fetchChoirData();
    } catch (error) {
      toast.error(error.message || 'Error al procesar la solicitud');
    } finally {
      setResolvingRequest(false);
    }
  };

  const handleDeleteChoir = async () => {
    if (confirmChoirName !== choir.name) {
      toast.error('El nombre del coro no coincide');
      return;
    }
    
    try {
      setDeleting(true);
      await deleteChoir(id, token);
      toast.success('Coro eliminado correctamente');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Error al eliminar el coro');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleLeaveChoir = async () => {
    if (!window.confirm(`¿Estás seguro de que deseas abandonar el coro "${choir.name}" y dejar de ser miembro?`)) return;
    
    try {
      setLeaving(true);
      await removeChoirMember(id, user.id, token);
      toast.success('Has abandonado el coro correctamente');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Error al abandonar el coro');
    } finally {
      setLeaving(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este evento?')) return;
    try {
      await deleteChoirEvent(id, eventId, token);
      toast.success('Evento eliminado correctamente');
      fetchChoirData();
    } catch (error) {
      toast.error(error.message || 'Error al eliminar el evento');
    }
  };

  const handleDeletePiece = async (pieceId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta pieza del repertorio?')) return;
    try {
      await deleteChoirPiece(id, pieceId, token);
      toast.success('Pieza eliminada correctamente');
      fetchChoirData();
      if (activeAudio.pieceId === pieceId) {
        setActiveAudio({ pieceId: null, fieldLabel: '', url: '' });
      }
    } catch (error) {
      toast.error(error.message || 'Error al eliminar la pieza');
    }
  };

  const swapLocalPieces = (idA, idB) => {
    setPieces(prev => {
      const next = [...prev];
      const idxA = next.findIndex(p => p.id === idA);
      const idxB = next.findIndex(p => p.id === idB);
      if (idxA === -1 || idxB === -1) return prev;
      [next[idxA], next[idxB]] = [next[idxB], next[idxA]];
      return next;
    });
  };

  const handleDragStart = (e, pieceId) => {
    setDraggedPieceId(pieceId);
    e.dataTransfer.effectAllowed = 'move';

    const cardEl = e.currentTarget.closest('.piece-bar-wide');
    if (cardEl) {
      const rect = cardEl.getBoundingClientRect();
      e.dataTransfer.setDragImage(cardEl, rect.width / 2, 24);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e, pieceId) => {
    e.preventDefault();
    if (pieceId !== draggedPieceId) {
      setDragOverPieceId(pieceId);
    }
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverPieceId(null);
    }
  };

  const handleDrop = async (e, targetPieceId) => {
    e.preventDefault();
    setDragOverPieceId(null);
    if (!draggedPieceId || draggedPieceId === targetPieceId) {
      setDraggedPieceId(null);
      return;
    }

    const fromId = draggedPieceId;
    setDraggedPieceId(null);

    swapLocalPieces(fromId, targetPieceId);

    try {
      await swapPieces(id, fromId, targetPieceId, token);
      toast.success('Posición reordenada', { icon: '🎼', duration: 1500 });
    } catch (error) {
      swapLocalPieces(fromId, targetPieceId);
      toast.error(error.message || 'Error al reordenar las piezas');
    }
  };

  const handleDragEnd = () => {
    setDraggedPieceId(null);
    setDragOverPieceId(null);
  };

  const handleSwapClick = async (idx, direction) => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= pieces.length) return;

    const pieceId = pieces[idx].id;
    const targetPieceId = pieces[targetIdx].id;

    swapLocalPieces(pieceId, targetPieceId);

    try {
      await swapPieces(id, pieceId, targetPieceId, token);
    } catch (error) {
      swapLocalPieces(pieceId, targetPieceId);
      toast.error(error.message || 'Error al mover la pieza');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ textAlign: 'center', marginTop: '100px', color: 'var(--text-secondary)' }}>
          Cargando coro...
        </div>
      </>
    );
  }

  if (!choir) {
    return (
      <>
        <Navbar />
        <div style={{ textAlign: 'center', marginTop: '100px', color: 'var(--text-secondary)' }}>
          Coro no encontrado.
        </div>
      </>
    );
  }

  const isAdmin = choir.membership && choir.membership.role === 'admin' && choir.membership.status === 'accepted';
  const isMember = choir.membership && choir.membership.status === 'accepted';
  const isPending = choir.membership && choir.membership.status === 'pending';

  return (
    <>
      <Navbar />

      <main className="main-content" style={{ padding: '0 24px', maxWidth: '1000px', margin: '24px auto 60px auto' }}>
        
        {/* CABECERA */}
        <ChoirHeader 
          choir={choir}
          choirId={id}
          followersCount={followersCount}
          isFollowing={isFollowing}
          followLoading={followLoading}
          isAuthenticated={isAuthenticated}
          isAdmin={isAdmin}
          isMember={isMember}
          isPending={isPending}
          joining={joining}
          onFollowToggle={handleFollowToggle}
          onJoin={handleJoin}
        />

        <div className="staff-divider" style={{ margin: '20px auto' }}></div>

        {/* 1. SECCIÓN DE EVENTOS */}
        {isMember ? (
          <section style={{ marginBottom: '24px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 className="section-title" style={{ margin: 0 }}>📅 Calendario de Eventos</h2>
              {isAdmin && (
                <button className="btn btn-accent" onClick={() => navigate(`/choirs/${id}/events/add`)} style={{ padding: '8px 16px', fontSize: '14px' }}>
                  + Programar Evento
                </button>
              )}
            </div>

            {events.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {events.map(event => (
                  <EventCard 
                    key={event.id}
                    event={event}
                    choirId={id}
                    isAdmin={isAdmin}
                    onDelete={handleDeleteEvent}
                  />
                ))}
              </div>
            ) : (
              <div className="photo-card" style={{ width: '100%', padding: '24px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No hay eventos programados.</p>
              </div>
            )}
          </section>
        ) : publicEvents.length > 0 ? (
          <section style={{ marginBottom: '24px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 className="section-title" style={{ margin: 0 }}>📅 Próximos Eventos Públicos</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {publicEvents.map(event => (
                <EventCard 
                  key={event.id}
                  event={event}
                  choirId={id}
                  isAdmin={false}
                  onDelete={handleDeleteEvent}
                />
              ))}
            </div>
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
                🔒 Únete al coro para ver todos los ensayos y eventos privados.
              </p>
            </div>
          </section>
        ) : null}

        {(isMember || publicEvents.length > 0) && (
          <div className="staff-divider" style={{ margin: '20px auto' }}></div>
        )}

        {/* 2. SECCIÓN DE PARTITURAS */}
        {isMember ? (
          <section style={{ marginBottom: '24px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 className="section-title" style={{ margin: 0 }}>📂 Repertorio Musical</h2>
              {isAdmin && (
                <button className="btn btn-accent" onClick={() => navigate(`/choirs/${id}/pieces/add`)} style={{ padding: '8px 16px', fontSize: '14px' }}>
                  + Añadir Pieza
                </button>
              )}
            </div>

            {pieces.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {pieces.map((piece, idx) => (
                  <PieceCard 
                    key={piece.id}
                    piece={piece}
                    index={idx}
                    totalPieces={pieces.length}
                    choirId={id}
                    isAdmin={isAdmin}
                    draggedPieceId={draggedPieceId}
                    dragOverPieceId={dragOverPieceId}
                    activeAudio={activeAudio}
                    activeLyricsPieceId={activeLyricsPieceId}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    onSwapClick={handleSwapClick}
                    onDelete={handleDeletePiece}
                    onPlayAudio={playAudio}
                    onToggleLyrics={toggleLyrics}
                    onCloseAudio={closeAudio}
                    closingAudioId={closingAudioId}
                    closingLyricsId={closingLyricsId}
                  />
                ))}
              </div>
            ) : (
              <div className="photo-card" style={{ width: '100%', padding: '24px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No hay partituras cargadas en el repertorio todavía.</p>
              </div>
            )}
          </section>
        ) : (
          <div className="photo-card" style={{ width: '100%', padding: '24px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', textAlign: 'center', marginBottom: '24px' }}>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>🔒 Únete al coro para descargar las partituras y reproducir las voces de ensayo.</p>
          </div>
        )}

        <div className="staff-divider" style={{ margin: '20px auto' }}></div>

        {/* 3. SECCIÓN DE MIEMBROS Y SOLICITUDES */}
        <div style={{ display: 'grid', gridTemplateColumns: isAdmin && requests.length > 0 ? '1fr 320px' : '1fr', gap: '32px' }}>
          
          <ChoirMembersList members={members} />

          {isAdmin && requests.length > 0 && (
            <ChoirJoinRequests 
              requests={requests} 
              resolvingRequest={resolvingRequest} 
              onRequestResponse={handleRequestResponse} 
            />
          )}

        </div>

        {/* Botones de membresía (Salir/Eliminar Coro) */}
        {isAuthenticated && isMember && (
          <div style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
            {members.length > 1 && (
              <button 
                className="btn" 
                style={{ 
                  background: 'transparent', 
                  color: 'var(--danger)', 
                  border: '1px solid var(--danger)', 
                  padding: '10px 24px', 
                  fontSize: '14px', 
                  borderRadius: 'var(--radius-md)', 
                  fontWeight: '600', 
                  cursor: 'pointer' 
                }}
                onClick={handleLeaveChoir}
                disabled={leaving}
              >
                {leaving ? 'Abandonando...' : 'Salir del Coro'}
              </button>
            )}

            {isAdmin && (
              <button 
                className="btn" 
                style={{ 
                  background: 'var(--danger)', 
                  color: '#ffffff', 
                  padding: '10px 24px', 
                  fontSize: '14px', 
                  border: 'none', 
                  borderRadius: 'var(--radius-md)', 
                  fontWeight: '600', 
                  cursor: 'pointer' 
                }}
                onClick={() => setShowDeleteModal(true)}
              >
                Eliminar Coro
              </button>
            )}
          </div>
        )}
      </main>

    {/* Modal de confirmación de eliminación de coro */}
    <DeleteConfirmationModal 
      isOpen={showDeleteModal}
      title={`¿Eliminar el coro "${choir.name}"?`}
      warningText={
        <>
          Si eliminas este coro:
          <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
            <li>Todos los miembros serán expulsados de forma permanente.</li>
            <li>Todas las partituras y repertorios asociados serán completamente borrados.</li>
            <li>Todos los eventos programados se cancelarán y eliminarán.</li>
          </ul>
        </>
      }
      verificationLabel="Para confirmar, escribe el nombre del coro exactamente como se muestra a continuación:"
      expectedValue={choir.name}
      inputValue={confirmChoirName}
      onInputChange={setConfirmChoirName}
      onCancel={() => { setShowDeleteModal(false); setConfirmChoirName(''); }}
      onConfirm={handleDeleteChoir}
      isDeleting={deleting}
      confirmButtonText="Eliminar Coro"
    />
    </>
  );
};

export default ChoirDetailPage;