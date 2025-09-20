import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft,
  faBolt,
  faTh,
  faClock,
  faSyncAlt,
  faCamera,
  faFolderOpen,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { addToFavorites } from '../../firebase/favorites';
import { notificationService } from '../../utils/notificationService';
import '../../css/Scan.css';

const Scan = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [plantInfo, setPlantInfo] = useState(null);
  const [showPermissionHelp, setShowPermissionHelp] = useState(false);
  const [cameraMode, setCameraMode] = useState('normal');
  const [flashMode, setFlashMode] = useState('off');
  const [showGrid, setShowGrid] = useState(false);
  const [timer, setTimer] = useState(0);
  const [facingMode, setFacingMode] = useState('environment');
  const [lastCapturedImage, setLastCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Hide bottom navigation when in camera mode
  useEffect(() => {
    document.body.classList.add('camera-mode');
    return () => {
      document.body.classList.remove('camera-mode');
    };
  }, []);

  const startCamera = async () => {
    try {
      // Check if we're on HTTPS or localhost
      const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
      if (!isSecure) {
        throw new Error('Camera access requires HTTPS. Please use a secure connection.');
      }

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser.');
      }

      // Show permission request message
      toast.loading('Requesting camera permission...', { duration: 2000 });

      // Request camera permission with current facing mode
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setIsCapturing(true);
      toast.success('Camera started successfully!');
    } catch (error) {
      console.error('Error accessing camera:', error);
      
      let errorMessage = 'Unable to access camera. ';
      let showInstructions = false;
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. ';
        showInstructions = true;
        setShowPermissionHelp(true);
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera found. Please connect a camera and try again.';
      } else if (error.name === 'NotReadableError') {
        errorMessage += 'Camera is already in use by another application.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage += 'Camera constraints cannot be satisfied.';
      } else if (error.name === 'SecurityError') {
        errorMessage += 'Camera access blocked due to security restrictions.';
      } else if (error.message.includes('HTTPS')) {
        errorMessage = error.message;
      } else {
        errorMessage += 'Please check your camera permissions and try again.';
      }
      
      toast.error(errorMessage);
      
      if (showInstructions) {
        // Show detailed instructions for permission denied
        setTimeout(() => {
          toast.error('Click the camera icon in your browser\'s address bar to allow camera access', {
            duration: 5000,
            style: {
              background: '#ff6b6b',
              color: 'white',
              fontSize: '14px'
            }
          });
        }, 1000);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      setIsCapturing(false);
    }
  };

  const switchCamera = async () => {
    if (isCapturing) {
      stopCamera();
      setFacingMode(facingMode === 'environment' ? 'user' : 'environment');
      setTimeout(() => startCamera(), 100);
    }
  };

  const toggleFlash = () => {
    const modes = ['off', 'on', 'auto'];
    const currentIndex = modes.indexOf(flashMode);
    setFlashMode(modes[(currentIndex + 1) % modes.length]);
  };

  const toggleGrid = () => {
    setShowGrid(!showGrid);
  };

  const setTimerMode = () => {
    const timers = [0, 3, 5, 10];
    const currentIndex = timers.indexOf(timer);
    setTimer(timers[(currentIndex + 1) % timers.length]);
  };

  const getFlashIcon = () => {
    return faBolt;
  };

  const getTimerText = () => {
    return timer === 0 ? 'Timer' : `${timer}s`;
  };

  const captureImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const image = canvas.toDataURL('image/jpeg');
    setCapturedImage(image);
    setLastCapturedImage(image);
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

  // Check if camera is supported and secure
  const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
  const isCameraSupported = navigator.mediaDevices && navigator.mediaDevices.getUserMedia;

  return (
    <div className="camera-app">
      {/* Top Controls Bar */}
      <div className="camera-top-controls">
        <div className="camera-controls-left">
          <button 
            className="back-btn"
            onClick={() => navigate('/')}
            title="Back"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
        </div>
        
        <div className="camera-controls-center">
          <button 
            className={`camera-control-btn ${flashMode !== 'off' ? 'active' : ''}`}
            onClick={toggleFlash}
            title={`Flash: ${flashMode}`}
          >
            <FontAwesomeIcon icon={getFlashIcon()} />
          </button>
          <button 
            className={`camera-control-btn ${showGrid ? 'active' : ''}`}
            onClick={toggleGrid}
            title="Grid Lines"
          >
            <FontAwesomeIcon icon={faTh} />
          </button>
          <button 
            className={`camera-control-btn ${timer > 0 ? 'active' : ''}`}
            onClick={setTimerMode}
            title="Timer"
          >
            <FontAwesomeIcon icon={faClock} />
            {timer > 0 && <span className="timer-text">{timer}</span>}
          </button>
        </div>
        
        <div className="camera-controls-right">
          {/* Empty for balance */}
        </div>
      </div>

      {/* Camera Modes */}
      <div className="camera-modes">
        <div className="mode-selector">
          <button 
            className={`mode-btn ${cameraMode === 'normal' ? 'active' : ''}`}
            onClick={() => setCameraMode('normal')}
          >
            NORMAL
          </button>
          <button 
            className={`mode-btn ${cameraMode === 'square' ? 'active' : ''}`}
            onClick={() => setCameraMode('square')}
          >
            SQUARE
          </button>
          <button 
            className={`mode-btn ${cameraMode === 'portrait' ? 'active' : ''}`}
            onClick={() => setCameraMode('portrait')}
          >
            PORTRAIT
          </button>
        </div>
      </div>

      {/* Main Camera View */}
      <div className={`camera-viewport ${cameraMode}`}>
        {isCapturing ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="camera-feed"
            />
            {showGrid && <div className="camera-grid" />}
          </>
        ) : (
          <div className="camera-placeholder">
            <div className="placeholder-icon">
              <FontAwesomeIcon icon={faCamera} />
            </div>
            <p>Camera Ready</p>
            {!isSecure && (
              <div className="security-warning">
                <p>⚠️ Camera requires HTTPS connection</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="camera-bottom-controls">
        <div className="camera-controls-left">
          <button 
            className="camera-control-btn"
            onClick={switchCamera}
            title="Switch Camera"
          >
            <FontAwesomeIcon icon={faSyncAlt} />
          </button>
        </div>

        <div className="camera-controls-center">
          <button 
            className={`capture-btn ${isCapturing ? 'active' : ''}`}
            onClick={isCapturing ? captureImage : startCamera}
            disabled={!isSecure || !isCameraSupported}
          >
            <div className="capture-btn-inner">
              <FontAwesomeIcon icon={faCamera} />
            </div>
          </button>
        </div>

        <div className="camera-controls-right">
          <label className="upload-btn">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <FontAwesomeIcon icon={faFolderOpen} />
          </label>
        </div>
      </div>

      {/* Permission Help Modal */}
      {showPermissionHelp && (
        <div className="permission-modal">
          <div className="permission-content">
            <h3>🔒 Camera Permission Required</h3>
            <p>To use the camera, please follow these steps:</p>
            <ol>
              <li>Look for a camera icon in your browser's address bar</li>
              <li>Click on it and select "Allow" for camera access</li>
              <li>Refresh the page and try again</li>
            </ol>
            <p><strong>Alternative:</strong> Use the upload button to select a photo from your device.</p>
            <button 
              className="close-help-button"
              onClick={() => setShowPermissionHelp(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}

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
              <FontAwesomeIcon icon={faTimes} />
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
