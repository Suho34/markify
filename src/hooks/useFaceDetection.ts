import { useEffect, useRef, useState } from 'react';

// Dynamically import face-api only on the client
let faceapi: any;
if (typeof window !== 'undefined') {
  faceapi = require('@vladmandic/face-api');
}

export const useFaceDetection = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceDescriptor, setFaceDescriptor] = useState<Float32Array | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const loadModels = async () => {
      if (!faceapi) return;
      const MODEL_URL = '/models';
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading models:', error);
      }
    };
    loadModels();
  }, []);

  const startVideo = async () => {
    if (!videoRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480, facingMode: 'user' } 
      });
      videoRef.current.srcObject = stream;
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        alert('CAMERA ACCESS DENIED: Please enable camera permissions in your browser settings to use Markify.');
      }
      console.error('Error starting video:', err);
    }
  };

  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleVideoOnPlay = () => {
    if (!videoRef.current || !canvasRef.current || !isLoaded || !faceapi) return;
    
    setIsDetecting(true);
    const interval = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current || !isLoaded || !faceapi || videoRef.current.readyState !== 4) return;

      try {
        const video = videoRef.current;
        const displaySize = { width: video.videoWidth, height: video.videoHeight };
        if (displaySize.width === 0 || displaySize.height === 0) return;

        // Detect all faces to compare sizes
        const detections = await faceapi.detectAllFaces(
          video,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 128, scoreThreshold: 0.5 })
        )
        .withFaceLandmarks()
        .withFaceDescriptors();

        if (detections.length > 0) {
          // Find the largest face (closest to camera)
          const largestFace = detections.reduce((prev: any, current: any) => {
            const prevArea = prev.detection.box.width * prev.detection.box.height;
            const currentArea = current.detection.box.width * current.detection.box.height;
            return (currentArea > prevArea) ? current : prev;
          });

          setFaceDetected(true);
          setFaceDescriptor(largestFace.descriptor);

          // Draw ONLY the largest face for visual feedback
          faceapi.matchDimensions(canvasRef.current, displaySize);
          const resizedDetection = faceapi.resizeResults(largestFace, displaySize);
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, displaySize.width, displaySize.height);
            faceapi.draw.drawDetections(canvasRef.current, resizedDetection);
          }
        } else {
          setFaceDetected(false);
          setFaceDescriptor(null);
          
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) ctx.clearRect(0, 0, displaySize.width, displaySize.height);
        }
      } catch (err) {
        // Silent fail
      }
    }, 50);

    return () => {
      clearInterval(interval);
      setIsDetecting(false);
    };
  };

  return {
    isLoaded,
    isDetecting,
    faceDetected,
    faceDescriptor,
    videoRef,
    canvasRef,
    startVideo,
    stopVideo,
    handleVideoOnPlay,
  };
};
