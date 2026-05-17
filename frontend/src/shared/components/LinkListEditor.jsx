import FormField, { inputClassName } from './FormField';

const LinkListEditor = ({ label, items = [], titlePlaceholder = 'Title', urlPlaceholder = 'URL', urlKey = 'url', onChange }) => {
  const updateItem = (index, key, value) => {
    const nextItems = [...items];
    nextItems[index] = { ...nextItems[index], [key]: value };
    onChange(nextItems);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <button
          type="button"
          className="text-sm font-semibold text-[#2563eb] hover:text-[#1d4ed8]"
          onClick={() => onChange([...items, { title: '', [urlKey]: '' }])}
        >
          Add
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 md:grid-cols-[1fr_1.5fr_auto]">
            <FormField label="Label">
              <input className={inputClassName} value={item.title || ''} placeholder={titlePlaceholder} onChange={(event) => updateItem(index, 'title', event.target.value)} />
            </FormField>
            <FormField label="URL">
              <input className={inputClassName} type="url" value={item[urlKey] || ''} placeholder={urlPlaceholder} onChange={(event) => updateItem(index, urlKey, event.target.value)} />
            </FormField>
            <button
              type="button"
              className="self-end rounded-lg px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
              onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LinkListEditor;
