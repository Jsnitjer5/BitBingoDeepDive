import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Mock Image Component (replace with your actual image import)
const StadsbingoImage = () => (
  <img src="/images/stadsbingo.png" alt="Stadsbingo Logo" className="w-full rounded-lg" />
);

const Home = () => {
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const isMobile = windowWidth < 768;
  
  const handleRegister = () => {
    setIsAnimating(true);
    setTimeout(() => {
      navigate('/register');
    }, 500);
  };
  
  const goToQuiz = () => {
    setIsAnimating(true);
    setTimeout(() => {
      navigate('/quiz');
    }, 500);
  };
  
  const goToAdmin = () => {
    setIsAnimating(true);
    setTimeout(() => {
      navigate('/admin');
    }, 500);
  };
  
  // Check if team already exists
  const hasTeam = localStorage.getItem('currentTeam');
  
  const pageAnimationClass = isAnimating
    ? 'opacity-0 transform translate-y-10'
    : 'opacity-100 transform translate-y-0';

  return (
    <div className={`relative min-h-screen bg-black overflow-hidden transition-all duration-500 ${pageAnimationClass}`}>
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md flex flex-col items-center">
          <div className="w-full bg-black rounded-lg mb-8 transform transition-all duration-500 hover:scale-105">
            <StadsbingoImage />
          </div>
          
          <div className="w-full space-y-4">
            {hasTeam ? (
              <button 
                onClick={goToQuiz}
                className="bg-green-400 hover:bg-green-500 text-black font-bold py-3 px-6 rounded-full w-full transition-all duration-300 transform hover:scale-105"
              >
                Ga naar Quiz
              </button>
            ) : (
              <button 
                onClick={handleRegister}
                className="bg-green-400 hover:bg-green-500 text-black font-bold py-3 px-6 rounded-full w-full transition-all duration-300 transform hover:scale-105"
              >
                Start het spel
              </button>
            )}
            
            <button 
              onClick={goToAdmin}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full w-full transition-all duration-300 transform hover:scale-105"
            >
              Admin Panel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;