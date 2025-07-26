import { useConversation } from '@/components/ConversationContext';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface AnalysisResult {
  disease: string;
  confidence: number;
  treatment: string;
  prevention: string;
}

export default function ImageSearchScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraRef, setCameraRef] = useState<Camera | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { addMessage } = useConversation();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      const mediaLibraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasPermission(cameraStatus.status === 'granted' && mediaLibraryStatus.status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef) {
      try {
        const photo = await cameraRef.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        setCapturedImage(photo.uri);
        analyzeImage(photo.uri);
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
        analyzeImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const analyzeImage = (imageUri: string) => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const mockResults: AnalysisResult[] = [
        {
          disease: 'Tomato Leaf Blight',
          confidence: 92,
          treatment: 'Apply copper-based fungicide (Copper oxychloride) at 2g/L water. Spray during early morning or evening.',
          prevention: 'Ensure proper air circulation, avoid overhead watering, and remove affected leaves immediately.'
        },
        {
          disease: 'Powdery Mildew',
          confidence: 87,
          treatment: 'Use sulfur-based fungicide or neem oil spray. Apply weekly until symptoms disappear.',
          prevention: 'Maintain proper spacing between plants and avoid high humidity conditions.'
        },
        {
          disease: 'Bacterial Spot',
          confidence: 78,
          treatment: 'Use copper-based bactericide. Remove infected plants to prevent spread.',
          prevention: 'Use certified disease-free seeds and avoid working with wet plants.'
        }
      ];

      const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
      setAnalysisResult(randomResult);
      setIsAnalyzing(false);
    }, 3000);
  };

  const postToVoiceChat = () => {
    if (analysisResult && capturedImage) {
      // Add the image and analysis to the conversation
      addMessage({
        id: Date.now().toString(),
        text: `I uploaded an image of my crop. The analysis shows: ${analysisResult.disease} (${analysisResult.confidence}% confidence). ${analysisResult.treatment}`,
        isUser: true,
        timestamp: new Date(),
        imageUri: capturedImage,
      });

      // Navigate to voice chat
      router.push('/(tabs)/voice-chat');
    }
  };

  const resetCamera = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
  };

  // Show permission request
  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/')}>
            <IconSymbol name="arrow.left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>Camera Permission</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.centered}>
          <IconSymbol name="camera.fill" size={64} color="#31A05F" />
          <Text style={styles.permissionText}>Camera permission is required</Text>
          <TouchableOpacity style={styles.button} onPress={() => setHasPermission(null)}>
            <Text style={styles.buttonText}>Request Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Show loading
  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#31A05F" />
          <Text style={styles.loadingText}>Requesting permissions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show analysis results
  if (capturedImage) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={resetCamera}>
            <IconSymbol name="arrow.left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>Crop Analysis</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.resultContainer}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
          </View>

          {isAnalyzing ? (
            <View style={styles.analysisContainer}>
              <ActivityIndicator size="large" color="#31A05F" />
              <Text style={styles.analyzingText}>Analyzing your crop image...</Text>
              <Text style={styles.analyzingSubtext}>This may take a few moments</Text>
            </View>
          ) : analysisResult ? (
            <View style={styles.resultCard}>
              <View style={styles.diseaseHeader}>
                <Text style={styles.diseaseTitle}>{analysisResult.disease}</Text>
                <View style={styles.confidenceContainer}>
                  <Text style={styles.confidenceText}>{analysisResult.confidence}% confident</Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recommended Treatment</Text>
                <Text style={styles.sectionContent}>{analysisResult.treatment}</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Prevention Tips</Text>
                <Text style={styles.sectionContent}>{analysisResult.prevention}</Text>
              </View>

              <TouchableOpacity style={styles.postButton} onPress={postToVoiceChat}>
                <IconSymbol name="mic.fill" size={20} color="#FFFFFF" />
                <Text style={styles.postButtonText}>Post to Voice Chat</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Show camera view (default state)
  return (
    <SafeAreaView style={styles.cameraScreen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/')}>
          <IconSymbol name="arrow.left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Crop Disease Detection</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {Platform.OS === 'web' ? (
        // Web fallback - show image picker only
        <View style={styles.webContainer}>
          <View style={styles.webCameraPlaceholder}>
            <IconSymbol name="camera.fill" size={64} color="#31A05F" />
            <Text style={styles.webCameraText}>Camera not available on web</Text>
            <Text style={styles.webCameraSubtext}>Please use the gallery button to select an image</Text>
          </View>
          
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>How to get the best results:</Text>
            <Text style={styles.instructionItem}>• Select a clear image of affected crop leaves</Text>
            <Text style={styles.instructionItem}>• Ensure good lighting in the image</Text>
            <Text style={styles.instructionItem}>• Focus on affected leaves</Text>
            <Text style={styles.instructionItem}>• Include multiple affected areas</Text>
          </View>

          <View style={styles.webControlsContainer}>
            <TouchableOpacity style={styles.webGalleryButton} onPress={pickImageFromGallery}>
              <IconSymbol name="photo.fill" size={24} color="#31A05F" />
              <Text style={styles.webGalleryText}>Select from Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // Mobile camera view
        <>
          <View style={styles.cameraContainer}>
            <Camera
              style={styles.camera}
              ref={(ref) => setCameraRef(ref)}
              type={Camera.Constants.Type.back}
            >
              <View style={styles.cameraOverlay}>
                <View style={styles.viewfinder} />
                <Text style={styles.instructionText}>Point camera at affected crop leaves</Text>
              </View>
            </Camera>
          </View>

          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>How to get the best results:</Text>
            <Text style={styles.instructionItem}>• Hold your phone steady</Text>
            <Text style={styles.instructionItem}>• Ensure good lighting</Text>
            <Text style={styles.instructionItem}>• Focus on affected leaves</Text>
            <Text style={styles.instructionItem}>• Include multiple affected areas</Text>
          </View>

          <View style={styles.controlsContainer}>
            <TouchableOpacity style={styles.galleryButton} onPress={pickImageFromGallery}>
              <IconSymbol name="photo.fill" size={24} color="#31A05F" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>

            <View style={styles.galleryButton} />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFEFEF',
  },
  cameraScreen: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#31A05F',
    paddingTop: 50,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'System',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFEFEF',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    color: '#4B4B4B',
    fontSize: 16,
    fontFamily: 'System',
  },
  permissionText: {
    marginTop: 16,
    color: '#4B4B4B',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'System',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#31A05F',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  cameraContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewfinder: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: '#31A05F',
    borderRadius: 125,
    backgroundColor: 'transparent',
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    fontFamily: 'System',
  },
  instructionsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    margin: 20,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#4B4B4B',
    fontFamily: 'System',
  },
  instructionItem: {
    fontSize: 14,
    color: '#4B4B4B',
    marginBottom: 4,
    fontFamily: 'System',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingBottom: 40,
    backgroundColor: 'transparent',
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#31A05F',
  },
  resultContainer: {
    flex: 1,
    backgroundColor: '#EFEFEF',
  },
  imageContainer: {
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  capturedImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  analysisContainer: {
    alignItems: 'center',
    padding: 40,
  },
  analyzingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4B4B4B',
    marginTop: 16,
    fontFamily: 'System',
  },
  analyzingSubtext: {
    fontSize: 14,
    color: '#4B4B4B',
    marginTop: 8,
    fontFamily: 'System',
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  diseaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  diseaseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4B4B4B',
    flex: 1,
    fontFamily: 'System',
  },
  confidenceContainer: {
    backgroundColor: '#D3EDDF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  confidenceText: {
    fontSize: 12,
    color: '#31A05F',
    fontWeight: '600',
    fontFamily: 'System',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4B4B4B',
    marginBottom: 8,
    fontFamily: 'System',
  },
  sectionContent: {
    fontSize: 14,
    color: '#4B4B4B',
    lineHeight: 20,
    fontFamily: 'System',
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#31A05F',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  postButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  webContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFEFEF',
    padding: 20,
  },
  webCameraPlaceholder: {
    alignItems: 'center',
    marginBottom: 20,
  },
  webCameraText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4B4B4B',
    marginTop: 10,
    fontFamily: 'System',
  },
  webCameraSubtext: {
    fontSize: 14,
    color: '#4B4B4B',
    marginTop: 5,
    fontFamily: 'System',
  },
  webControlsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  webGalleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#31A05F',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  webGalleryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
}); 