export default function PillGroup({ name, value, options, onChange }) {
  return (
    <div className="radio-group">
      {options.map((opt) => {
        const optValue = typeof opt === "string" ? opt : opt.value;
        const optLabel = typeof opt === "string" ? opt : opt.label;
        const selected = value === optValue;
        return (
          <label key={optValue} className={`pill-option${selected ? " is-selected" : ""}`}>
            <input
              type="radio"
              name={name}
              value={optValue}
              checked={selected}
              onChange={() => onChange(optValue)}
            />
            {optLabel}
          </label>
        );
      })}
    </div>
  );
}
