import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getChoirById, getPieceById, updateChoirPiece } from '../api/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import ToggleSwitch from '../components/utils/ToggleSwitch';
import SettingToggleCard from '../components/utils/SettingToggleCard';
import FormActionButtons from '../components/utils/FormActionButtons';
import FileUploaderInput from '../components/utils/FileUploaderInput';
import toast from 'react-hot-toast';

const EditPiecePage = () => {
  const { id, pieceId } = useParams();
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

  const [currentPiece, setCurrentPiece] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteFlags, setDeleteFlags] = useState({
    partitura: false, vozCoral: false, vozSoprano: false, vozSoprano2: false,
    vozContralto: false, vozContralto2: false, vozTenor: false, vozTenor2: false,
    vozBajo: false, vozBajo2: false, baseInstrumental: false, infoAdicional: false
  });

  const [hasDiv, setHasDiv] = useState({ Soprano: false, Contralto: false, Tenor: false, Bajo: false });

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

    const loadData = async () => {
      try {
        setLoading(true);
        const choirData = await getChoirById(id, token);
        setChoir(choirData);
        if (!(choirData.membership?.role === 'admin' && choirData.membership?.status === 'accepted')) {
          navigate(`/choirs/${id}`); return;
        }

        const pieceData = await getPieceById(id, pieceId, token);
        setCurrentPiece(pieceData);
        setName(pieceData.name || '');
        setIsVisible(pieceData.is_visible !== false && pieceData.is_visible !== 0);
        setHasLyrics(pieceData.has_lyrics === true || pieceData.has_lyrics === 1);
        setLyrics(pieceData.lyrics || '');
        setHasDiv({
          Soprano: pieceData.has_div_soprano === true || pieceData.has_div_soprano === 1,
          Contralto: pieceData.has_div_contralto === true || pieceData.has_div_contralto === 1,
          Tenor: pieceData.has_div_tenor === true || pieceData.has_div_tenor === 1,
          Bajo: pieceData.has_div_bajo === true || pieceData.has_div_bajo === 1
        });

        // Detectar si los audios son URLs de YouTube
        const detectUrl = (val) => {
          if (!val) return 'file';
          const str = String(val);
          if (str.includes('youtube.com') || str.includes('youtu.be')) {
            return 'url';
          }
          return 'file';
        };

        const modes = {
          vozCoral: detectUrl(pieceData.voz_coral_file),
          baseInstrumental: detectUrl(pieceData.base_instrumental_file),
          vozSoprano: detectUrl(pieceData.voz_soprano_file),
          vozSoprano2: detectUrl(pieceData.voz_soprano_2_file),
          vozContralto: detectUrl(pieceData.voz_contralto_file),
          vozContralto2: detectUrl(pieceData.voz_contralto_2_file),
          vozTenor: detectUrl(pieceData.voz_tenor_file),
          vozTenor2: detectUrl(pieceData.voz_tenor_2_file),
          vozBajo: detectUrl(pieceData.voz_bajo_file),
          vozBajo2: detectUrl(pieceData.voz_bajo_2_file)
        };
        setAudioModes(modes);

        // Rellenar valores si son URLs
        if (modes.vozCoral === 'url') setVozCoral(pieceData.voz_coral_file);
        if (modes.baseInstrumental === 'url') setBaseInstrumental(pieceData.base_instrumental_file);
        if (modes.vozSoprano === 'url') setVozSoprano(pieceData.voz_soprano_file);
        if (modes.vozSoprano2 === 'url') setVozSoprano2(pieceData.voz_soprano_2_file);
        if (modes.vozContralto === 'url') setVozContralto(pieceData.voz_contralto_file);
        if (modes.vozContralto2 === 'url') setVozContralto2(pieceData.voz_contralto_2_file);
        if (modes.vozTenor === 'url') setVozTenor(pieceData.voz_tenor_file);
        if (modes.vozTenor2 === 'url') setVozTenor2(pieceData.voz_tenor_2_file);
        if (modes.vozBajo === 'url') setVozBajo(pieceData.voz_bajo_file);
        if (modes.vozBajo2 === 'url') setVozBajo2(pieceData.voz_bajo_2_file);

      } catch (error) { navigate(`/choirs/${id}`); } finally { setLoading(false); }
    };

    loadData();
  }, [id, pieceId, token, isAuthenticated, loadingAuth, navigate]);

  const handleFileChange = (e, setter, flagKey) => {
    if (e.target.files[0]) {
      setter(e.target.files[0]);
      setDeleteFlags(prev => ({ ...prev, [flagKey]: false }));
    }
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
    
    // Si volvemos a modo archivo, removemos marca de borrado si la hubiera
    setDeleteFlags(prev => ({ ...prev, [field]: false }));
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

      // Si el campo tiene un archivo, se sube. Si tiene texto (URL), se envía como String.
      if (partitura) formData.append('partitura', partitura);
      if (vozCoral !== null) formData.append('vozCoral', vozCoral);
      if (vozSoprano !== null) formData.append('vozSoprano', vozSoprano);
      if (hasDiv.Soprano && vozSoprano2 !== null) formData.append('vozSoprano2', vozSoprano2);
      if (vozContralto !== null) formData.append('vozContralto', vozContralto);
      if (hasDiv.Contralto && vozContralto2 !== null) formData.append('vozContralto2', vozContralto2);
      if (vozTenor !== null) formData.append('vozTenor', vozTenor);
      if (hasDiv.Tenor && vozTenor2 !== null) formData.append('vozTenor2', vozTenor2);
      if (vozBajo !== null) formData.append('vozBajo', vozBajo);
      if (hasDiv.Bajo && vozBajo2 !== null) formData.append('vozBajo2', vozBajo2);
      if (baseInstrumental !== null) formData.append('baseInstrumental', baseInstrumental);
      if (!hasLyrics && infoAdicional) formData.append('infoAdicional', infoAdicional);

      formData.append('has_div_soprano', hasDiv.Soprano ? 'true' : 'false');
      formData.append('has_div_contralto', hasDiv.Contralto ? 'true' : 'false');
      formData.append('has_div_tenor', hasDiv.Tenor ? 'true' : 'false');
      formData.append('has_div_bajo', hasDiv.Bajo ? 'true' : 'false');

      Object.entries(deleteFlags).forEach(([key, val]) => {
        if (val) formData.append(`delete_${key}`, 'true');
      });

      await updateChoirPiece(id, pieceId, formData, token);
      toast.success('Pieza actualizada con éxito');
      navigate(`/choirs/${id}`);
    } catch (error) { 
      toast.error(error.message || 'Error al guardar cambios'); 
    } finally { 
      setSubmitting(false); 
    }
  };

  const renderAudioInput = (field, fileVal, setFileVal, dbFileUrl, flagKey, labelGhost, labelReplace) => {
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
            currentFileUrl={dbFileUrl || null}
            isDeleted={deleteFlags[flagKey]} 
            labelGhostBase={labelGhost} 
            labelGhostReplace={labelReplace || 'Reemplazar'}
            onFileChange={(e) => handleFileChange(e, setFileVal, flagKey)} 
            onClearFile={() => setFileVal(null)} 
            onToggleDelete={() => setDeleteFlags(p => ({ ...p, [flagKey]: !p[flagKey] }))}
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

  if (loading) return <><Navbar /><div style={{ textAlign: 'center', marginTop: '100px' }}>Cargando datos...</div></>;

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
              <h1 style={{ fontSize: '28px', margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Editar Pieza</h1>
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
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px', fontSize: '18px' }}>Adjuntar Archivos (Sube nuevos para reemplazar)</h3>

              <div className="piece-upload-grid">
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Partitura (PDF / Imagen)</label>
                  <FileUploaderInput 
                    id="partitura" accept=".pdf,image/*" file={partitura} currentFileUrl={currentPiece?.partitura_file} isDeleted={deleteFlags.partitura}
                    onFileChange={(e) => handleFileChange(e, setPartitura, 'partitura')} onClearFile={() => setPartitura(null)}
                    onToggleDelete={() => setDeleteFlags(p => ({ ...p, partitura: !p.partitura }))}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', width: '100%', height: '54px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>Lyrics</span>
                    <ToggleSwitch checked={hasLyrics} onChange={() => setHasLyrics(!hasLyrics)} />
                  </div>
                  {!hasLyrics ? (
                    <div className="form-group" style={{ margin: 0, flex: 1, minWidth: 0 }}>
                      <label className="form-label">Información Adicional (PDF/Doc)</label>
                      <FileUploaderInput 
                        id="infoAdicional" accept=".pdf,.doc,.docx" file={infoAdicional} currentFileUrl={currentPiece?.info_adicional_file} isDeleted={deleteFlags.infoAdicional}
                        onFileChange={(e) => handleFileChange(e, setInfoAdicional, 'infoAdicional')} onClearFile={() => setInfoAdicional(null)}
                        onToggleDelete={() => setDeleteFlags(p => ({ ...p, infoAdicional: !p.infoAdicional }))}
                      />
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
                  {renderAudioInput('vozCoral', vozCoral, setVozCoral, currentPiece?.voz_coral_file, 'vozCoral', 'AÑADIR AUDIO', 'Reemplazar')}
                </div>
                <div className="form-group">
                  <label className="form-label">Base Instrumental</label>
                  {renderAudioInput('baseInstrumental', baseInstrumental, setBaseInstrumental, currentPiece?.base_instrumental_file, 'baseInstrumental', 'AÑADIR AUDIO', 'Reemplazar')}
                </div>

                {/* Voces individuales */}
                {['Soprano', 'Contralto', 'Tenor', 'Bajo'].map(voz => {
                  const stateDiv = hasDiv[voz];
                  const file1 = { Soprano: vozSoprano, Contralto: vozContralto, Tenor: vozTenor, Bajo: vozBajo }[voz];
                  const file2 = { Soprano: vozSoprano2, Contralto: vozContralto2, Tenor: vozTenor2, Bajo: vozBajo2 }[voz];
                  const setFile1 = { Soprano: setVozSoprano, Contralto: setVozContralto, Tenor: setVozTenor, Bajo: setVozBajo }[voz];
                  const setFile2 = { Soprano: setVozSoprano2, Contralto: setVozContralto2, Tenor: setVozTenor2, Bajo: setVozBajo2 }[voz];
                  
                  const dbFile1 = currentPiece?.[`voz_${voz.toLowerCase()}_file`];
                  const dbFile2 = currentPiece?.[`voz_${voz.toLowerCase()}_2_file`];
                  const flag1 = `voz${voz}`;
                  const flag2 = `voz${voz}2`;

                  return (
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }} key={voz}>
                      <label className="form-label" style={{ margin: 0 }}>Voz {voz}</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <ToggleSwitch checked={stateDiv} onChange={() => setHasDiv(p => ({ ...p, [voz]: !p[voz] }))} />
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>2 Voces</span>
                      </div>
                      
                      {renderAudioInput(flag1, file1, setFile1, dbFile1, flag1, stateDiv ? `${voz.toUpperCase()} 1` : 'AÑADIR AUDIO', stateDiv ? 'Reemplazar 1' : 'Reemplazar')}
                      
                      {stateDiv && (
                        <div style={{ marginTop: '4px' }}>
                          {renderAudioInput(flag2, file2, setFile2, dbFile2, flag2, `${voz.toUpperCase()} 2`, 'Reemplazar 2')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <FormActionButtons onCancel={() => navigate(`/choirs/${id}`)} isSubmitting={submitting} submitText="Guardar Cambios" submittingText="Guardando Cambios..." />
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditPiecePage;