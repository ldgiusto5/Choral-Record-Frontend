import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getChoirById, createChoirPiece } from '../api/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import ToggleSwitch from '../components/utils/ToggleSwitch';
import SettingToggleCard from '../components/utils/SettingToggleCard';
import FormActionButtons from '../components/utils/FormActionButtons';
import FileUploaderInput from '../components/utils/FileUploaderInput';
import toast from 'react-hot-toast';

const AddPiecePage = () => {
  const { id } = useParams();
  const { token, isAuthenticated, loading: loadingAuth } = useAuth();
  const navigate = useNavigate();

  const [choir, setChoir] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [hasLyrics, setHasLyrics] = useState(false);
  const [lyrics, setLyrics] = useState('');
  
  const [partitura, setPartitura] = useState(null);
  const [vozCoral, setVozCoral] = useState(null);
  const [vozSoprano, setVozSoprano] = useState(null);
  const [vozSoprano2, setVozSoprano2] = useState(null);
  const [vozContralto, setVozContralto] = useState(null);
  const [vozContralto2, setVozContralto2] = useState(null);
  const [vozTenor, setVozTenor] = useState(null);
  const [vozTenor2, setVozTenor2] = useState(null);
  const [vozBajo, setVozBajo] = useState(null);
  const [vozBajo2, setVozBajo2] = useState(null);
  const [baseInstrumental, setBaseInstrumental] = useState(null);
  const [infoAdicional, setInfoAdicional] = useState(null);

  const [hasDivSoprano, setHasDivSoprano] = useState(false);
  const [hasDivContralto, setHasDivContralto] = useState(false);
  const [hasDivTenor, setHasDivTenor] = useState(false);
  const [hasDivBajo, setHasDivBajo] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Modos de entrada: 'file' o 'url'
  const [audioModes, setAudioModes] = useState({
    vozCoral: 'file',
    baseInstrumental: 'file',
    vozSoprano: 'file',
    vozSoprano2: 'file',
    vozContralto: 'file',
    vozContralto2: 'file',
    vozTenor: 'file',
    vozTenor2: 'file',
    vozBajo: 'file',
    vozBajo2: 'file'
  });

  useEffect(() => {
    if (loadingAuth) return;
    if (!isAuthenticated) { navigate('/login'); return; }

    const checkAdminPermission = async () => {
      try {
        setLoading(true);
        const choirData = await getChoirById(id, token);
        setChoir(choirData);
        if (!(choirData.membership?.role === 'admin' && choirData.membership?.status === 'accepted')) {
          navigate(`/choirs/${id}`);
        }
      } catch (error) { navigate('/'); } finally { setLoading(false); }
    };
    checkAdminPermission();
  }, [id, token, isAuthenticated, loadingAuth, navigate]);

  const handleFileChange = (e, setter) => {
    if (e.target.files[0]) setter(e.target.files[0]);
  };

  const toggleMode = (field) => {
    setAudioModes(prev => ({
      ...prev,
      [field]: prev[field] === 'file' ? 'url' : 'file'
    }));
    
    const setters = {
      vozCoral: setVozCoral,
      baseInstrumental: setBaseInstrumental,
      vozSoprano: setVozSoprano,
      vozSoprano2: setVozSoprano2,
      vozContralto: setVozContralto,
      vozContralto2: setVozContralto2,
      vozTenor: setVozTenor,
      vozTenor2: setVozTenor2,
      vozBajo: setVozBajo,
      vozBajo2: setVozBajo2
    };
    if (setters[field]) setters[field](null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('name', name);
      formData.append('is_visible', isVisible ? 'true' : 'false');
      formData.append('has_lyrics', hasLyrics ? 'true' : 'false');
      if (hasLyrics) formData.append('lyrics', lyrics);

      if (partitura) formData.append('partitura', partitura);
      if (vozCoral) formData.append('vozCoral', vozCoral);
      if (vozSoprano) formData.append('vozSoprano', vozSoprano);
      if (hasDivSoprano && vozSoprano2) formData.append('vozSoprano2', vozSoprano2);
      if (vozContralto) formData.append('vozContralto', vozContralto);
      if (hasDivContralto && vozContralto2) formData.append('vozContralto2', vozContralto2);
      if (vozTenor) formData.append('vozTenor', vozTenor);
      if (hasDivTenor && vozTenor2) formData.append('vozTenor2', vozTenor2);
      if (vozBajo) formData.append('vozBajo', vozBajo);
      if (hasDivBajo && vozBajo2) formData.append('vozBajo2', vozBajo2);
      if (baseInstrumental) formData.append('baseInstrumental', baseInstrumental);
      if (!hasLyrics && infoAdicional) formData.append('infoAdicional', infoAdicional);

      formData.append('has_div_soprano', hasDivSoprano ? 'true' : 'false');
      formData.append('has_div_contralto', hasDivContralto ? 'true' : 'false');
      formData.append('has_div_tenor', hasDivTenor ? 'true' : 'false');
      formData.append('has_div_bajo', hasDivBajo ? 'true' : 'false');

      await createChoirPiece(id, formData, token);
      toast.success('Pieza añadida correctamente');
      navigate(`/choirs/${id}`);
    } catch (error) {
      toast.error(error.message || 'Error al añadir la pieza');
    } finally {
      setSubmitting(false);
    }
  };

  const renderAudioInput = (field, fileVal, setFileVal, labelGhost) => {
    const mode = audioModes[field] || 'file';
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            Tipo: {mode === 'file' ? '📁 Archivo' : '🔗 YouTube'}
          </span>
          <button 
            type="button" 
            className="btn btn-ghost" 
            style={{ fontSize: '11px', padding: '2px 6px', minWidth: 'auto', color: 'var(--accent-primary)', height: 'auto' }}
            onClick={() => toggleMode(field)}
          >
            Usar {mode === 'file' ? 'YouTube' : 'Archivo'}
          </button>
        </div>
        
        {mode === 'file' ? (
          <FileUploaderInput 
            id={field} 
            accept="audio/*" 
            file={typeof fileVal === 'string' ? null : fileVal} 
            labelGhostBase={labelGhost} 
            onFileChange={(e) => handleFileChange(e, setFileVal)} 
            onClearFile={() => setFileVal(null)} 
          />
        ) : (
          <input 
            type="url" 
            className="form-input" 
            placeholder="Pegar enlace de YouTube" 
            value={typeof fileVal === 'string' ? fileVal : ''} 
            onChange={(e) => setFileVal(e.target.value)} 
            style={{ height: '38px', fontSize: '14px' }}
          />
        )}
      </div>
    );
  };

  if (loading) return <><Navbar /><div style={{ textAlign: 'center', marginTop: '100px' }}>Cargando...</div></>;

  return (
    <>
      <Navbar />

      <div className="auth-page" style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', padding: '40px 24px' }}>
        <div className="auth-container" style={{ maxWidth: '820px', width: '100%', margin: '0 auto' }}>
          <div className="auth-card" style={{ padding: '32px', textAlign: 'left' }}>
            <div className="auth-header" style={{ marginBottom: '24px' }}>
              <Link to={`/choirs/${id}`} style={{ color: 'var(--accent-primary)', fontSize: '14px', display: 'inline-flex', gap: '6px', marginBottom: '12px' }}>
                ← Volver al Coro ({choir?.name})
              </Link>
              <h1 style={{ fontSize: '28px', margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Añadir Pieza al Repertorio</h1>
            </div>

            <form onSubmit={handleSubmit} className="auth-form" style={{ maxWidth: '100%' }}>
              <div className="form-group">
                <label className="form-label">Nombre de la Pieza *</label>
                <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <SettingToggleCard 
                label="Visibilidad de la Pieza"
                checked={isVisible} onChange={() => setIsVisible(!isVisible)}
                iconTrue="👁️" iconFalse="🔒"
                titleTrue="Visible para todos los miembros" titleFalse="Solo para administradores"
                descTrue="Todos podrán ver y ensayar esta pieza" descFalse="Solo los administradores podrán verla"
              />

              <div className="staff-divider" style={{ margin: '24px 0' }}></div>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px', fontSize: '18px' }}>Adjuntar Archivos</h3>

              <div className="piece-upload-grid">
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Partitura (PDF / Imagen)</label>
                  <FileUploaderInput id="partitura" accept=".pdf,image/*" file={partitura} onFileChange={(e) => handleFileChange(e, setPartitura)} onClearFile={() => setPartitura(null)} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', width: '100%', height: '54px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>Lyrics</span>
                    <ToggleSwitch checked={hasLyrics} onChange={() => setHasLyrics(!hasLyrics)} />
                  </div>
                  {!hasLyrics ? (
                    <div className="form-group" style={{ margin: 0, flex: 1, minWidth: 0 }}>
                      <label className="form-label">Información Adicional (PDF/Doc)</label>
                      <FileUploaderInput id="infoAdicional" accept=".pdf,.doc,.docx" file={infoAdicional} onFileChange={(e) => handleFileChange(e, setInfoAdicional)} onClearFile={() => setInfoAdicional(null)} />
                    </div>
                  ) : (
                    <div style={{ flex: 1, color: 'var(--text-secondary)', fontSize: '13px', fontStyle: 'italic' }}>📝 Letra activada</div>
                  )}
                </div>
              </div>

              {hasLyrics && (
                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label className="form-label">Letra de la Obra (Lyrics) *</label>
                  <textarea className="form-input form-textarea" value={lyrics} onChange={(e) => setLyrics(e.target.value)} rows={6} required={hasLyrics} />
                </div>
              )}

              <div className="staff-divider" style={{ margin: '20px 0' }}></div>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px', fontSize: '16px' }}>Audios de Referencia para Ensayos</h3>

              <div className="piece-audio-grid">
                <div className="form-group">
                  <label className="form-label">Voz Coral General</label>
                  {renderAudioInput('vozCoral', vozCoral, setVozCoral, 'AÑADIR AUDIO')}
                </div>
                <div className="form-group">
                  <label className="form-label">Base Instrumental</label>
                  {renderAudioInput('baseInstrumental', baseInstrumental, setBaseInstrumental, 'AÑADIR AUDIO')}
                </div>

                {/* Voces individuales */}
                {['Soprano', 'Contralto', 'Tenor', 'Bajo'].map(voz => {
                  const hasDivState = { Soprano: hasDivSoprano, Contralto: hasDivContralto, Tenor: hasDivTenor, Bajo: hasDivBajo }[voz];
                  const setHasDivState = { Soprano: setHasDivSoprano, Contralto: setHasDivContralto, Tenor: setHasDivTenor, Bajo: setHasDivBajo }[voz];
                  const file1 = { Soprano: vozSoprano, Contralto: vozContralto, Tenor: vozTenor, Bajo: vozBajo }[voz];
                  const file2 = { Soprano: vozSoprano2, Contralto: vozContralto2, Tenor: vozTenor2, Bajo: vozBajo2 }[voz];
                  const setFile1 = { Soprano: setVozSoprano, Contralto: setVozContralto, Tenor: setVozTenor, Bajo: setVozBajo }[voz];
                  const setFile2 = { Soprano: setVozSoprano2, Contralto: setVozContralto2, Tenor: setVozTenor2, Bajo: setVozBajo2 }[voz];

                  return (
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }} key={voz}>
                      <label className="form-label" style={{ margin: 0 }}>Voz {voz}</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <ToggleSwitch checked={hasDivState} onChange={() => setHasDivState(!hasDivState)} />
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>2 Voces</span>
                      </div>
                      
                      {renderAudioInput(`voz${voz}`, file1, setFile1, hasDivState ? `${voz.toUpperCase()} 1` : 'AÑADIR AUDIO')}
                      
                      {hasDivState && (
                        <div style={{ marginTop: '4px' }}>
                          {renderAudioInput(`voz${voz}2`, file2, setFile2, `${voz.toUpperCase()} 2`)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <FormActionButtons onCancel={() => navigate(`/choirs/${id}`)} isSubmitting={submitting} submitText="Añadir Pieza" submittingText="Añadiendo Pieza..." />
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddPiecePage;