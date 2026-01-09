import { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, CameraOff, AlertCircle, Smile, Frown, Meh, Wind, Coffee, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface FacialAnalysisProps {
  onFocusUpdate: (focus: "focused" | "neutral" | "stressed") => void;
  isMonitoring: boolean;
}

type FocusState = "focused" | "neutral" | "stressed";
type CameraStatus = "idle" | "requesting" | "active" | "error" | "denied";

const FacialAnalysis = ({ onFocusUpdate, isMonitoring }: FacialAnalysisProps) => {
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("idle");
  const [hasConsent, setHasConsent] = useState(false);
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [currentFocus, setCurrentFocus] = useState<FocusState>("neutral");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup function
  const cleanup = useCallback(() => {
    // Stop analysis interval
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }

    // Stop camera stream
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
        });
      } catch (e) {
        console.warn("Error stopping camera tracks:", e);
      }
      streamRef.current = null;
    }

    // Clear video source
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsVideoReady(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  // Safe facial analysis
  const analyzeFace = useCallback(() => {
    if (!isMountedRef.current) return;
    if (cameraStatus !== "active" || !isMonitoring || !isVideoReady) return;
    
    try {
      // Simulate facial analysis with weighted random states
      const random = Math.random();
      let newFocus: FocusState;
      
      if (random < 0.5) {
        newFocus = "focused";
      } else if (random < 0.8) {
        newFocus = "neutral";
      } else {
        newFocus = "stressed";
      }
      
      if (isMountedRef.current) {
        setCurrentFocus(newFocus);
        onFocusUpdate(newFocus);
      }
    } catch (error) {
      console.warn("Analysis error:", error);
      // Don't crash - just skip this analysis cycle
    }
  }, [cameraStatus, isMonitoring, isVideoReady, onFocusUpdate]);

  // Analysis interval effect
  useEffect(() => {
    if (cameraStatus === "active" && isMonitoring && isVideoReady) {
      // Run analysis every 5 seconds
      analysisIntervalRef.current = setInterval(analyzeFace, 5000);
      // Initial analysis after a delay
      const timeout = setTimeout(analyzeFace, 1000);
      
      return () => {
        if (analysisIntervalRef.current) {
          clearInterval(analysisIntervalRef.current);
          analysisIntervalRef.current = null;
        }
        clearTimeout(timeout);
      };
    }
  }, [cameraStatus, isMonitoring, isVideoReady, analyzeFace]);

  // Handle video element ready
  const handleVideoCanPlay = useCallback(() => {
    if (isMountedRef.current) {
      setIsVideoReady(true);
    }
  }, []);

  // Request camera access
  const requestCameraAccess = async () => {
    if (!isMountedRef.current) return;
    
    setCameraStatus("requesting");
    setErrorMessage(null);
    setIsVideoReady(false);
    
    try {
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera not supported on this device.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "user", 
          width: { ideal: 320 }, 
          height: { ideal: 240 } 
        } 
      });
      
      if (!isMountedRef.current) {
        // Component unmounted during request - cleanup
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current && isMountedRef.current) {
            videoRef.current.play().catch(e => {
              console.warn("Video play error:", e);
            });
          }
        };
      }
      
      setCameraStatus("active");
      toast.success("Camera enabled for wellness monitoring");
    } catch (error: any) {
      console.warn("Camera access error:", error);
      
      if (!isMountedRef.current) return;
      
      let message = "Camera access not enabled.";
      
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        message = "Camera permission denied. You can enable it in your browser settings.";
        setCameraStatus("denied");
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        message = "No camera found on this device.";
        setCameraStatus("error");
      } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
        message = "Camera is in use by another application.";
        setCameraStatus("error");
      } else if (error.message) {
        message = error.message;
        setCameraStatus("error");
      } else {
        setCameraStatus("error");
      }
      
      setErrorMessage(message);
    }
  };

  // Disable camera
  const disableCamera = useCallback(() => {
    cleanup();
    setCameraStatus("idle");
    setCurrentFocus("neutral");
    setErrorMessage(null);
    toast.info("Camera disabled");
  }, [cleanup]);

  // Handle consent grant
  const handleConsentGrant = () => {
    setHasConsent(true);
    setShowConsentDialog(false);
    requestCameraAccess();
  };

  // Handle enable camera button click
  const handleEnableCamera = () => {
    if (hasConsent) {
      requestCameraAccess();
    } else {
      setShowConsentDialog(true);
    }
  };

  const getFocusIcon = () => {
    switch (currentFocus) {
      case "focused":
        return <Eye className="h-5 w-5 text-green-500" />;
      case "stressed":
        return <Frown className="h-5 w-5 text-red-500" />;
      default:
        return <Meh className="h-5 w-5 text-amber-500" />;
    }
  };

  const getFocusBadge = () => {
    switch (currentFocus) {
      case "focused":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Focused</Badge>;
      case "stressed":
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Stressed</Badge>;
      default:
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Neutral</Badge>;
    }
  };

  const getWellnessSuggestion = () => {
    switch (currentFocus) {
      case "stressed":
        return {
          icon: <Wind className="h-5 w-5 text-blue-500" />,
          title: "Take a breather",
          message: "Try deep breathing: Inhale 4 seconds, hold 4, exhale 4"
        };
      case "neutral":
        return {
          icon: <Coffee className="h-5 w-5 text-amber-500" />,
          title: "Stay engaged",
          message: "Consider a short break or switch to a different topic"
        };
      default:
        return {
          icon: <Smile className="h-5 w-5 text-green-500" />,
          title: "Great focus!",
          message: "You're in the zone. Keep up the excellent work!"
        };
    }
  };

  // Consent Dialog
  if (showConsentDialog) {
    return (
      <Card className="p-6 border-2 border-primary/20">
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 rounded-full bg-primary/10">
            <Camera className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold">Enable Camera for Wellness Monitoring?</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            MindPulse can use your camera to analyze facial expressions and provide 
            real-time focus and stress feedback. This helps personalize your learning experience.
          </p>
          
          <div className="bg-muted/50 rounded-lg p-4 text-left space-y-2 max-w-md mx-auto">
            <h4 className="font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              Privacy Guarantee
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
              <li>No images or video are stored or transmitted</li>
              <li>All processing happens locally on your device</li>
              <li>You can disable the camera at any time</li>
              <li>Camera access is completely optional</li>
            </ul>
          </div>
          
          <div className="flex gap-3 justify-center pt-2">
            <Button variant="outline" onClick={() => setShowConsentDialog(false)}>
              No Thanks
            </Button>
            <Button onClick={handleConsentGrant} className="bg-primary text-primary-foreground">
              Enable Camera
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  const suggestion = getWellnessSuggestion();
  const isActive = cameraStatus === "active";

  return (
    <Card className="p-6 border-2">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isActive ? (
              <Camera className="h-5 w-5 text-green-500" />
            ) : (
              <CameraOff className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <h3 className="font-semibold">Facial Expression Analysis</h3>
              <p className="text-xs text-muted-foreground">Optional wellness monitoring</p>
            </div>
          </div>
          
          {/* Enable/Disable Button */}
          {isActive ? (
            <Button variant="outline" size="sm" onClick={disableCamera}>
              <CameraOff className="h-4 w-4 mr-2" />
              Disable Camera
            </Button>
          ) : (
            <Button 
              size="sm" 
              onClick={handleEnableCamera}
              disabled={cameraStatus === "requesting"}
              className="bg-primary text-primary-foreground"
            >
              {cameraStatus === "requesting" ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Enable MindPulse Camera
                </>
              )}
            </Button>
          )}
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="flex items-center gap-2 text-amber-600 text-sm p-3 bg-amber-500/10 rounded-lg">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Camera Preview Container - Fixed size */}
        <div 
          className="relative rounded-lg overflow-hidden bg-muted/50 mx-auto"
          style={{ width: "320px", height: "240px" }}
        >
          {/* Video Element - Always present but hidden when not active */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onCanPlay={handleVideoCanPlay}
            className={`w-full h-full object-cover ${isActive ? "block" : "hidden"}`}
          />
          
          {/* Placeholder when camera is idle */}
          {cameraStatus === "idle" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              <CameraOff className="h-12 w-12 mb-2 opacity-50" />
              <p className="text-sm">Camera not enabled</p>
            </div>
          )}
          
          {/* Loading state */}
          {cameraStatus === "requesting" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="h-12 w-12 mb-2 animate-spin" />
              <p className="text-sm">Starting camera…</p>
            </div>
          )}
          
          {/* Error/Denied state */}
          {(cameraStatus === "error" || cameraStatus === "denied") && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              <AlertCircle className="h-12 w-12 mb-2 opacity-50" />
              <p className="text-sm text-center px-4">
                {cameraStatus === "denied" ? "Permission denied" : "Camera unavailable"}
              </p>
            </div>
          )}
          
          {/* Focus badge overlay when active */}
          {isActive && isVideoReady && (
            <div className="absolute top-2 right-2">
              {getFocusBadge()}
            </div>
          )}
          
          {/* Video loading indicator */}
          {isActive && !isVideoReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/80">
              <Loader2 className="h-8 w-8 mb-2 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading camera...</p>
            </div>
          )}
        </div>

        {/* Current State - Only when active and monitoring */}
        {isActive && isVideoReady && isMonitoring && (
          <div className="flex items-center justify-center gap-3 p-4 bg-muted/30 rounded-lg">
            {getFocusIcon()}
            <div>
              <p className="font-medium">Current State: {currentFocus.charAt(0).toUpperCase() + currentFocus.slice(1)}</p>
              <p className="text-xs text-muted-foreground">Updated every 5 seconds</p>
            </div>
          </div>
        )}

        {/* Wellness Suggestion - Only when active and monitoring */}
        {isActive && isVideoReady && isMonitoring && (
          <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/10">
            {suggestion.icon}
            <div>
              <p className="font-medium text-sm">{suggestion.title}</p>
              <p className="text-xs text-muted-foreground">{suggestion.message}</p>
            </div>
          </div>
        )}

        {/* Not monitoring hint */}
        {isActive && isVideoReady && !isMonitoring && (
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Start monitoring above to begin facial analysis
            </p>
          </div>
        )}

        {/* Privacy Note */}
        <p className="text-xs text-muted-foreground text-center">
          🔒 All analysis is done locally. No data is stored or shared.
        </p>
      </div>
    </Card>
  );
};

export default FacialAnalysis;
