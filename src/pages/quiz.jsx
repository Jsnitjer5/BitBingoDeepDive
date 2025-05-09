import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import questionsData from '../questions.json'

function Quiz() {
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState('next'); // 'next' or 'prev'
  const [completedQuestions, setCompletedQuestions] = useState([]);
  const [maxAllowedQuestion, setMaxAllowedQuestion] = useState(0);
  
  useEffect(() => {
    // Load questions from the data file
    setQuestions(questionsData.questions);
    
    // Get current team from localStorage
    const currentTeam = localStorage.getItem('currentTeam');
    if (!currentTeam) {
      // Try to get any team from teams array as fallback
      const teams = JSON.parse(localStorage.getItem('teams') || '[]');
      if (teams.length > 0) {
        setTeam(teams[0]);
        localStorage.setItem('currentTeam', JSON.stringify(teams[0]));
      } else {
        // No team found, redirect to registration
        navigate('/register');
        return;
      }
    } else {
      setTeam(JSON.parse(currentTeam));
    }
    
    // Load previously completed questions for this team
    loadCompletedQuestionsAndSetMaxAllowed();
    
    // Add initial entrance animation
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  // Load the completed questions for the current team and set the max allowed question
  const loadCompletedQuestionsAndSetMaxAllowed = () => {
    try {
      const allSubmissions = JSON.parse(localStorage.getItem('submissions') || '[]');
      const currentTeam = JSON.parse(localStorage.getItem('currentTeam') || '{}');
      
      if (currentTeam && currentTeam.id) {
        // Filter submissions for current team only
        const teamSubmissions = allSubmissions.filter(sub => sub.team_id === currentTeam.id);
        
        // Get list of question IDs that this team has already submitted
        const completed = teamSubmissions.map(sub => sub.question_id);
        setCompletedQuestions(completed);
        
        // Find the highest order_number of completed questions
        let highestCompletedOrder = 0;
        
        // If there are completed questions
        if (completed.length > 0) {
          // Get all questions with their order numbers
          const questionOrders = questionsData.questions.map(q => ({
            id: q.id,
            order: q.order_number
          }));
          
          // Find the highest order of completed questions
          completed.forEach(completedId => {
            const question = questionOrders.find(q => q.id === completedId);
            if (question && question.order > highestCompletedOrder) {
              highestCompletedOrder = question.order;
            }
          });
        }
        
        // Set max allowed question to the next question after the highest completed one
        const maxAllowed = Math.min(highestCompletedOrder, questionsData.questions.length - 1);
        setMaxAllowedQuestion(maxAllowed);
        
        // Make sure currentQuestion is not higher than allowed
        if (currentQuestion > maxAllowed) {
          setCurrentQuestion(maxAllowed);
        }
      }
    } catch (err) {
      console.error('Error loading completed questions:', err);
      setError('Er ging iets mis bij het laden van je voortgang. Probeer het opnieuw.');
    }
  };
  
  // Check if current question has already been completed
  const isCurrentQuestionCompleted = () => {
    return completedQuestions.includes(questions[currentQuestion]?.id);
  };
  
  // Check if the next question is accessible
  const isNextQuestionAccessible = () => {
    return currentQuestion < maxAllowedQuestion;
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setError(''); // Clear any previous errors

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setPreviewImage(reader.result);
      };
      reader.onerror = () => {
        setError('Er ging iets mis bij het laden van de foto. Probeer het opnieuw.');
      };
    }
  };
  
  const handleSubmit = () => {
    if (!selectedImage) {
      setError('Upload een foto om door te gaan');
      return;
    }
    
    setIsSubmitting(true);
    setError(''); // Clear any previous errors
    
    try {
      const existingSubmissions = JSON.parse(localStorage.getItem('submissions') || '[]');
      const currentQuestionId = questions[currentQuestion].id;
      
      // Check if this question has already been submitted by this team
      const alreadySubmitted = existingSubmissions.some(
        sub => sub.team_id === team.id && sub.question_id === currentQuestionId
      );
      
      // If already submitted, replace the existing submission
      if (alreadySubmitted) {
        // Find the index of the existing submission
        const submissionIndex = existingSubmissions.findIndex(
          sub => sub.team_id === team.id && sub.question_id === currentQuestionId
        );
        
        // Update the existing submission with the new image
        existingSubmissions[submissionIndex] = {
          ...existingSubmissions[submissionIndex],
          image_url: previewImage,
          created_at: new Date().toISOString(),
          rating: null // Reset rating since it's a new submission
        };
      } else {
        // Create a new submission
        const newSubmission = {
          id: Date.now(),
          team_id: team.id,
          question_id: currentQuestionId,
          image_url: previewImage,
          created_at: new Date().toISOString(),
          rating: null
        };
        
        // Add to existing submissions
        existingSubmissions.push(newSubmission);
        
        // Update completed questions
        const newCompleted = [...completedQuestions, currentQuestionId];
        setCompletedQuestions(newCompleted);
        
        // Update the max allowed question
        const currentOrderNumber = questions[currentQuestion].order_number;
        if (currentOrderNumber > maxAllowedQuestion) {
          setMaxAllowedQuestion(currentOrderNumber);
        }
      }
      
      // Save updated submissions back to localStorage
      localStorage.setItem('submissions', JSON.stringify(existingSubmissions));
      
      // Reset image selection
      setSelectedImage(null);
      setPreviewImage('');
      
      // Move to next question if available
      if (currentQuestion < questions.length - 1) {
        setAnimationDirection('next');
        setIsAnimating(true);
        
        setTimeout(() => {
          setCurrentQuestion(currentQuestion + 1);
          setIsAnimating(false);
        }, 300);
      } else {
        // All questions completed, navigate to thank you
        navigate('/bedankt');
      }
    } catch (err) {
      console.error('Error submitting:', err);
      setError('Er ging iets mis bij het uploaden. Probeer het opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const goHome = () => {
    navigate('/');
  };

  const goToAdmin = () => {
    navigate('/admin');
  };
  
  // Handle going to previous question
  const goToPrevQuestion = () => {
    if (currentQuestion > 0) {
      setAnimationDirection('prev');
      setIsAnimating(true);
      
      setTimeout(() => {
        setCurrentQuestion(currentQuestion - 1);
        setIsAnimating(false);
      }, 300);
    }
  };
  
  // Handle going to next question directly (only if accessible)
  const goToNextQuestion = () => {
    if (currentQuestion < questions.length - 1 && 
        (isCurrentQuestionCompleted() || currentQuestion < maxAllowedQuestion)) {
      setAnimationDirection('next');
      setIsAnimating(true);
      
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
        setIsAnimating(false);
      }, 300);
    }
  };
  
  if (questions.length === 0 || !team) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center">
          {error ? (
            <p className="text-red-400">{error}</p>
          ) : (
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p>Laden...</p>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  const currentQuestionData = questions[currentQuestion];
  
  // Calculate animation classes
  const pageAnimationClass = isAnimating 
    ? (animationDirection === 'next' ? 'opacity-0 transform translate-x-20' : 'opacity-0 transform -translate-x-20') 
    : 'opacity-100 transform translate-x-0';
  
  // Check if current question is already completed
  const currentCompleted = isCurrentQuestionCompleted();
  
  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative pb-16">
      {/* Header */}
      <div className="bg-gray-900 py-4 px-4 sm:px-6 flex justify-between items-center shadow-md sticky top-0 z-10">
        <h1 className="text-xl font-bold text-green-400">Stadsbingo</h1>
        <div className="flex items-center bg-gray-800 px-3 py-1 rounded-full">
          <span className="font-medium">{currentQuestion + 1}</span>
          <span className="mx-1 text-gray-400">/</span>
          <span className="text-gray-400">{questions.length}</span>
        </div>
      </div>
      
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${pageAnimationClass}`}>
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Location Image */}
          <div className="w-full aspect-[4/3] rounded-lg overflow-hidden relative mb-6 shadow-lg">
            {currentQuestionData.location_image_url ? (
              <img 
                src={currentQuestionData.location_image_url} 
                alt={currentQuestionData.location_name}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <p className="text-gray-400">Geen afbeelding beschikbaar</p>
              </div>
            )}
            <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 px-3 py-1 rounded-full flex items-center space-x-2">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Locatie #{currentQuestion + 1}</span>
            </div>
          </div>
          
          {/* Location Name */}
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-green-400">{currentQuestionData.location_name}</h2>
          
          {/* Assignment Card */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6 shadow-md border border-gray-700">
            <h3 className="font-bold text-lg mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Opdracht:
            </h3>
            <p className="text-base text-gray-300 leading-relaxed">{currentQuestionData.question_text}</p>
          </div>
          
          {/* Upload Button or Completed Status */}
          <div className="mb-8">
            {currentCompleted ? (
              <div className="w-full py-3 bg-gray-800 border border-green-500 text-white font-bold rounded-lg text-center flex items-center justify-center space-x-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Foto Ingediend</span>
                
                {currentQuestion < questions.length - 1 && (isCurrentQuestionCompleted() || currentQuestion < maxAllowedQuestion) && (
                  <button 
                    onClick={goToNextQuestion}
                    className="ml-2 bg-green-500 text-black px-3 py-1 rounded-full text-sm font-bold hover:bg-green-400 transition-colors duration-300"
                  >
                    Volgende
                  </button>
                )}
              </div>
            ) : (
              <>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageChange}
                  className="hidden"
                  id="photo-upload"
                />
                <label 
                  htmlFor="photo-upload" 
                  className="block w-full py-3 bg-green-500 hover:bg-green-400 text-black font-bold rounded-lg text-center cursor-pointer transition-colors duration-300 shadow-md flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Upload Foto
                </label>
              </>
            )}
          </div>
          
          {/* Map Section */}
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 shadow-md overflow-hidden">
            <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Kaart
            </h3>
            {currentQuestionData.map_image_url ? (
              <img 
                src={currentQuestionData.map_image_url} 
                alt="Map"
                className="w-full rounded-md overflow-hidden transition-transform duration-500 hover:scale-105"
              />
            ) : (
              <div className="h-40 flex items-center justify-center bg-gray-900 rounded-md">
                <p className="text-gray-400">Geen kaart beschikbaar</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Navigation Controls */}
      {currentQuestion > 0 && (
        <button 
          onClick={goToPrevQuestion}
          className="hidden sm:flex absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white hover:bg-gray-700 rounded-full p-3 shadow-lg transition-all duration-300"
          aria-label="Previous question"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      
      {currentQuestion < questions.length - 1 && (isCurrentQuestionCompleted() || currentQuestion < maxAllowedQuestion) && (
        <button 
          onClick={goToNextQuestion}
          className="hidden sm:flex absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white hover:bg-gray-700 rounded-full p-3 shadow-lg transition-all duration-300"
          aria-label="Next question"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
      
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 py-3 px-4 shadow-lg z-20">
        <div className="flex justify-between items-center max-w-2xl mx-auto">
          <button 
            onClick={goHome}
            className="text-gray-400 hover:text-white flex flex-col items-center transition-colors duration-300"
            aria-label="Go to home"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-1">Home</span>
          </button>
          
          {/* Navigation Controls for Mobile */}
          <div className="flex space-x-6 sm:space-x-8">
            {currentQuestion > 0 && (
              <button 
                onClick={goToPrevQuestion}
                className="sm:hidden text-gray-400 hover:text-white flex flex-col items-center transition-colors duration-300"
                aria-label="Previous question"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-xs mt-1">Vorige</span>
              </button>
            )}
            
            {currentQuestion < questions.length - 1 && (isCurrentQuestionCompleted() || currentQuestion < maxAllowedQuestion) && (
              <button 
                onClick={goToNextQuestion}
                className="sm:hidden text-gray-400 hover:text-white flex flex-col items-center transition-colors duration-300"
                aria-label="Next question"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-xs mt-1">Volgende</span>
              </button>
            )}
          </div>
          
          <button 
            onClick={goToAdmin}
            className="text-gray-400 hover:text-white flex flex-col items-center transition-colors duration-300"
            aria-label="Go to admin panel"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs mt-1">Admin</span>
          </button>
        </div>
      </div>
      
      {/* Photo Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-gray-900 rounded-lg max-w-lg w-full p-6 border border-gray-700 shadow-xl">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Bevestig je foto
            </h2>
            
            <div className="mb-6 overflow-hidden rounded-lg border border-gray-700">
              <img 
                src={previewImage} 
                alt="Preview" 
                className="w-full max-h-72 object-contain bg-gray-800 rounded-lg transition-transform duration-500 hover:scale-105"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => setPreviewImage('')}
                className="py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-300 font-medium flex-1 flex justify-center items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Annuleren
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="py-3 px-4 bg-green-500 hover:bg-green-400 text-black font-bold rounded-lg transition-colors duration-300 flex-1 flex justify-center items-center disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Bezig...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Verstuur Foto
                  </>
                )}
              </button>
            </div>
            
            {error && (
              <div className="mt-4 text-sm text-red-400 bg-red-900 bg-opacity-30 p-3 rounded-md">
                <div className="flex items-start">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Add keyframes animation for fading in elements */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default Quiz;