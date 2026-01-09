import { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Camera, CameraOff, AlertCircle, Smile, Frown, Meh, Wind, Coffee, Eye } from "lucide-react";
import { toast } from "sonner";

interface FacialAnalysisProps {
  onFocusUpdate: (focus: "focused" | "neutral" | "stressed") => void;
  isMonitoring: boolean;
}

type FocusState = "focused" | "neutral" | "stressed";

const FacialAnalysis = ({ onFocusUpdate, isMonitoring }: FacialAnalysisProps) => {
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [currentFocus, setCurrentFocus] = useState<FocusState>("neutral");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simulated facial analysis (in production, would use TensorFlow.js or face-api.js)
  const analyzeFace = useCallback(() => {
    if (!cameraEnabled || !isMonitoring) return;
    
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
    
    setCurrentFocus(newFocus);
    onFocusUpdate(newFocus);
  }, [cameraEnabled, isMonitoring, onFocusUpdate]);

  useEffect(() => {
    if (cameraEnabled && isMonitoring) {
      // Run analysis every 5 seconds
      analysisIntervalRef.current = setInterval(analyzeFace, 5000);
      analyzeFace(); // Initial analysis
    }
    
    return () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
    };
  }, [cameraEnabled, isMonitoring, analyzeFace]);

  const requestCameraAccess = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: 320, height: 240 } 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setCameraEnabled(true);
      toast.success("Camera enabled for wellness monitoring");
    } catch (error) {
      console.error("Camera access error:", error);
      setCameraError("Unable to access camera. Please check permissions.");
      toast.error("Camera access denied");
    }
  };

  const disableCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setCameraEnabled(false);
    setCurrentFocus("neutral");
    toast.info("Camera disabled");
  };

  const handleConsentGrant = () => {
    setHasConsent(true);
    setShowConsentDialog(false);
    requestCameraAccess();
  };

  const handleToggleCamera = () => {
    if (cameraEnabled) {
      disableCamera();
    } else if (hasConsent) {
      requestCameraAccess();
    } else {
      setShowConsentDialog(true);
    }
  };

  const getFocusIcon = () => {
    switch (currentFocus) {
      case "focused":
        return <Eye className="h-5 w-5 text-success" />;
      case "stressed":
        return <Frown className="h-5 w-5 text-destructive" />;
      default:
        return <Meh className="h-5 w-5 text-amber-500" />;
    }
  };

  const getFocusBadge = () => {
    switch (currentFocus) {
      case "focused":
        return <Badge className="bg-success/10 text-success border-success/20">Focused</Badge>;
      case "stressed":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Stressed</Badge>;
      default:
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Neutral</Badge>;
    }
  };

  const getWellnessSuggestion = () => {
    switch (currentFocus) {
      case "stressed":
        return {
          icon: <Wind className="h-5 w-5 text-info" />,
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
          icon: <Smile className="h-5 w-5 text-success" />,
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
              <AlertCircle className="h-4 w-4 text-info" />
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
            <Button onClick={handleConsentGrant} className="gradient-primary text-primary-foreground">
              Enable Camera
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  const suggestion = getWellnessSuggestion();

  return (
    <Card className="p-6 border-2">
      <div className="space-y-4">
        {/* Header with toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {cameraEnabled ? (
              <Camera className="h-5 w-5 text-success" />
            ) : (
              <CameraOff className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <h3 className="font-semibold">Facial Expression Analysis</h3>
              <p className="text-xs text-muted-foreground">Optional wellness monitoring</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {cameraEnabled ? "On" : "Off"}
            </span>
            <Switch
              checked={cameraEnabled}
              onCheckedChange={handleToggleCamera}
            />
          </div>
        </div>

        {/* Camera Error */}
        {cameraError && (
          <div className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            {cameraError}
          </div>
        )}

        {/* Camera Preview & Analysis */}
        {cameraEnabled && (
          <div className="space-y-4">
            {/* Hidden video element for camera stream */}
            <div className="relative rounded-lg overflow-hidden bg-muted/50 aspect-video max-w-[320px] mx-auto">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                {getFocusBadge()}
              </div>
            </div>

            {/* Current State */}
            {isMonitoring && (
              <div className="flex items-center justify-center gap-3 p-4 bg-muted/30 rounded-lg">
                {getFocusIcon()}
                <div>
                  <p className="font-medium">Current State: {currentFocus.charAt(0).toUpperCase() + currentFocus.slice(1)}</p>
                  <p className="text-xs text-muted-foreground">Updated every 5 seconds</p>
                </div>
              </div>
            )}

            {/* Wellness Suggestion */}
            {isMonitoring && (
              <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/10">
                {suggestion.icon}
                <div>
                  <p className="font-medium text-sm">{suggestion.title}</p>
                  <p className="text-xs text-muted-foreground">{suggestion.message}</p>
                </div>
              </div>
            )}
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
