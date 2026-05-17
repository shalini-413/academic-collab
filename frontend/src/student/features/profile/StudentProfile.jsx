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
import { resolveAssetUrl } from '../../../shared/utils/urls';
import { getStudentProfileCompletion, studentProfileService } from '../../services/studentProfileService';

const StudentProfile = () => {
  const { setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setProfile(await studentProfileService.getProfile());
      } catch (error) {
        toast.error('Failed to load student profile');
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
      const result = await studentProfileService.uploadFile(file);
      updateProfile({ avatar: result.url });
      toast.success('Profile photo updated');
    } catch (error) {
      toast.error('Failed to upload profile photo');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const uploadResume = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') return toast.error('Please upload a PDF resume.');
    if (file.size > 5 * 1024 * 1024) return toast.error('Resume must be less than 5MB.');

    setUploadingResume(true);
    try {
      const result = await studentProfileService.uploadFile(file);
      updateProfile({ resumeUrl: result.url });
      toast.success('Resume uploaded');
    } catch (error) {
      toast.error('Failed to upload resume');
    } finally {
      setUploadingResume(false);
    }
  };

  const saveProfile = async (event) => {
    event.preventDefault();

    try {
      const result = await toast.promise(studentProfileService.saveProfile(profile), {
        loading: 'Saving student profile...',
        success: 'Student profile saved',
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

  if (loading || !profile) return <LoadingScreen label="Loading student profile" />;

  const completion = getStudentProfileCompletion(profile);

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-16">
      <header className="bg-[#0f172a] text-white">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <AvatarUpload name={profile.name} avatar={profile.avatar} uploading={uploadingAvatar} onUpload={uploadAvatar} />
          <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-200">Student Profile</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">Academic identity and opportunity fit</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">Keep your skills, interests, resume, and portfolio current so project matches and applications represent you accurately.</p>
            </div>
            <div className="min-w-72">
              <ProfileCompletionSummary score={completion.completionScore} missingFields={completion.missingFields} />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <form onSubmit={saveProfile} className="space-y-6">
          <ProfileSection title="Academic Details" eyebrow="Core">
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Full Name">
                <input className={inputClassName} value={profile.name} onChange={(event) => updateProfile({ name: event.target.value })} required />
              </FormField>
              <FormField label="University / Institution">
                <input className={inputClassName} value={profile.university} onChange={(event) => updateProfile({ university: event.target.value })} placeholder="e.g. NSUT" />
              </FormField>
              <FormField label="Academic Summary" className="md:col-span-2">
                <textarea className={inputClassName} rows="4" value={profile.bio} onChange={(event) => updateProfile({ bio: event.target.value })} placeholder="Summarize your academic background, interests, and current goals." />
              </FormField>
            </div>
          </ProfileSection>

          <ProfileSection title="Skills, Interests, and Resume" eyebrow="Matching">
            <div className="space-y-6">
              <TagInput label="Technical Skills" values={profile.skills} placeholder="Type a skill and press Enter" onChange={(skills) => updateProfile({ skills })} />
              <TagInput label="Research Interests" values={profile.researchInterests} placeholder="Type an interest and press Enter" onChange={(researchInterests) => updateProfile({ researchInterests })} />
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Resume</p>
                    {profile.resumeUrl ? (
                      <a className="mt-1 inline-block text-sm font-semibold text-[#2563eb] hover:underline" href={resolveAssetUrl(profile.resumeUrl)} target="_blank" rel="noreferrer">
                        View uploaded resume
                      </a>
                    ) : (
                      <p className="mt-1 text-sm text-slate-500">No resume uploaded yet.</p>
                    )}
                  </div>
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-[#2563eb] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1d4ed8]">
                    {uploadingResume ? 'Uploading...' : 'Upload PDF'}
                    <input type="file" accept=".pdf" disabled={uploadingResume} onChange={uploadResume} className="sr-only" />
                  </label>
                </div>
              </div>
            </div>
          </ProfileSection>

          <ProfileSection title="Portfolio and Social Links" eyebrow="Public Signals">
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="GitHub">
                <input className={inputClassName} type="url" value={profile.github} onChange={(event) => updateProfile({ github: event.target.value })} placeholder="https://github.com/..." />
              </FormField>
              <FormField label="LinkedIn">
                <input className={inputClassName} type="url" value={profile.linkedin} onChange={(event) => updateProfile({ linkedin: event.target.value })} placeholder="https://linkedin.com/in/..." />
              </FormField>
              <FormField label="Portfolio" className="md:col-span-2">
                <input className={inputClassName} type="url" value={profile.portfolio} onChange={(event) => updateProfile({ portfolio: event.target.value })} placeholder="https://your-site.com" />
              </FormField>
              <div className="md:col-span-2">
                <LinkListEditor label="Additional Links" items={profile.additionalLinks} onChange={(additionalLinks) => updateProfile({ additionalLinks })} />
              </div>
            </div>
          </ProfileSection>

          <button type="submit" className="w-full rounded-lg bg-[#0f172a] px-5 py-4 text-sm font-semibold text-white shadow-sm hover:bg-[#1e293b]">
            Save Student Profile
          </button>
        </form>
      </main>
    </div>
  );
};

export default StudentProfile;
