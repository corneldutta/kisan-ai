import { ConnectivityBanner } from '@/components/ConnectivityBanner';
import { useConnectivity } from '@/components/ConnectivityContext';
import { useConversation } from '@/components/ConversationContext';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ImageSearchScreen() {
  const [permission, setPermission] = useState<{ status: string; granted: boolean } | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const { addMessage } = useConversation();
  const router = useRouter();
  const { isConnected, isInternetReachable } = useConnectivity();
  const isOnline = isConnected && isInternetReachable !== false;

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setPermission({ status, granted: status === 'granted' });
    })();
  }, []);

  const requestPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setPermission({ status, granted: status === 'granted' });
  };

  const takePicture = async () => {
    if (!isOnline) {
      Alert.alert(
        'No Internet Connection',
        'This feature requires an internet connection. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!permission?.granted) {
      Alert.alert('Permission needed', 'Please grant camera permission');
      return;
    }

    setIsCapturing(true);
    try {
      // This would normally use the camera to take a picture
      // For now, we'll simulate it by navigating to voice chat
      Alert.alert('Camera', 'Camera functionality would be implemented here');
    } catch (error) {
      Alert.alert('Error', 'Failed to take picture');
    } finally {
      setIsCapturing(false);
    }
  };

  const pickImageFromGallery = async () => {
    if (!isOnline) {
      Alert.alert(
        'No Internet Connection',
        'This feature requires an internet connection. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        // Add image to conversation
        addMessage({
          id: Date.now().toString(),
          text: 'I uploaded a photo of my crop. Can you help me analyze it?',
          isUser: true,
          timestamp: new Date(),
          imageUri: result.assets[0].uri,
        });
        
        // Navigate to voice chat
        router.push('/(tabs)/voice-chat');
      }
    } catch (error) {
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

  return (
    <SafeAreaView style={styles.container}>
      <ConnectivityBanner />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="arrow.left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Image Search</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.centered}>
        <IconSymbol name="camera.fill" size={64} color="#31A05F" />
        <Text style={styles.title}>Take a photo of your crop</Text>
        <Text style={styles.subtitle}>Get instant diagnosis and recommendations</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.button, 
              !isOnline && styles.buttonDisabled
            ]} 
            onPress={takePicture}
            disabled={!isOnline || isCapturing}
          >
            <IconSymbol name="camera.fill" size={24} color="#FFFFFF" />
            <Text style={styles.buttonText}>
              {isCapturing ? 'Taking Photo...' : 'Take Photo'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.button, 
              styles.secondaryButton,
              !isOnline && styles.buttonDisabled
            ]} 
            onPress={pickImageFromGallery}
            disabled={!isOnline}
          >
            <IconSymbol name="photo.fill" size={24} color="#31A05F" />
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Choose from Gallery
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFEFEF',
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
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4B4B4B',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 16,
    color: '#4B4B4B',
    marginBottom: 48,
    textAlign: 'center',
    fontFamily: 'System',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#31A05F',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#31A05F',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'System',
  },
  secondaryButtonText: {
    color: '#31A05F',
  },
  permissionText: {
    fontSize: 16,
    color: '#4B4B4B',
    marginTop: 24,
    marginBottom: 32,
    textAlign: 'center',
    fontFamily: 'System',
  },
});