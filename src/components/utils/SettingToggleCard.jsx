import ToggleSwitch from './ToggleSwitch';
import './SettingToggleCard.css';

const SettingToggleCard = ({ 
  label, iconTrue = '👁️', iconFalse = '🔒', 
  titleTrue, titleFalse, descTrue, descFalse, 
  checked, onChange 
}) => {
  return (
    <div className="form-group setting-card-wrapper">
      {label && <label className="form-label">{label}</label>}
      <div className={`setting-card ${checked ? 'active' : 'inactive'}`} onClick={onChange}>
        
        <div className="setting-card-left">
          <span className="setting-card-icon">{checked ? iconTrue : iconFalse}</span>
          <div>
            <div className="setting-card-title">{checked ? titleTrue : titleFalse}</div>
            <div className="setting-card-desc">{checked ? descTrue : descFalse}</div>
          </div>
        </div>
        
        <ToggleSwitch checked={checked} onChange={onChange} />
      </div>
    </div>
  );
};

export default SettingToggleCard;