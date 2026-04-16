// frontend/src/pages/WorkspacePage.jsx
import { useParams } from 'react-router-dom';
import ProjectWorkspace from '../components/ProjectWorkspace';

const WorkspacePage = () => {
  const { projectId } = useParams();
  return (
    <div className="min-h-screen bg-[#fdfcfb] p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-black text-[#003049] tracking-tighter">Project <span className="text-[#f77f00]">Workspace</span></h1>
          <p className="text-slate-400 font-medium">Collaborate with your team in real-time.</p>
        </header>
        <ProjectWorkspace projectId={projectId} />
      </div>
    </div>
  );
};

export default WorkspacePage;