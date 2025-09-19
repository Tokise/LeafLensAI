import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { addToFavorites } from '../../firebase/favorites';
import { notificationService } from '../../utils/notificationService';
import '../../css/Scan.css';

const Scan = () => {
  const [showModal, setShowModal] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [plantInfo, setPlantInfo] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setIsCapturing(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please make sure you have granted camera permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      setIsCapturing(false);
    }
  };

  const captureImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const image = canvas.toDataURL('image/jpeg');
    setCapturedImage(image);
    stopCamera();
    analyzePlant(image);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target.result);
        analyzePlant(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzePlant = async (imageData) => {
    // TODO: Implement API call to plant identification service
    // For now, we'll use mock data
    setPlantInfo({
      name: 'Sample Plant',
      scientificName: 'Plantus Exampleus',
      description: 'This is a sample plant description.',
      careGuide: {
        water: 'Water twice a week',
        sunlight: 'Partial shade to full sun',
        soil: 'Well-draining potting mix',
        temperature: '65-80°F (18-27°C)'
      },
      funFacts: [
        'This plant is native to various regions.',
        'It has been used in traditional medicine.',
        'Can grow up to 2 meters tall.'
      ]
    });
    setShowModal(true);
  };

  const handleAddToFavorites = async () => {
    console.log('Adding to favorites...', plantInfo);
    if (!plantInfo) {
      console.log('No plant info available');
      return;
    }

    try {
      console.log('Preparing to save plant:', {
        name: plantInfo.name,
        scientificName: plantInfo.scientificName
      });

      const result = await addToFavorites({
        name: plantInfo.name,
        scientificName: plantInfo.scientificName,
        description: plantInfo.description,
        careGuide: plantInfo.careGuide,
        funFacts: plantInfo.funFacts,
        image: capturedImage
      });

      console.log('Save result:', result);

      if (result.success) {
        toast.success('Plant added to favorites!');
        // Create an in-app notification
        notificationService.createPlantSavedNotification(plantInfo.name);
      } else {
        console.error('Failed to add to favorites:', result.error);
        toast.error('Failed to add to favorites. Please try again.');
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      toast.error('An error occurred. Please try again.');
    }
  };

  return (
    <div className="scan-container">
 
      <h1>Scan a Plant</h1>
      
      <div className="scan-options">
        <button 
          className="scan-button"
          onClick={isCapturing ? stopCamera : startCamera}
        >
          {isCapturing ? 'Stop Camera' : 'Start Camera'}
        </button>
        
        <label className="upload-button">
          Upload Image
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      <div className="camera-container">
        {isCapturing && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="camera-feed"
            />
            <button 
              className="capture-button"
              onClick={captureImage}
            >
              Capture
            </button>
          </>
        )}
      </div>

      {showModal && plantInfo && (
        <motion.div 
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowModal(false)}
        >
          <motion.div 
            className="modal-content"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onClick={e => e.stopPropagation()}
          >
            <button 
              className="modal-close"
              onClick={() => setShowModal(false)}
            >
              ×
            </button>
            
            <div className="plant-info">
              {capturedImage && (
                <img 
                  src={capturedImage} 
                  alt="Captured plant"
                  className="captured-image"
                />
              )}
              
              <h2>{plantInfo.name}</h2>
              <p className="scientific-name">{plantInfo.scientificName}</p>
              <p className="description">{plantInfo.description}</p>

              <div className="care-guide">
                <h3>Care Guide</h3>
                <ul>
                  <li><strong>Water:</strong> {plantInfo.careGuide.water}</li>
                  <li><strong>Sunlight:</strong> {plantInfo.careGuide.sunlight}</li>
                  <li><strong>Soil:</strong> {plantInfo.careGuide.soil}</li>
                  <li><strong>Temperature:</strong> {plantInfo.careGuide.temperature}</li>
                </ul>
              </div>

              <div className="fun-facts">
                <h3>Fun Facts</h3>
                <ul>
                  {plantInfo.funFacts.map((fact, index) => (
                    <li key={index}>{fact}</li>
                  ))}
                </ul>
              </div>

              <button 
                className="favorite-button"
                onClick={handleAddToFavorites}
              >
                Add to Favorites
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Scan;
