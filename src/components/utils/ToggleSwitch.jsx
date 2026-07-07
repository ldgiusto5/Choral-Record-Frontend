import './ToggleSwitch.css';

const ToggleSwitch = ({ checked, onChange, disabled }) => (
  <button
    type="button"
    onClick={onChange}
    disabled={disabled}
    aria-checked={checked}
    role="switch"
    className={`toggle-switch ${checked ? 'active' : 'inactive'}`}
  >
    <span className={`toggle-knob ${checked ? 'active' : 'inactive'}`} />
  </button>
);

export default ToggleSwitch;