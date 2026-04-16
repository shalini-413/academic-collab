import { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';

const SearchProfessors = () => {
  const { token } = useContext(AuthContext);
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [university, setUniversity] = useState('');
  const [country, setCountry] = useState('');
  const [type, setType] = useState('');        // remote / onsite
  const [payment, setPayment] = useState('');  // paid / unpaid

  const fetchProfessors = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/search/professors', {
        headers: { Authorization: `Bearer ${token}` },
        params: { q: searchTerm, university, country, type, payment }
      });
      setProfessors(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessors();
  }, [searchTerm, university, country, type, payment]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-black text-navy mb-8">Find Professors</h1>

      {/* Search Bar + Filters */}
      <div className="bg-white rounded-3xl shadow-sm p-6 mb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <input
          type="text"
          placeholder="Search by name, field or keyword..."
          className="col-span-2 px-6 py-4 border border-slate-200 rounded-2xl focus:border-orange outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <input
          type="text"
          placeholder="University"
          className="px-6 py-4 border border-slate-200 rounded-2xl focus:border-orange outline-none"
          value={university}
          onChange={(e) => setUniversity(e.target.value)}
        />

        <input
          type="text"
          placeholder="Country"
          className="px-6 py-4 border border-slate-200 rounded-2xl focus:border-orange outline-none"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />

        <div className="flex gap-2">
          <select onChange={(e) => setType(e.target.value)} className="flex-1 px-6 py-4 border border-slate-200 rounded-2xl">
            <option value="">Any Type</option>
            <option value="remote">Remote</option>
            <option value="onsite">On-site</option>
          </select>

          <select onChange={(e) => setPayment(e.target.value)} className="flex-1 px-6 py-4 border border-slate-200 rounded-2xl">
            <option value="">Any Payment</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <p className="text-center py-10">Searching...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {professors.map(prof => (
            <div key={prof._id} className="academic-card p-8 hover:shadow-2xl transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-black text-xl text-navy">{prof.name}</h3>
                  <p className="text-orange text-sm">{prof.university} • {prof.country}</p>
                </div>
              </div>
              <p className="mt-4 text-slate-600 line-clamp-3">{prof.bio || 'No bio available'}</p>
              
              <div className="mt-6 flex flex-wrap gap-2">
                {prof.researchInterests?.map((interest, i) => (
                  <span key={i} className="text-xs bg-orange/10 text-orange px-3 py-1 rounded-full">
                    {interest}
                  </span>
                ))}
              </div>

              <button className="mt-8 w-full btn-primary py-4 text-sm">
                View Profile & Projects
              </button>
            </div>
          ))}
        </div>
      )}

      {professors.length === 0 && !loading && (
        <p className="text-center py-20 text-slate-400">No professors found matching your search.</p>
      )}
    </div>
  );
};

export default SearchProfessors;