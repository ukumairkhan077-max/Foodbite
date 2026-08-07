// components/ui/Input.js
// Wraps the .text-input class from globals.css with an optional label and error message.

export default function Input({ label, id, error, style, ...rest }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label className="field-label" htmlFor={id}>
          {label}
        </label>
      )}
      <input id={id} className="text-input" style={style} {...rest} />
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}