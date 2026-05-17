import FormField, { inputClassName } from './FormField';

const TagInput = ({ label, values = [], placeholder, onChange, tone = 'blue' }) => {
  const accent = tone === 'amber'
    ? 'bg-amber-50 text-amber-700 border-amber-200'
    : 'bg-blue-50 text-blue-700 border-blue-200';

  const addTag = (rawValue) => {
    const value = rawValue.trim();
    if (!value || values.includes(value)) return;
    onChange([...values, value]);
  };

  const removeTag = (index) => {
    onChange(values.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <FormField label={label}>
      <div className="flex flex-wrap gap-2 mb-3">
        {values.map((value, index) => (
          <span key={`${value}-${index}`} className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-semibold ${accent}`}>
            {value}
            <button type="button" className="text-current opacity-60 hover:opacity-100" onClick={() => removeTag(index)}>
              x
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        className={inputClassName}
        placeholder={placeholder}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            addTag(event.currentTarget.value);
            event.currentTarget.value = '';
          }
        }}
      />
    </FormField>
  );
};

export default TagInput;

