'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface CameraCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (file: File) => void;
    onUseFallbackCamera?: () => void;
}

export default function CameraCaptureModal({
    isOpen,
    onClose,
    onCapture,
    onUseFallbackCamera,
}: CameraCaptureModalProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
    const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
    const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isShutterActive, setIsShutterActive] = useState(false);

    // Stop all media tracks helper
    const stopStream = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
    }, [stream]);

    // Check available video devices
    useEffect(() => {
        if (!isOpen) return;
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
            navigator.mediaDevices.enumerateDevices().then((devices) => {
                const videoDevices = devices.filter((d) => d.kind === 'videoinput');
                setHasMultipleCameras(videoDevices.length > 1);
            }).catch(() => {
                setHasMultipleCameras(false);
            });
        }
    }, [isOpen]);

    // Initialize or restart camera stream
    useEffect(() => {
        if (!isOpen) {
            stopStream();
            setCapturedPreview(null);
            setCapturedBlob(null);
            setCameraError(null);
            return;
        }

        let isMounted = true;
        setIsLoading(true);
        setCameraError(null);

        // Discard any existing stream before starting a new one
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setCameraError('Webcam access is not supported by your browser. Please use the device camera or file upload.');
            setIsLoading(false);
            return;
        }

        const constraints: MediaStreamConstraints = {
            video: {
                facingMode,
                width: { ideal: 1080 },
                height: { ideal: 1080 },
            },
            audio: false,
        };

        navigator.mediaDevices
            .getUserMedia(constraints)
            .then((mediaStream) => {
                if (!isMounted) {
                    mediaStream.getTracks().forEach((t) => t.stop());
                    return;
                }
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                    videoRef.current.play().catch(() => {});
                }
                setIsLoading(false);
            })
            .catch((err) => {
                if (!isMounted) return;
                console.error('[CameraCapture] Error accessing camera:', err);
                setIsLoading(false);
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    setCameraError('Camera permission was denied. Please allow camera access in your browser settings or use the file upload option.');
                } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                    setCameraError('No camera device detected on your system. Please use file upload.');
                } else {
                    setCameraError('Unable to access camera. Please check your permissions or use device photo capture.');
                }
            });

        return () => {
            isMounted = false;
        };
    }, [isOpen, facingMode]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopStream();
        };
    }, [stopStream]);

    // Flip camera (front vs rear)
    const toggleFacingMode = () => {
        setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
    };

    // Capture photo from video frame
    const handleCapture = () => {
        if (!videoRef.current) return;

        setIsShutterActive(true);
        setTimeout(() => setIsShutterActive(false), 200);

        const video = videoRef.current;
        const videoWidth = video.videoWidth || 640;
        const videoHeight = video.videoHeight || 480;

        // Create square crop to match avatar dimensions
        const size = Math.min(videoWidth, videoHeight);
        const startX = (videoWidth - size) / 2;
        const startY = (videoHeight - size) / 2;

        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = 720;
        canvas.height = 720;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            // If using front camera, mirror image for natural selfie feel
            if (facingMode === 'user') {
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
            }

            ctx.drawImage(video, startX, startY, size, size, 0, 0, canvas.width, canvas.height);

            const previewUrl = canvas.toDataURL('image/jpeg', 0.92);
            setCapturedPreview(previewUrl);

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        setCapturedBlob(blob);
                    }
                },
                'image/jpeg',
                0.92
            );
        }
    };

    // Retake photo: discard captured preview and return to video stream
    const handleRetake = () => {
        setCapturedPreview(null);
        setCapturedBlob(null);
    };

    // Confirm and use captured photo
    const handleConfirm = () => {
        if (!capturedBlob) return;
        const filename = `doctor-avatar-${Date.now()}.jpg`;
        const file = new File([capturedBlob], filename, { type: 'image/jpeg' });
        stopStream();
        onCapture(file);
        onClose();
    };

    const handleClose = () => {
        stopStream();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-lg bg-white dark:bg-[#151732] rounded-3xl border border-slate-200 dark:border-[#24274d] shadow-2xl overflow-hidden flex flex-col">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-slate-200 dark:border-[#24274d] flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <i className="fas fa-camera text-blue-500"></i>
                            Capture Doctor Avatar
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Position your face within the circle for a professional headshot.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#24274d] transition"
                        aria-label="Close"
                    >
                        <i className="fas fa-xmark text-sm"></i>
                    </button>
                </div>

                {/* Viewfinder / Capture Box */}
                <div className="relative w-full aspect-square bg-slate-900 flex items-center justify-center overflow-hidden">
                    {/* Shutter flash animation */}
                    {isShutterActive && (
                        <div className="absolute inset-0 bg-white z-30 opacity-70 animate-ping"></div>
                    )}

                    {/* Camera Loading state */}
                    {isLoading && !capturedPreview && !cameraError && (
                        <div className="flex flex-col items-center justify-center text-slate-400 gap-3 z-10">
                            <i className="fas fa-circle-notch fa-spin text-3xl text-blue-500"></i>
                            <span className="text-xs font-medium">Accessing camera stream...</span>
                        </div>
                    )}

                    {/* Camera Error state */}
                    {cameraError && !capturedPreview && (
                        <div className="p-6 text-center max-w-sm z-10 flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mb-3">
                                <i className="fas fa-video-slash text-xl"></i>
                            </div>
                            <h4 className="text-sm font-bold text-white mb-1">Camera Unavailable</h4>
                            <p className="text-xs text-slate-400 mb-4 leading-relaxed">{cameraError}</p>
                            {onUseFallbackCamera && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleClose();
                                        onUseFallbackCamera();
                                    }}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-2"
                                >
                                    <i className="fas fa-camera"></i>
                                    Use Mobile Camera App
                                </button>
                            )}
                        </div>
                    )}

                    {/* Live Stream View */}
                    {!capturedPreview && (
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className={`w-full h-full object-cover ${
                                facingMode === 'user' ? 'scale-x-[-1]' : ''
                            } ${isLoading || cameraError ? 'hidden' : 'block'}`}
                        />
                    )}

                    {/* Captured Photo Preview */}
                    {capturedPreview && (
                        <img
                            src={capturedPreview}
                            alt="Captured Avatar Preview"
                            className="w-full h-full object-cover animate-fade-in"
                        />
                    )}

                    {/* Circular Portrait Guide Overlay (visible when streaming) */}
                    {!capturedPreview && !cameraError && !isLoading && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full border-2 border-dashed border-white/60 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"></div>
                        </div>
                    )}

                    {/* Switch Camera Button (if device has multiple cameras) */}
                    {hasMultipleCameras && !capturedPreview && !cameraError && !isLoading && (
                        <button
                            type="button"
                            onClick={toggleFacingMode}
                            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/75 backdrop-blur-md text-white flex items-center justify-center shadow-lg transition"
                            title="Switch Camera"
                        >
                            <i className="fas fa-rotate text-sm"></i>
                        </button>
                    )}
                </div>

                {/* Hidden Canvas used for photo rendering */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Controls Footer */}
                <div className="p-4 sm:p-5 bg-slate-50 dark:bg-[#1a1c3d]/40 border-t border-slate-200 dark:border-[#24274d] flex items-center justify-between gap-3">
                    {!capturedPreview ? (
                        <>
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#24274d] rounded-xl transition"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleCapture}
                                disabled={isLoading || Boolean(cameraError)}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center gap-2"
                            >
                                <span className="w-3 h-3 rounded-full bg-white animate-pulse"></span>
                                Take Photo
                            </button>

                            {onUseFallbackCamera && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleClose();
                                        onUseFallbackCamera();
                                    }}
                                    className="text-xs font-medium text-slate-500 hover:text-blue-500 dark:text-slate-400 transition hidden sm:inline-block"
                                >
                                    Use Device App
                                </button>
                            )}
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={handleRetake}
                                className="px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#151732] hover:bg-slate-100 dark:hover:bg-[#24274d] border border-slate-200 dark:border-[#24274d] rounded-xl transition flex items-center gap-2 shadow-sm"
                            >
                                <i className="fas fa-arrow-rotate-left"></i>
                                Retake
                            </button>

                            <button
                                type="button"
                                onClick={handleConfirm}
                                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center gap-2"
                            >
                                <i className="fas fa-check"></i>
                                Use This Photo
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
