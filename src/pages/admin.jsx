import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import questionsData from '../questions.json'

export default function Admin() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [teamScores, setTeamScores] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showClearDataModal, setShowClearDataModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  useEffect(() => {
    // Always authenticate in prototype
    setIsAuthenticated(true);
    loadData();
  }, []);
  
  const loadData = () => {
    setIsLoading(true);
    try {
      // Load questions from JSON file
      setQuestions(questionsData.questions);
      
      // Load teams from localStorage
      const storedTeams = JSON.parse(localStorage.getItem('teams') || '[]');
      setTeams(storedTeams);
      
      // Load submissions from localStorage
      const storedSubmissions = JSON.parse(localStorage.getItem('submissions') || '[]');
      setSubmissions(storedSubmissions);
      
      // Calculate team scores
      calculateTeamScores(storedTeams, storedSubmissions);
    } catch (err) {
      setError('Error loading data: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const calculateTeamScores = (teamsData, submissionsData) => {
    const scores = teamsData.map(team => {
      const teamSubmissions = submissionsData.filter(sub => sub.team_id === team.id);
      
      const totalScore = teamSubmissions.reduce((sum, sub) => sum + (sub.rating || 0), 0);
      
      // Count rated submissions
      const ratedSubmissions = teamSubmissions.filter(sub => sub.rating !== null && sub.rating !== undefined).length;
      const pendingSubmissions = teamSubmissions.filter(sub => sub.rating === null || sub.rating === undefined).length;
      
      return {
        team_id: team.id,
        team_name: team.team_name,
        captain_name: team.captain_name,
        total_score: totalScore,
        submission_count: teamSubmissions.length,
        rated_count: ratedSubmissions,
        pending_count: pendingSubmissions
      };
    });
    
    scores.sort((a, b) => b.total_score - a.total_score);
    
    setTeamScores(scores);
  };
  
  const handleLogout = () => {
    setIsAnimating(true);
    setTimeout(() => {
      navigate('/');
    }, 500);
  };
  
  const handleRating = (submissionId, ratingValue) => {
    try {
      const updatedSubmissions = submissions.map(sub => 
        sub.id === submissionId ? { ...sub, rating: ratingValue } : sub
      );

      localStorage.setItem('submissions', JSON.stringify(updatedSubmissions));

      setSubmissions(updatedSubmissions);

      calculateTeamScores(teams, updatedSubmissions);

      if (selectedSubmission && selectedSubmission.id === submissionId) {
        setSelectedSubmission(null);
      }
    } catch (err) {
      setError('Error updating rating: ' + err.message);
    }
  };
  
  const closeSubmissionDetail = () => {
    setSelectedSubmission(null);
  };
  
  const handleClearData = () => {
    try {
      localStorage.removeItem('teams');
      localStorage.removeItem('submissions');
      localStorage.removeItem('currentTeam');
      
      setTeams([]);
      setSubmissions([]);
      setTeamScores([]);
      
      setShowClearDataModal(false);
      
      alert('All data has been successfully cleared!');
    } catch (err) {
      setError('Error clearing data: ' + err.message);
      setShowClearDataModal(false);
    }
  };
  
  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.team_name : 'Unknown Team';
  };
  
  const getQuestionText = (questionId) => {
    const question = questions.find(q => q.id === questionId);
    return question ? question.question_text : 'Unknown Question';
  };
  
  const getLocationName = (questionId) => {
    const question = questions.find(q => q.id === questionId);
    return question ? question.location_name : 'Unknown Location';
  };
  
  const getAssignmentNumber = (questionId) => {
    const question = questions.find(q => q.id === questionId);
    return question ? question.order_number : '?';
  };
  
  const getStatusText = (rating) => {
    if (rating === null || rating === undefined) return 'Pending';
    if (rating > 0) return 'Approved';
    return 'Rejected';
  };

  const getStatusClass = (rating) => {
    if (rating === null || rating === undefined) return 'bg-yellow-600 text-white';
    if (rating > 0) return 'bg-green-600 text-white';
    return 'bg-red-600 text-white';
  };
  
  const filteredSubmissions = 
    filter === 'all' ? submissions :
    filter === 'pending' ? submissions.filter(sub => sub.rating === null || sub.rating === undefined) :
    filter === 'approved' ? submissions.filter(sub => sub.rating > 0) :
    submissions.filter(sub => sub.rating === 0);
  
  const pageAnimationClass = isAnimating 
    ? 'opacity-0 transform translate-y-10' 
    : 'opacity-100 transform translate-y-0';
  
  const openSubmissionDetail = (submission) => {
    setSelectedSubmission(submission);
  };
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4 flex items-center justify-center">
        <div className="text-xl animate-pulse">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className={`min-h-screen bg-black text-white transition-all duration-500 ${pageAnimationClass}`}>
      {/* Main container with sidebar and content */}
      <div className="flex h-screen overflow-hidden">
        {/* Mobile sidebar toggle button */}
        <button 
          onClick={toggleSidebar}
          className="lg:hidden fixed top-4 left-4 z-50 bg-gray-800 p-2 rounded-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        {/* Sidebar */}
        <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-40 w-64 h-full bg-gray-900 border-r border-gray-800 flex flex-col transition-transform duration-300 ease-in-out`}>
          <div className="p-4 h-16 flex items-center justify-between border-b border-gray-800">
            <h1 className="text-xl font-bold">Bit Bingo - Admin</h1>
            <button 
              onClick={toggleSidebar} 
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <nav className="p-2">
              <ul>
                <li className="mb-1">
                  <button
                    onClick={() => {
                      setActiveTab('dashboard');
                      setIsSidebarOpen(false);
                    }} 
                    className={`w-full flex items-center p-3 rounded-md ${activeTab === 'dashboard' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                  </button>
                </li>
                <li className="mb-1">
                  <button
                    onClick={() => {
                      setActiveTab('teams');
                      setIsSidebarOpen(false);
                    }} 
                    className={`w-full flex items-center p-3 rounded-md ${activeTab === 'teams' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Teams
                  </button>
                </li>
                <li className="mb-1">
                  <button
                    onClick={() => {
                      setActiveTab('assignments');
                      setIsSidebarOpen(false);
                    }} 
                    className={`w-full flex items-center p-3 rounded-md ${activeTab === 'assignments' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Assignments
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header Bar */}
          <div className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 lg:px-6">
            <div className="flex items-center">
              <div className="relative ml-6 lg:ml-0">
                <input 
                  type="text" 
                  placeholder="Zoeken" 
                  className="pl-10 pr-4 py-2 bg-gray-800 rounded-md text-white w-36 sm:w-auto focus:outline-none focus:ring-1 focus:ring-green-500"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              <div className="ml-2 sm:ml-4">
                <select 
                  className="bg-gray-800 border border-gray-700 text-white px-2 sm:px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
            
            <button onClick={handleLogout} className="text-gray-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
          
          {/* Content Area with padding adjustment */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-900">
            {error && (
              <div className="bg-red-900 text-white p-3 rounded-md mb-4">
                {error}
              </div>
            )}
            
            {/* Dashboard Tab Content */}
            {activeTab === 'dashboard' && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                  <h2 className="text-xl font-bold">Dashboard</h2>
                  
                  <button 
                    onClick={() => setShowClearDataModal(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center transition-colors duration-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Local Storage Verwijderen
                  </button>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4 lg:p-6 mb-6">
                  <h3 className="text-lg font-medium mb-4">Statistics</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <p className="text-gray-400 text-sm">Total Teams</p>
                      <p className="text-2xl font-bold">{teams.length}</p>
                    </div>
                    
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <p className="text-gray-400 text-sm">Total Submissions</p>
                      <p className="text-2xl font-bold">{submissions.length}</p>
                    </div>
                    
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <p className="text-gray-400 text-sm">Pending Review</p>
                      <p className="text-2xl font-bold">{submissions.filter(sub => sub.rating === null || sub.rating === undefined).length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4 lg:p-6">
                  <h3 className="text-lg font-medium mb-4">Recent Submissions</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr>
                          <th className="px-2 sm:px-4 py-2 text-left">Team</th>
                          <th className="px-2 sm:px-4 py-2 text-left">Assignment</th>
                          <th className="px-2 sm:px-4 py-2 text-left hidden sm:table-cell">Date</th>
                          <th className="px-2 sm:px-4 py-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissions.slice(0, 5).map(submission => (
                          <tr key={submission.id} className="border-t border-gray-700">
                            <td className="px-2 sm:px-4 py-2 truncate max-w-[120px] sm:max-w-none">{getTeamName(submission.team_id)}</td>
                            <td className="px-2 sm:px-4 py-2">{getAssignmentNumber(submission.question_id)}</td>
                            <td className="px-2 sm:px-4 py-2 hidden sm:table-cell">{new Date(submission.created_at).toLocaleString()}</td>
                            <td className="px-2 sm:px-4 py-2">
                              <span className={`px-2 py-1 rounded text-xs ${getStatusClass(submission.rating)}`}>
                                {getStatusText(submission.rating)}
                              </span>
                            </td>
                          </tr>
                        ))}
                        
                        {submissions.length === 0 && (
                          <tr>
                            <td colSpan="4" className="px-4 py-4 text-center text-gray-500">No submissions yet</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            
            {/* Teams Tab Content */}
            {activeTab === 'teams' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Teams</h2>
                
                <div className="bg-gray-800 rounded-lg p-4 lg:p-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr>
                          <th className="px-2 sm:px-4 py-2 text-left">Rank</th>
                          <th className="px-2 sm:px-4 py-2 text-left">Team</th>
                          <th className="px-2 sm:px-4 py-2 text-left hidden sm:table-cell">Captain</th>
                          <th className="px-2 sm:px-4 py-2 text-right">Score</th>
                          <th className="px-2 sm:px-4 py-2 text-center hidden md:table-cell">Progress</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teamScores.map((score, index) => (
                          <tr 
                            key={score.team_id} 
                            className={`border-t border-gray-700 ${index === 0 ? 'bg-yellow-900 bg-opacity-30' : ''}`}
                          >
                            <td className="px-2 sm:px-4 py-3 font-bold">
                              {index === 0 ? '🏆 ' : ''}{index + 1}
                            </td>
                            <td className="px-2 sm:px-4 py-3 font-medium truncate max-w-[120px] sm:max-w-none">{score.team_name}</td>
                            <td className="px-2 sm:px-4 py-3 hidden sm:table-cell">{score.captain_name}</td>
                            <td className="px-2 sm:px-4 py-3 text-right font-bold">{score.total_score}</td>
                            <td className="px-2 sm:px-4 py-3 hidden md:table-cell">
                              <div className="w-full bg-gray-700 rounded-full h-2.5">
                                <div 
                                  className="bg-green-600 h-2.5 rounded-full" 
                                  style={{ width: `${Math.min(100, (score.submission_count / questions.length) * 100)}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-center mt-1">
                                {score.submission_count} / {questions.length} completed
                              </div>
                            </td>
                          </tr>
                        ))}
                        
                        {teamScores.length === 0 && (
                          <tr>
                            <td colSpan="5" className="px-4 py-4 text-center text-gray-500">No teams registered yet</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            
            {/* Assignments Tab Content */}
            {activeTab === 'assignments' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Assignments Review</h2>
                
                {filteredSubmissions.length === 0 ? (
                  <div className="bg-gray-800 rounded-lg p-6 text-center">
                    <p className="text-gray-400">No {filter !== 'all' ? filter : ''} submissions found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSubmissions.map(submission => (
                      <div 
                        key={submission.id} 
                        className="bg-gray-800 rounded-lg overflow-hidden shadow cursor-pointer transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                        onClick={() => openSubmissionDetail(submission)}
                      >
                        <div className="relative h-40 bg-gray-700 overflow-hidden group">
                          {submission.image_url ? (
                            <>
                              <img 
                                src={submission.image_url} 
                                alt="Submission" 
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                              <div className="absolute top-2 right-2 flex space-x-1">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Open in new tab
                                    const newWindow = window.open();
                                    newWindow.document.write(`<img src="${submission.image_url}" alt="Full size image" style="max-width: 100%; margin: 0 auto; display: block;">`);
                                    newWindow.document.title = `Image - ${getTeamName(submission.team_id)} - Assignment ${getAssignmentNumber(submission.question_id)}`;
                                  }}
                                  className="p-1 bg-gray-800 bg-opacity-75 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </button>
                                <span className={`px-2 py-1 rounded text-xs ${getStatusClass(submission.rating)}`}>
                                  {getStatusText(submission.rating)}
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <p className="text-gray-500">No image</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium truncate max-w-[120px] sm:max-w-none">Team: {getTeamName(submission.team_id)}</p>
                              <p className="text-sm text-gray-400">Assignment: {getAssignmentNumber(submission.question_id)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">
                                {new Date(submission.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          {(submission.rating === null || submission.rating === undefined) && (
                            <div className="mt-3">
                              <p className="text-sm mb-1">Rate this submission:</p>
                              <div className="flex space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRating(submission.id, 0);
                                  }}
                                  className="flex-1 py-1 px-3 bg-red-600 hover:bg-red-700 rounded text-white text-sm transition-colors duration-300"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          )}
                          
                          {submission.rating !== null && submission.rating !== undefined && (
                            <div className="mt-3">
                              <p className="text-sm">
                                {submission.rating > 0 ? (
                                  <span className="text-green-500 font-medium">Approved with {submission.rating} point{submission.rating !== 1 ? 's' : ''}</span>
                                ) : (
                                  <span className="text-red-500 font-medium">Rejected</span>
                                )}
                              </p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Reset rating
                                  handleRating(submission.id, null);
                                }}
                                className="mt-1 text-xs text-gray-400 hover:text-white"
                              >
                                Re-evaluate
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Backdrop for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      
      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-lg font-bold truncate max-w-[70%]">
                Assignment #{getAssignmentNumber(selectedSubmission.question_id)} - {getLocationName(selectedSubmission.question_id)}
              </h3>
              <button 
                onClick={closeSubmissionDetail}
                className="text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <p className="text-sm text-gray-400">Team</p>
                <p className="font-medium">{getTeamName(selectedSubmission.team_id)}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-400">Assignment</p>
                <p className="">{getQuestionText(selectedSubmission.question_id)}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-400">Submitted</p>
                <p>{new Date(selectedSubmission.created_at).toLocaleString()}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-400">Status</p>
                <p>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusClass(selectedSubmission.rating)}`}>
                    {getStatusText(selectedSubmission.rating)}
                  </span>
                </p>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-400 mb-2">Submission Image</p>
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  {selectedSubmission.image_url ? (
                    <>
                      <img 
                        src={selectedSubmission.image_url} 
                        alt="Submission" 
                        className="w-full object-contain max-h-96"
                      />
                      <div className="flex justify-end space-x-2 p-2 bg-gray-800">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            // Open in new tab
                            const newWindow = window.open();
                            newWindow.document.write(`<img src="${selectedSubmission.image_url}" alt="Full size image" style="max-width: 100%; margin: 0 auto; display: block;">`);
                            newWindow.document.title = `Image - ${getTeamName(selectedSubmission.team_id)} - Assignment ${getAssignmentNumber(selectedSubmission.question_id)}`;
                          }}
                          className="text-sm px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors duration-300"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Open Full Size
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            // Download image
                            const link = document.createElement('a');
                            link.href = selectedSubmission.image_url;
                            link.download = `assignment-${getAssignmentNumber(selectedSubmission.question_id)}-${getTeamName(selectedSubmission.team_id)}.jpg`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="text-sm px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors duration-300"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="h-64 flex items-center justify-center">
                      <p className="text-gray-500">No image</p>
                    </div>
                  )}
                </div>
              </div>
              
              {(selectedSubmission.rating === null || selectedSubmission.rating === undefined) ? (
                <div>
                  <p className="mb-2 font-medium">Rate this submission:</p>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <button
                      onClick={() => handleRating(selectedSubmission.id, 1)}
                      className="py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded font-medium transition-colors duration-300"
                    >
                      1 Point
                    </button>
                    <button
                      onClick={() => handleRating(selectedSubmission.id, 2)}
                      className="py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded font-medium transition-colors duration-300"
                    >
                      2 Points
                    </button>
                    <button
                      onClick={() => handleRating(selectedSubmission.id, 3)}
                      className="py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded font-medium transition-colors duration-300"
                    >
                      3 Points
                    </button>
                  </div>
                  <button
                    onClick={() => handleRating(selectedSubmission.id, 0)}
                    className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 rounded font-medium transition-colors duration-300"
                  >
                    Reject
                  </button>
                </div>
              ) : (
                <div>
                  <p className="mb-2 font-medium">Current rating:</p>
                  <div className="bg-gray-700 p-3 rounded-lg mb-3">
                    {selectedSubmission.rating > 0 ? (
                      <p className="text-center text-lg text-green-500 font-bold">
                        Approved with {selectedSubmission.rating} point{selectedSubmission.rating !== 1 ? 's' : ''}
                      </p>
                    ) : (
                      <p className="text-center text-lg text-red-500 font-bold">
                        Rejected
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRating(selectedSubmission.id, null)}
                    className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 rounded font-medium transition-colors duration-300"
                  >
                    Re-evaluate
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Clear Data Confirmation Modal */}
      {showClearDataModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg w-full max-w-md p-6">
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              
              <h3 className="text-xl font-bold mb-2">Confirm Data Deletion</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to clear all data? This will permanently delete all teams, submissions, and scores. This action cannot be undone.
              </p>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowClearDataModal(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearData}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-300"
                >
                  Yes, Delete All Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}