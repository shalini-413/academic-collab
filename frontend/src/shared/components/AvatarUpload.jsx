import { resolveAssetUrl } from '../utils/urls';

const AvatarUpload = ({ name, avatar, uploading, onUpload }) => (
  <div className="flex items-center gap-5">
    <div className="relative h-24 w-24 overflow-hidden rounded-lg bg-slate-100 border border-white/20 shadow-lg">
      {avatar ? (
        <img src={resolveAssetUrl(avatar)} alt="Profile" className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full grid place-items-center bg-[#1e293b] text-3xl font-bold text-white">
          {name ? name[0].toUpperCase() : 'U'}
        </div>
      )}
      {uploading && <div className="absolute inset-0 bg-slate-950/50 grid place-items-center text-xs font-bold text-white">Uploading</div>}
    </div>

    <div>
      <p className="text-sm font-semibold text-white">Profile photo</p>
      <p className="text-sm text-white/65 mb-3">Upload a JPG or PNG under 5MB.</p>
      <label className="inline-flex cursor-pointer items-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-100">
        Change Photo
        <input type="file" accept="image/*" className="sr-only" disabled={uploading} onChange={onUpload} />
      </label>
    </div>
  </div>
);

export default AvatarUpload;

