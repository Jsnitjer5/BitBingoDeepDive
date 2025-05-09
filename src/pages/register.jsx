import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    teamName: '',
    captainName: '',
    memberCount: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.teamName || !formData.captainName || !formData.memberCount) {
      return; // Don't submit if required fields are empty
    }
    
    setIsSubmitting(true);
    
    // Create team object
    const team = {
      id: Date.now(), // Simple unique ID
      team_name: formData.teamName,
      captain_name: formData.captainName,
      member_count: formData.memberCount,
      created_at: new Date().toISOString()
    };
    
    // Get existing teams or initialize empty array
    const existingTeams = JSON.parse(localStorage.getItem('teams') || '[]');
    
    // Add new team
    existingTeams.push(team);
    
    // Save back to localStorage
    localStorage.setItem('teams', JSON.stringify(existingTeams));
    
    // Set current team for the session
    localStorage.setItem('currentTeam', JSON.stringify(team));
    
    // Animate out
    setIsAnimating(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/quiz'); // Navigate to quiz page after successful registration
    }, 500);
  };

  const handleBack = () => {
    setIsAnimating(true);
    setTimeout(() => {
      navigate('/');
    }, 500);
  };

  const animationClass = isAnimating ? 'opacity-0 transform translate-y-10' : 'opacity-100 transform translate-y-0';

  return (
    <div className={`min-h-screen bg-black text-white flex items-center justify-center transition-all duration-500 ${animationClass}`}>
      <div className="w-full max-w-md px-6 py-8">
        {/* Header with back button */}
        <div className="pb-4">
          <button 
            onClick={handleBack} 
            className="text-white p-1 cursor-pointer hover:text-gray-300 transition-colors duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
        </div>
        
        {/* Page title */}
        <div className="pb-8">
          <h1 className="text-2xl font-bold">Registreren</h1>
        </div>
        
        {/* Registration form */}
        <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
          <input
            type="text"
            name="teamName"
            value={formData.teamName}
            onChange={handleChange}
            placeholder="Team naam:"
            className="bg-gray-900 text-white py-3 px-3 rounded-md border-none focus:outline-none focus:ring-0 transition-all duration-300 focus:bg-gray-800"
            required
          />
          
          <input
            type="text"
            name="captainName"
            value={formData.captainName}
            onChange={handleChange}
            placeholder="Naam van de team captain:"
            className="bg-gray-900 text-white py-3 px-3 rounded-md border-none focus:outline-none focus:ring-0 transition-all duration-300 focus:bg-gray-800"
            required
          />
          
          <input
            type="number"
            name="memberCount"
            value={formData.memberCount}
            onChange={handleChange}
            placeholder="Aantal leden:"
            className="bg-gray-900 text-white py-3 px-3 rounded-md border-none focus:outline-none focus:ring-0 transition-all duration-300 focus:bg-gray-800"
            required
          />
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-400 hover:bg-green-500 text-black font-medium py-3 px-4 rounded-full transition-colors duration-300"
            >
              {isSubmitting ? 'Bezig...' : 'Start de quiz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;