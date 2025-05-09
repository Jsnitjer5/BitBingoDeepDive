import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function ThankYou() {
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  
  useEffect(() => {
    setTimeout(() => {
      setAnimateIn(true);
    }, 100);
  }, []);
  
  const goToHome = () => {
    setIsAnimating(true);
    setTimeout(() => {
      navigate('/');
    }, 500);
  };

  // Animation classes
  const pageAnimationClass = isAnimating
    ? 'opacity-0 transform translate-y-10'
    : 'opacity-100 transform translate-y-0';
  
  const contentAnimationClass = animateIn 
    ? 'opacity-100 transform scale-100 translate-y-0' 
    : 'opacity-0 transform scale-95 translate-y-10';

  return (
    <div className={`min-h-screen bg-black text-white flex items-center justify-center p-4 transition-all duration-500 ${pageAnimationClass}`}>
      <div className={`max-w-md text-center transition-all duration-700 ${contentAnimationClass}`}>
        <div className="text-6xl mb-6 animate-bounce">🎉</div>
        <h1 className="text-3xl font-bold mb-4">Gefeliciteerd!</h1>
        <p className="text-xl mb-8">
          Je hebt alle vragen van de Stadsbingo beantwoord! 
          De coaches gaan je antwoorden beoordelen.
        </p>
        
        <p className="mb-8 text-white">
          Bedankt voor je deelname!
        </p>
        
        <button
          onClick={goToHome}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105"
        >
          Terug naar Home
        </button>
      </div>
    </div>
  );
}

export default ThankYou;