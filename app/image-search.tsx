import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
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
    
    // Simulate AI analysis
    setTimeout(() => {
      // Mock analysis results
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

  const resetAnalysis = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Requesting permissions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <IconSymbol name="camera.fill" size={64} color="#ccc" />
          <Text style={styles.permissionText}>Camera permission is required</Text>
          <TouchableOpacity style={styles.button} onPress={() => setHasPermission(null)}>
            <Text style={styles.buttonText}>Request Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (capturedImage) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={resetAnalysis}>
            <IconSymbol name="arrow.left" size={24} color="#333" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Crop Analysis</ThemedText>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.resultContainer}>
          {/* Captured Image */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
          </View>

          {/* Analysis Results */}
          {isAnalyzing ? (
            <View style={styles.analysisContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
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

              <TouchableOpacity style={styles.consultButton}>
                <IconSymbol name="person.2.fill" size={20} color="#fff" />
                <Text style={styles.consultButtonText}>Consult Expert</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <IconSymbol name="arrow.left" size={24} color="#333" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Crop Disease Detection</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <Camera
          style={styles.camera}
          ref={(ref) => setCameraRef(ref)}
          type={Camera.Constants.Type.back}
        >
          <View style={styles.cameraOverlay}>
            <View style={styles.viewfinder} />
          </View>
        </Camera>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>How to get the best results:</Text>
        <Text style={styles.instructionItem}>• Hold your phone steady</Text>
        <Text style={styles.instructionItem}>• Ensure good lighting</Text>
        <Text style={styles.instructionItem}>• Focus on affected leaves</Text>
        <Text style={styles.instructionItem}>• Include multiple affected areas</Text>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.galleryButton} onPress={pickImageFromGallery}>
          <IconSymbol name="photo.fill" size={24} color="#007AFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>

        <View style={styles.galleryButton} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    color: '#333',
  },
  permissionText: {
    marginTop: 16,
    color: '#333',
    textAlign: 'center',
    fontSize: 16,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 125,
    backgroundColor: 'transparent',
  },
  instructionsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 20,
    borderRadius: 12,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  instructionItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
  },
  resultContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  imageContainer: {
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
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
    color: '#333',
    marginTop: 16,
  },
  analyzingSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  resultCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
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
    color: '#333',
    flex: 1,
  },
  confidenceContainer: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  confidenceText: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  consultButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  consultButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 