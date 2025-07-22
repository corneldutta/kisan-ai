import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Image,
    Animated,
} from 'react-native';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';

export default function CameraCapture({ onImageCaptured, onClose }) {
    const [hasPermission, setHasPermission] = useState(null);
    const [type, setType] = useState(Camera.Constants.Type.back);
    const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);
    const [camera, setCamera] = useState(null);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [focusPoint, setFocusPoint] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(0);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');

            const mediaLibraryStatus = await MediaLibrary.requestPermissionsAsync();
            if (mediaLibraryStatus.status !== 'granted') {
                Alert.alert(
                    'Permission needed',
                    'Media library permission is required to save photos'
                );
            }
        })();
    }, []);

    useEffect(() => {
        if (focusPoint) {
            Animated.sequence([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ]).start(() => setFocusPoint(null));
        }
    }, [focusPoint]);

    const takePicture = async () => {
        if (camera && isCameraReady && !isCapturing) {
            try {
                setIsCapturing(true);
                const photo = await camera.takePictureAsync({
                    quality: 0.8,
                    base64: false,
                    exif: true,
                });

                setCapturedImage(photo.uri);

                // Save to device gallery
                await MediaLibrary.saveToLibraryAsync(photo.uri);

                // Return the captured image
                if (onImageCaptured) {
                    onImageCaptured(photo.uri);
                }
            } catch (error) {
                console.error('Error taking picture:', error);
                Alert.alert('Error', 'Failed to capture image');
            } finally {
                setIsCapturing(false);
            }
        }
    };

    const retakePicture = () => {
        setCapturedImage(null);
    };

    const confirmPicture = () => {
        if (onImageCaptured && capturedImage) {
            onImageCaptured(capturedImage);
        }
        if (onClose) {
            onClose();
        }
    };

    const handleFocus = (event) => {
        const { locationX, locationY } = event.nativeEvent;
        setFocusPoint({ x: locationX, y: locationY });

        if (camera) {
            camera.focusAsync({ x: locationX, y: locationY });
        }
    };

    const toggleFlash = () => {
        setFlashMode(
            flashMode === Camera.Constants.FlashMode.off
                ? Camera.Constants.FlashMode.on
                : Camera.Constants.FlashMode.off
        );
    };

    const flipCamera = () => {
        setType(
            type === Camera.Constants.Type.back
                ? Camera.Constants.Type.front
                : Camera.Constants.Type.back
        );
    };

    const adjustZoom = (direction) => {
        const newZoom = direction === 'in'
            ? Math.min(zoomLevel + 0.1, 1)
            : Math.max(zoomLevel - 0.1, 0);
        setZoomLevel(newZoom);
    };

    if (hasPermission === null) {
        return <View style={styles.container} />;
    }

    if (hasPermission === false) {
        return (
            <View style={styles.permissionContainer}>
                <Ionicons name="camera-off" size={64} color="#ccc" />
                <Text style={styles.permissionText}>
                    Camera permission is required to capture images
                </Text>
                <TouchableOpacity
                    style={styles.permissionButton}
                    onPress={async () => {
                        const { status } = await Camera.requestCameraPermissionsAsync();
                        setHasPermission(status === 'granted');
                    }}
                >
                    <Text style={styles.permissionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (capturedImage) {
        return (
            <View style={styles.container}>
                <Image source={{ uri: capturedImage }} style={styles.previewImage} />
                <View style={styles.previewControls}>
                    <TouchableOpacity style={styles.controlButton} onPress={retakePicture}>
                        <Ionicons name="refresh" size={30} color="white" />
                        <Text style={styles.controlButtonText}>Retake</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.controlButton} onPress={confirmPicture}>
                        <Ionicons name="checkmark" size={30} color="white" />
                        <Text style={styles.controlButtonText}>Use Photo</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Camera
                style={styles.camera}
                type={type}
                flashMode={flashMode}
                zoom={zoomLevel}
                ref={ref => setCamera(ref)}
                onCameraReady={() => setIsCameraReady(true)}
                onTouchStart={handleFocus}
            >
                {/* Focus Point Indicator */}
                {focusPoint && (
                    <Animated.View
                        style={[
                            styles.focusPoint,
                            {
                                left: focusPoint.x - 25,
                                top: focusPoint.y - 25,
                                opacity: fadeAnim,
                            },
                        ]}
                    />
                )}

                {/* Camera Overlay */}
                <View style={styles.cameraOverlay}>
                    {/* Top Controls */}
                    <View style={styles.topControls}>
                        <TouchableOpacity style={styles.topButton} onPress={onClose}>
                            <Ionicons name="close" size={30} color="white" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.topButton} onPress={toggleFlash}>
                            <Ionicons
                                name={flashMode === Camera.Constants.FlashMode.off ? "flash-off" : "flash"}
                                size={30}
                                color="white"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Center Guidance */}
                    <View style={styles.centerGuide}>
                        <View style={styles.cropFrame}>
                            <View style={styles.cornerTL} />
                            <View style={styles.cornerTR} />
                            <View style={styles.cornerBL} />
                            <View style={styles.cornerBR} />
                        </View>
                        <Text style={styles.guideText}>
                            Position the plant/leaf within the frame
                        </Text>
                        <Text style={styles.guideTextKannada}>
                            ಸಸ್ಯ/ಎಲೆಯನ್ನು ಚೌಕಟ್ಟಿನೊಳಗೆ ಇರಿಸಿ
                        </Text>
                    </View>

                    {/* Bottom Controls */}
                    <View style={styles.bottomControls}>
                        {/* Zoom Controls */}
                        <View style={styles.zoomControls}>
                            <TouchableOpacity
                                style={styles.zoomButton}
                                onPress={() => adjustZoom('out')}
                            >
                                <Ionicons name="remove" size={20} color="white" />
                            </TouchableOpacity>
                            <Text style={styles.zoomText}>{Math.round(zoomLevel * 100)}%</Text>
                            <TouchableOpacity
                                style={styles.zoomButton}
                                onPress={() => adjustZoom('in')}
                            >
                                <Ionicons name="add" size={20} color="white" />
                            </TouchableOpacity>
                        </View>

                        {/* Capture Controls */}
                        <View style={styles.captureControls}>
                            <View style={styles.spacer} />

                            <TouchableOpacity
                                style={[
                                    styles.captureButton,
                                    isCapturing && styles.capturingButton
                                ]}
                                onPress={takePicture}
                                disabled={!isCameraReady || isCapturing}
                            >
                                <View style={styles.captureButtonInner}>
                                    {isCapturing ? (
                                        <Ionicons name="hourglass" size={30} color="white" />
                                    ) : (
                                        <Ionicons name="camera" size={30} color="white" />
                                    )}
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.flipButton} onPress={flipCamera}>
                                <Ionicons name="camera-reverse" size={30} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Camera>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    permissionText: {
        fontSize: 16,
        textAlign: 'center',
        marginVertical: 20,
        color: '#666',
    },
    permissionButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    permissionButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    camera: {
        flex: 1,
    },
    cameraOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    topControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
    },
    topButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerGuide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    cropFrame: {
        width: 250,
        height: 250,
        position: 'relative',
        marginBottom: 20,
    },
    cornerTL: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 30,
        height: 30,
        borderTopWidth: 3,
        borderLeftWidth: 3,
        borderColor: '#4CAF50',
    },
    cornerTR: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 30,
        height: 30,
        borderTopWidth: 3,
        borderRightWidth: 3,
        borderColor: '#4CAF50',
    },
    cornerBL: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: 30,
        height: 30,
        borderBottomWidth: 3,
        borderLeftWidth: 3,
        borderColor: '#4CAF50',
    },
    cornerBR: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 30,
        height: 30,
        borderBottomWidth: 3,
        borderRightWidth: 3,
        borderColor: '#4CAF50',
    },
    guideText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 5,
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    guideTextKannada: {
        color: 'white',
        fontSize: 14,
        textAlign: 'center',
        opacity: 0.9,
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    bottomControls: {
        paddingHorizontal: 20,
        paddingBottom: 50,
    },
    zoomControls: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    zoomButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    zoomText: {
        color: 'white',
        marginHorizontal: 20,
        fontSize: 16,
        fontWeight: 'bold',
    },
    captureControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    spacer: {
        width: 50,
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    capturingButton: {
        backgroundColor: '#FF9800',
    },
    captureButtonInner: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
    },
    flipButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    focusPoint: {
        position: 'absolute',
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#4CAF50',
        backgroundColor: 'transparent',
    },
    previewImage: {
        flex: 1,
        resizeMode: 'contain',
    },
    previewControls: {
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 40,
    },
    controlButton: {
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 25,
    },
    controlButtonText: {
        color: 'white',
        marginTop: 5,
        fontSize: 12,
    },
});