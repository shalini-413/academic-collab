import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AvatarUpload from '../../../shared/components/AvatarUpload';
import FormField, { inputClassName } from '../../../shared/components/FormField';
import LinkListEditor from '../../../shared/components/LinkListEditor';
import LoadingScreen from '../../../shared/components/LoadingScreen';
import ProfileSection from '../../../shared/components/ProfileSection';
import ProfileCompletionSummary from '../../../shared/components/ProfileCompletionSummary';
import TagInput from '../../../shared/components/TagInput';
import { useAuth } from '../../../shared/hooks/useAuth';
import { getProfessorProfileCompletion, professorProfileService } from '../../services/professorProfileService';

const ProfessorProfile = () => {
  const { setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setProfile(await professorProfileService.getProfile());
      } catch (error) {
        toast.error('Failed to load professor profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const updateProfile = (patch) => setProfile((current) => ({ ...current, ...patch }));

  const uploadAvatar = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Please upload a valid image file.');
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be less than 5MB.');

    setUploadingAvatar(true);
    try {
      const result = await professorProfileService.uploadFile(file);
      updateProfile({ avatar: result.url });
      toast.success('Profile photo updated');
    } catch (error) {
      toast.error('Failed to upload profile photo');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const saveProfile = async (event) => {
    event.preventDefault();

    try {
      const result = await toast.promise(professorProfileService.saveProfile(profile), {
        loading: 'Saving professor profile...',
        success: 'Professor profile saved',
        error: 'Failed to save profile'
      });

      if (result.user) {
        setProfile((current) => ({ ...current, ...result.user }));
        setUser({ name: result.user.name, avatar: result.user.avatar });
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading || !profile) return <LoadingScreen label="Loading professor profile" />;

  const completion = getProfessorProfileCompletion(profile);

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-16">
      <header className="bg-[#18312f] text-white">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <AvatarUpload name={profile.name} avatar={profile.avatar} uploading={uploadingAvatar} onUpload={uploadAvatar} />
          <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-200">Professor Profile</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">Research presence and lab management profile</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">Maintain the information students use to understand your domains, open work, publications, and collaboration style.</p>
            </div>
            <div className="min-w-72">
              <ProfileCompletionSummary score={completion.completionScore} missingFields={completion.missingFields} tone="emerald" />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <form onSubmit={saveProfile} className="space-y-6">
          <ProfileSection title="Faculty Details" eyebrow="Core">
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Full Name">
                <input className={inputClassName} value={profile.name} onChange={(event) => updateProfile({ name: event.target.value })} required />
              </FormField>
              <FormField label="Designation">
                <input className={inputClassName} value={profile.designation} onChange={(event) => updateProfile({ designation: event.target.value })} placeholder="Assistant Professor" />
              </FormField>
              <FormField label="Department">
                <input className={inputClassName} value={profile.department} onChange={(event) => updateProfile({ department: event.target.value })} placeholder="Computer Science" />
              </FormField>
              <FormField label="University / Institution">
                <input className={inputClassName} value={profile.university} onChange={(event) => updateProfile({ university: event.target.value })} placeholder="e.g. NSUT" />
              </FormField>
              <FormField label="Research Summary" className="md:col-span-2">
                <textarea className={inputClassName} rows="4" value={profile.bio} onChange={(event) => updateProfile({ bio: event.target.value })} placeholder="Describe your research group, supervision style, and active directions." />
              </FormField>
            </div>
          </ProfileSection>

          <ProfileSection title="Research Domains" eyebrow="Matching">
            <div className="space-y-6">
              <TagInput label="Research Domains" values={profile.researchInterests} placeholder="Type a domain and press Enter" onChange={(researchInterests) => updateProfile({ researchInterests })} tone="amber" />
              <TagInput label="Methods / Skills You Recruit For" values={profile.skills} placeholder="Type a skill and press Enter" onChange={(skills) => updateProfile({ skills })} tone="amber" />
            </div>
          </ProfileSection>

          <ProfileSection title="Publications and Academic Links" eyebrow="Credibility">
            <div className="space-y-6">
              <FormField label="Google Scholar">
                <input className={inputClassName} type="url" value={profile.googleScholar} onChange={(event) => updateProfile({ googleScholar: event.target.value })} placeholder="https://scholar.google.com/..." />
              </FormField>
              <LinkListEditor label="Notable Publications" items={profile.publications} titlePlaceholder="Publication title" urlPlaceholder="Publication URL" urlKey="link" onChange={(publications) => updateProfile({ publications })} />
            </div>
          </ProfileSection>

          <button type="submit" className="w-full rounded-lg bg-[#18312f] px-5 py-4 text-sm font-semibold text-white shadow-sm hover:bg-[#254642]">
            Save Professor Profile
          </button>
        </form>
      </main>
    </div>
  );
};

export default ProfessorProfile;
