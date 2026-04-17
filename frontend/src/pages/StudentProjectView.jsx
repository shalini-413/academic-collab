// frontend/src/pages/StudentProjectView.jsx
import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const StudentProjectView = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyForm, setShowApplyForm] = useState(false);   // This controls the form visibility

  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [additionalLinks, setAdditionalLinks] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch project details
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProject(res.data);
      } catch (err) {
        toast.error("Project not found");
        navigate('/projects-feed');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id, token, navigate]);

  // Send Chat Request
  const sendChatRequest = async () => {
    if (!project?.professor) {
      toast.error("Professor information not available");
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/chat/request', {
        receiverId: project.professor._id || project.professor,
        projectId: id,
        initialMessage: `Hi, I am interested in your project "${project.title}". Would like to discuss further.`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Chat request sent! Waiting for acceptance.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send request");
    }
  };

  // Handle Resume File Upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setResumeFile(file);
    } else {
      toast.error("Only PDF files are allowed");
    }
  };

  // Submit Application
// Submit Application (Updated for File Uploads)
const handleApply = async (e) => {
  e.preventDefault();
  if (!coverLetter.trim()) {
    toast.error("Cover letter is required");
    return;
  }

  setIsSubmitting(true);
  
  // 1. Use FormData instead of a standard JSON object
  const formData = new FormData();
  formData.append('projectId', id);
  formData.append('coverLetter', coverLetter.trim());
  
  // 2. Append the resume file if it exists
  if (resumeFile) {
    formData.append('resume', resumeFile);
  }
  
  // 3. Stringify the array so it can be sent via FormData
  if (additionalLinks.length > 0) {
    formData.append('additionalLinks', JSON.stringify(additionalLinks));
  }

  try {
    await axios.post('http://localhost:5000/api/applications/apply', formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data' // 4. Explicitly state the content type
      }
    });
    toast.success("Application submitted successfully!");
    setShowApplyForm(false);
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to apply");
  } finally {
    setIsSubmitting(false);
  }
};

  if (loading) {
    return <div className="p-20 text-center font-bold text-[#003049]">Loading project details...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <button 
        onClick={() => navigate(-1)} 
        className="mb-8 text-sm font-medium text-slate-500 hover:text-[#f77f00] flex items-center gap-2"
      >
        ← Back to Projects Feed
      </button>

      <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-xl">
        <h1 className="text-4xl font-black text-[#003049] mb-4">{project?.title}</h1>
        <p className="text-slate-600 text-lg leading-relaxed mb-10">{project?.description}</p>

        <div className="flex flex-wrap gap-2 mb-10">
          {project?.requiredSkills?.map((skill, i) => (
            <span key={i} className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-sm">
              {skill}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => setShowApplyForm(true)}
            className="w-full bg-[#003049] hover:bg-[#f77f00] text-white py-5 rounded-2xl font-black text-xl transition-all active:scale-[0.98]"
          >
            Apply for this Project
          </button>

          <button 
            onClick={sendChatRequest}
            className="w-full bg-white border-2 border-[#003049] text-[#003049] py-5 rounded-2xl font-black text-xl hover:bg-slate-50 transition-all active:scale-[0.98]"
          >
            💬 Message Professor
          </button>
        </div>

        {/* Apply Form - Now properly controlled */}
        {showApplyForm && (
          <div className="mt-10 pt-10 border-t border-slate-100">
            <form onSubmit={handleApply} className="space-y-8">
              <h3 className="text-2xl font-bold text-[#003049]">Submit Your Application</h3>

              {/* Cover Letter */}
              <div>
                <label className="block text-sm font-semibold mb-3">Cover Letter <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows="8"
                  placeholder="Explain why you are a good fit for this project..."
                  className="w-full p-6 rounded-2xl border-2 border-slate-200 focus:border-[#f77f00] outline-none resize-none"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />
              </div>

              {/* Resume Upload */}
              <div>
                <label className="block text-sm font-semibold mb-3">Upload Resume (PDF) - Optional</label>
                <input 
                  type="file" 
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="w-full p-4 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer"
                />
                {resumeFile && <p className="text-green-600 text-sm mt-2">✓ {resumeFile.name}</p>}
              </div>

              {/* Additional Links */}
              <div>
                <div className="flex justify-between mb-3">
                  <label className="text-sm font-semibold">Additional Links (Optional)</label>
                  <button type="button" onClick={() => setAdditionalLinks([...additionalLinks, { title: '', url: '' }])} className="text-[#f77f00] text-sm">+ Add Link</button>
                </div>
                {additionalLinks.map((link, i) => (
                  <div key={i} className="flex gap-3 mb-3">
                    <input 
                      type="text" 
                      placeholder="Title" 
                      value={link.title} 
                      onChange={(e) => {
                        const updated = [...additionalLinks];
                        updated[i].title = e.target.value;
                        setAdditionalLinks(updated);
                      }} 
                      className="flex-1 p-4 rounded-2xl border border-slate-200" 
                    />
                    <input 
                      type="url" 
                      placeholder="URL" 
                      value={link.url} 
                      onChange={(e) => {
                        const updated = [...additionalLinks];
                        updated[i].url = e.target.value;
                        setAdditionalLinks(updated);
                      }} 
                      className="flex-1 p-4 rounded-2xl border border-slate-200" 
                    />
                    <button type="button" onClick={() => setAdditionalLinks(additionalLinks.filter((_, idx) => idx !== i))} className="text-red-500">Remove</button>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 pt-6">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 bg-[#f77f00] text-white py-5 rounded-2xl font-black text-lg disabled:opacity-70"
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowApplyForm(false)}
                  className="px-10 py-5 text-slate-500 font-semibold hover:bg-slate-100 rounded-2xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProjectView;