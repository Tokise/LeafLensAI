import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserFavorites, removeFromFavorites } from '../../firebase/favorites';
import Header from '../../components/header/Header';
import '../../css/Favorites.css';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const result = await getUserFavorites();
      if (result.success) {
        setFavorites(result.favorites);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId) => {
    try {
      const result = await removeFromFavorites(favoriteId);
      if (result.success) {
        setFavorites(favorites.filter(fav => fav.id !== favoriteId));
        toast.success('Plant removed from favorites');
      } else {
        toast.error('Failed to remove plant');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const openChatbot = (plant) => {
    // Navigate to chatbot with plant context
    navigate('/chatbot', { state: { plant } });
  };

  if (loading) {
    return (
      <div className="favorites-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="favorites-container">
      <Header />
      <h1>My Plant Collection</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="favorites-grid">
        {favorites.length === 0 ? (
          <p className="empty-state">
            No favorite plants yet. Start by scanning plants and adding them to your collection!
          </p>
        ) : (
          favorites.map((favorite) => (
            <div key={favorite.id} className="plant-card">
              <img 
                src={favorite.image} 
                alt={favorite.name}
                className="plant-image"
              />
              <div className="plant-info">
                <h3>{favorite.name}</h3>
                <p className="scientific-name">{favorite.scientificName}</p>
              </div>
              
              <div className="plant-actions">
                <button 
                  className="action-button view"
                  onClick={() => setSelectedPlant(favorite)}
                >
                  View Details
                </button>
                <button 
                  className="action-button chat"
                  onClick={() => openChatbot(favorite)}
                >
                  Ask Expert
                </button>
                <button 
                  className="action-button remove"
                  onClick={() => handleRemoveFavorite(favorite.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedPlant && (
        <div className="modal-overlay" onClick={() => setSelectedPlant(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setSelectedPlant(null)}
            >
              ×
            </button>
            
            <img 
              src={selectedPlant.image} 
              alt={selectedPlant.name}
              className="modal-image"
            />
            
            <h2>{selectedPlant.name}</h2>
            <p className="scientific-name">{selectedPlant.scientificName}</p>
            <p className="description">{selectedPlant.description}</p>

            <div className="care-guide">
              <h3>Care Guide</h3>
              <ul>
                <li><strong>Water:</strong> {selectedPlant.careGuide.water}</li>
                <li><strong>Sunlight:</strong> {selectedPlant.careGuide.sunlight}</li>
                <li><strong>Soil:</strong> {selectedPlant.careGuide.soil}</li>
                <li><strong>Temperature:</strong> {selectedPlant.careGuide.temperature}</li>
              </ul>
            </div>

            <div className="fun-facts">
              <h3>Fun Facts</h3>
              <ul>
                {selectedPlant.funFacts.map((fact, index) => (
                  <li key={index}>{fact}</li>
                ))}
              </ul>
            </div>

            <button 
              className="chat-button"
              onClick={() => {
                setSelectedPlant(null);
                openChatbot(selectedPlant);
              }}
            >
              Ask Plant Expert About This Plant
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Favorites;
