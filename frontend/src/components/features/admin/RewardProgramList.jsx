import React, { useEffect, useState } from 'react';
import { useRewardPrograms } from '../../../hooks/useReward';

const RewardProgramList = () => {
  const {
    programs,
    loading,
    error,
    loadPrograms,
  } = useRewardPrograms();

  const [search, setSearch] = useState('');
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    loadPrograms();
  }, []);

  useEffect(() => {
    const filtered = programs.filter(program =>
      program.title.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredPrograms(filtered);
    setCurrentPage(1);
  }, [search, programs]);

  const totalPages = Math.ceil(filteredPrograms.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const currentData = filteredPrograms.slice(start, start + itemsPerPage);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };
  const getBgColor = (index) => {
  const cssVariables = [
    "--grid-bg-1",
    "--grid-bg-2",
    "--grid-bg-3",
    "--grid-bg-4",
    "--grid-bg-5",
    "--grid-bg-6",
    "--grid-bg-7",
    "--grid-bg-8",
  ];
  return `var(${cssVariables[index % cssVariables.length]})`;
};


  return (
    <div className="max-w-7xl mx-auto  bg-[var(--bg-inner)] pb-4">
      <div className="sm:flex justify-between items-center p-4 border-b border-white/20  text-[var(--title-color)]">
        <h1 className="text-2xl font-semibold sm:mb-0 mb-4">🎁 Reward Programs</h1>
        <input
          type="text"
          placeholder="Search by title..."
          className=" p-3 border border-gray-300 rounded-lg text-[var(--subtitle-color)] focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading && <p className="text-gray-600 text-center">Loading rewards...</p>}
      {error && <p className="text-red-600 text-center">{error}</p>}

      <div className="p-4">
        <div className="grid grid-cols-1 gap-4">
      {currentData.map((program, index) => (
        <div
          key={program.id}
          className={`text-white border border-white/10 rounded-md shadow-sm p-5 transition hover:shadow-md `}
           style={{ backgroundColor: getBgColor(index) }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold">{program.title}</h2>
              <p className="mt-1">{program.description}</p>
            </div>
            <span className="ml-4 inline-block text-sm font-medium bg-white/20 text-white px-3 py-1 rounded-full">
              {program.reward_type}
            </span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 text-sm">
            <div className="p-4 bg-white/10 rounded-md">
              📈 <strong>Business Threshold:</strong> {program.business_threshold || 'N/A'}
            </div>
            <div className="p-4 bg-white/10 rounded-md">
              👥 <strong>Team Size:</strong> {program.team_size_threshold ?? 'N/A'}
            </div>
            <div className="p-4 bg-white/10 rounded-md">
              🔁 <strong>Referrals:</strong> {program.direct_referrals_threshold ?? 'N/A'}
            </div>
            <div className="p-4 bg-white/10 rounded-md">
              ⏱ <strong>Duration:</strong> {program.duration_days ? `${program.duration_days} days` : 'N/A'}
            </div>
            <div className="p-4 bg-white/10 rounded-md">
              💰 <strong>Reward:</strong> {program.reward_amount ?? `${program.reward_percentage || '0'}%`}
            </div>
            <div className="p-4 bg-white/10 rounded-md">
              📅 <strong>Active:</strong> {new Date(program.start_date).toLocaleDateString()} - {new Date(program.end_date).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))}
    </div>

        {!loading && currentData.length === 0 && (
          <p className="text-center text-[var(--subtitle-color)] p-4">No reward programs match your search.</p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center  space-x-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            ← Prev
          </button>

          {[...Array(totalPages)].map((_, idx) => {
            const page = idx + 1;
            return (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`px-4 py-2 rounded-md ${
                  currentPage === page
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default RewardProgramList;
