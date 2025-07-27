import { ConnectivityBanner } from '@/components/ConnectivityBanner';
import { useConversation } from '@/components/ConversationContext';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useRef } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ImageSearchScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const { addMessage } = useConversation();
  const router = useRouter();

  const analyzeCropImage = async (imageBase64: string, imageUri: string) => {
    try {
      const response = await fetch('https://fastapi-service-666271187622.us-central1.run.app/api/crop-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageBase64,
        }),
      });

      if (response.ok) {
        const analysisResult = await response.json();
        
        // Concatenate disease and description for more informative response
        let responseText = '';
        if (analysisResult.disease && analysisResult.description) {
          responseText = `${analysisResult.disease}\n\n${analysisResult.description}`;
        } else if (analysisResult.description) {
          responseText = analysisResult.description;
        } else if (analysisResult.disease) {
          responseText = analysisResult.disease;
        } else {
          responseText = 'Analysis completed, but no details were provided.';
        }
        
        // Add AI response with the disease and description
        addMessage({
          id: (Date.now() + 1).toString(),
          text: responseText,
          isUser: false,
          timestamp: new Date(),
        });
      } else {
        // Add error message
        addMessage({
          id: (Date.now() + 1).toString(),
          text: 'Sorry, I had trouble analyzing your image. Please try again.',
          isUser: false,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.error('Crop analysis error:', error);
      addMessage({
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I had trouble analyzing your image. Please check your internet connection and try again.',
        isUser: false,
        timestamp: new Date(),
      });
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;
    
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });
      
      // Add user message with image and analysis request text
      addMessage({
        id: Date.now().toString(),
        text: 'Can you please analyze this picture?',
        isUser: true,
        timestamp: new Date(),
        imageUri: photo.uri,
      });
      
      // Navigate to voice chat immediately
      router.push('/(tabs)/voice-chat');
      
      // Call the crop analysis API in the background
      if (photo.base64) {
        analyzeCropImage(photo.base64, photo.uri);
      }
    } catch {
      Alert.alert('Error', 'Failed to take picture');
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        // Add user message with image and analysis request text
        addMessage({
          id: Date.now().toString(),
          text: 'Can you please analyze this picture?',
          isUser: true,
          timestamp: new Date(),
          imageUri: result.assets[0].uri,
        });
        
        // Navigate to voice chat immediately
        router.push('/(tabs)/voice-chat');
        
        // Call the crop analysis API in the background
        if (result.assets[0].base64) {
          analyzeCropImage(result.assets[0].base64, result.assets[0].uri);
        }
      }
    } catch {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Show permission request
  if (permission && !permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <ConnectivityBanner />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="arrow.left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>Camera Permission</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.centered}>
          <IconSymbol name="camera.fill" size={64} color="#31A05F" />
          <Text style={styles.permissionText}>Camera permission is required to take photos</Text>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Show loading
  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <ConnectivityBanner />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#31A05F" />
          <Text style={styles.loadingText}>Requesting permissions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show camera view (default state)
  return (
    <SafeAreaView style={styles.cameraScreen}>
      <ConnectivityBanner />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="arrow.left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Crop Camera</Text>
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
            <TouchableOpacity 
              style={styles.webGalleryButton} 
              onPress={pickImageFromGallery}
            >
              <IconSymbol name="photo.fill" size={24} color="#31A05F" />
              <Text style={styles.webGalleryText}>
                Select from Gallery
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // Mobile camera view
        <>
          <View style={styles.cameraContainer}>
            <View style={styles.camera}>
              <CameraView
                style={StyleSheet.absoluteFill}
                ref={cameraRef}
                facing='back'
              />
              <View style={styles.cameraOverlay}>
                <View style={styles.viewfinder} />
                <Text style={styles.instructionText}>Point camera at crop leaves</Text>
              </View>
            </View>
          </View>

          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>How to get the best results:</Text>
            <Text style={styles.instructionItem}>• Hold your phone steady</Text>
            <Text style={styles.instructionItem}>• Ensure good lighting</Text>
            <Text style={styles.instructionItem}>• Focus on affected leaves</Text>
            <Text style={styles.instructionItem}>• Include multiple affected areas</Text>
          </View>

          <View style={styles.controlsContainer}>
            <TouchableOpacity 
              style={styles.galleryButton} 
              onPress={pickImageFromGallery}
            >
              <IconSymbol name="photo.fill" size={24} color="#31A05F" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.captureButton} 
              onPress={takePicture}
            >
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
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#31A05F',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  webGalleryText: {
    color: '#31A05F',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
});