import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '../shared/components/LoadingScreen';
import { notify } from '../shared/services/notify';
import SavedProjectCard from '../student/components/SavedProjectCard';
import { savedProjectsService } from '../student/services/savedProjectsService';

const SavedProjects = () => {
  const navigate = useNavigate();
  const [savedProjects, setSavedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedProjects = async () => {
      try {
        setSavedProjects(await savedProjectsService.list());
      } catch (error) {
        notify.error('Failed to load saved projects');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedProjects();
  }, []);

  const removeSavedProject = async (projectId) => {
    const previousProjects = savedProjects;
    setSavedProjects((projects) => projects.filter((project) => project._id !== projectId));

    try {
      await savedProjectsService.toggle(projectId);
      notify.success('Project removed from saved');
    } catch (error) {
      setSavedProjects(previousProjects);
      notify.error('Failed to remove project');
    }
  };

  if (loading) return <LoadingScreen label="Loading saved projects" />;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-16">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Student Workspace</p>
          <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Saved Projects</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Compare opportunities you are interested in, review deadlines, and move quickly when a project looks right.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/projects-feed')}
              className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Browse Projects
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {savedProjects.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-500">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-950">No saved projects yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Save projects from the feed to build a shortlist and return when you are ready to apply.
            </p>
            <button
              type="button"
              onClick={() => navigate('/projects-feed')}
              className="mt-6 rounded-lg bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
            >
              Find Projects
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {savedProjects.map((project) => (
              <SavedProjectCard key={project._id} project={project} onRemove={removeSavedProject} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SavedProjects;

