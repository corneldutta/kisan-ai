import { IconSymbol } from '@/components/ui/IconSymbol';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Diagnosis {
    disease: string;
    nameKannada: string;
    confidence: number;
    description: string;
    symptoms: string[];
    causes: string[];
    treatment: string[];
    prevention: string[];
}

export default function CropDiagnosisScreen() {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        (async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    const pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled) {
                setImageUri(result.assets[0].uri);
                analyzeCropImage(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick image from gallery');
        }
    };

    const takePicture = async () => {
        try {
            let result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled) {
                setImageUri(result.assets[0].uri);
                analyzeCropImage(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to take picture');
        }
    };

    const analyzeCropImage = async (uri: string) => {
        setIsAnalyzing(true);
        try {
            // Simulated analysis - replace with actual AI analysis
            setTimeout(() => {
                setDiagnosis({
                    disease: 'Tomato Early Blight',
                    nameKannada: 'ಟೊಮೇಟೋ ಆರಂಭಿಕ ಬ್ಲೈಟ್',
                    confidence: 0.87,
                    description: 'ಟೊಮೇಟೋ ಎಲೆಯಲ್ಲಿ ಆರಂಭಿಕ ಬ್ಲೈಟ್ ರೋಗ ಕಂಡುಬಂದಿದೆ. ಇದು ಅಲ್ಟರ್ನೇರಿಯಾ ಶಿಲೀಂಧ್ರದಿಂದ ಉಂಟಾಗುತ್ತದೆ.',
                    symptoms: [
                        'Brown spots with concentric rings on leaves',
                        'Yellowing and wilting of lower leaves',
                        'Dark lesions on stems',
                        'Fruit rot in severe cases'
                    ],
                    causes: [
                        'Fungal infection by Alternaria solani',
                        'High humidity and warm temperatures',
                        'Poor air circulation',
                        'Infected plant debris'
                    ],
                    treatment: [
                        'Remove and destroy infected leaves',
                        'Apply fungicide containing copper or chlorothalonil',
                        'Improve air circulation around plants',
                        'Avoid overhead watering',
                        'Maintain proper plant spacing'
                    ],
                    prevention: [
                        'Use disease-resistant tomato varieties',
                        'Rotate crops annually',
                        'Keep garden clean and weed-free',
                        'Water at the base of plants',
                        'Apply mulch to prevent soil splash'
                    ]
                });
                setIsAnalyzing(false);
            }, 2000);
        } catch (error) {
            console.error('Analysis error:', error);
            setIsAnalyzing(false);
            Alert.alert('Error', 'Failed to analyze image');
        }
    };

    if (hasPermission === null) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#31A05F" />
                <Text style={styles.loadingText}>Requesting permissions...</Text>
            </SafeAreaView>
        );
    }

    if (hasPermission === false) {
        return (
            <SafeAreaView style={styles.permissionContainer}>
                <IconSymbol name="camera.fill" size={64} color="#ccc" />
                <Text style={styles.permissionText}>
                    Camera permission is required to take photos of your crops
                </Text>
                <TouchableOpacity
                    style={styles.permissionButton}
                    onPress={async () => {
                        const { status } = await ImagePicker.requestCameraPermissionsAsync();
                        setHasPermission(status === 'granted');
                    }}
                >
                    <Text style={styles.permissionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerText}>Crop Disease Diagnosis</Text>
                    <Text style={styles.subHeaderText}>ಬೆಳೆ ರೋಗ ನಿರ್ಣಯ</Text>
                </View>

                {/* Image Section */}
                <View style={styles.imageSection}>
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.capturedImage} />
                    ) : (
                        <View style={styles.placeholderImage}>
                            <IconSymbol name="leaf.fill" size={50} color="#ccc" />
                            <Text style={styles.placeholderText}>
                                Take or select a photo of your crop
                            </Text>
                            <Text style={styles.placeholderTextKannada}>
                                ನಿಮ್ಮ ಬೆಳೆಯ ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಿ ಅಥವಾ ಆಯ್ಕೆಮಾಡಿ
                            </Text>
                        </View>
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonSection}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={takePicture}
                    >
                        <IconSymbol name="camera.fill" size={24} color="white" />
                        <Text style={styles.buttonText}>Take Photo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={pickImage}
                    >
                        <IconSymbol name="photo.fill" size={24} color="white" />
                        <Text style={styles.buttonText}>Gallery</Text>
                    </TouchableOpacity>
                </View>

                {/* Loading Section */}
                {isAnalyzing && (
                    <View style={styles.loadingSection}>
                        <ActivityIndicator size="large" color="#31A05F" />
                        <Text style={styles.loadingText}>Analyzing crop image...</Text>
                        <Text style={styles.loadingTextKannada}>ಚಿತ್ರ ವಿಶ್ಲೇಷಣೆ ನಡೆಯುತ್ತಿದೆ...</Text>
                    </View>
                )}

                {/* Diagnosis Results */}
                {diagnosis && !isAnalyzing && (
                    <View style={styles.diagnosisSection}>
                        <View style={styles.diagnosisHeader}>
                            <IconSymbol name="medical" size={24} color="#31A05F" />
                            <Text style={styles.diagnosisTitle}>Diagnosis Result</Text>
                        </View>

                        <View style={styles.diseaseCard}>
                            <Text style={styles.diseaseName}>{diagnosis.disease}</Text>
                            <Text style={styles.diseaseNameKannada}>{diagnosis.nameKannada}</Text>
                            <Text style={styles.diseaseDescription}>{diagnosis.description}</Text>
                            <View style={styles.confidenceContainer}>
                                <Text style={styles.confidenceText}>
                                    Confidence: {Math.round(diagnosis.confidence * 100)}%
                                </Text>
                                <View style={styles.confidenceBar}>
                                    <View
                                        style={[
                                            styles.confidenceFill,
                                            { width: `${diagnosis.confidence * 100}%` }
                                        ]}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Symptoms Section */}
                        <View style={styles.symptomsSection}>
                            <Text style={styles.sectionTitle}>
                                <IconSymbol name="eye.fill" size={16} color="#2196F3" /> Symptoms
                            </Text>
                            {diagnosis.symptoms.map((symptom, index) => (
                                <View key={index} style={styles.symptomItem}>
                                    <IconSymbol name="circle.fill" size={8} color="#2196F3" />
                                    <Text style={styles.symptomText}>{symptom}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Treatment Section */}
                        <View style={styles.treatmentSection}>
                            <Text style={styles.sectionTitle}>
                                <IconSymbol name="medical" size={16} color="#2196F3" /> Treatment
                            </Text>
                            {diagnosis.treatment.map((step, index) => (
                                <View key={index} style={styles.treatmentStep}>
                                    <Text style={styles.stepNumber}>{index + 1}</Text>
                                    <Text style={styles.stepText}>{step}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Prevention Section */}
                        <View style={styles.preventionSection}>
                            <Text style={styles.sectionTitle}>
                                <IconSymbol name="shield" size={16} color="#FF9800" /> Prevention
                            </Text>
                            {diagnosis.prevention.map((step, index) => (
                                <View key={index} style={styles.preventionStep}>
                                    <IconSymbol name="checkmark.circle.fill" size={16} color="#4CAF50" />
                                    <Text style={styles.stepText}>{step}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Retake Button */}
                        <TouchableOpacity
                            style={styles.retakeButton}
                            onPress={() => {
                                setImageUri(null);
                                setDiagnosis(null);
                            }}
                        >
                            <Text style={styles.retakeButtonText}>Analyze Another Image</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
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
        marginBottom: 20,
        color: '#666',
        marginTop: 20,
    },
    permissionButton: {
        backgroundColor: '#31A05F',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    permissionButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    header: {
        backgroundColor: '#31A05F',
        padding: 20,
        alignItems: 'center',
    },
    headerText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
    },
    subHeaderText: {
        fontSize: 16,
        color: 'white',
        opacity: 0.9,
        marginTop: 5,
    },
    imageSection: {
        padding: 20,
        alignItems: 'center',
    },
    capturedImage: {
        width: 300,
        height: 300,
        borderRadius: 10,
        resizeMode: 'cover',
    },
    placeholderImage: {
        width: 300,
        height: 300,
        borderRadius: 10,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#ddd',
        borderStyle: 'dashed',
    },
    placeholderText: {
        marginTop: 10,
        color: '#666',
        textAlign: 'center',
        fontSize: 14,
    },
    placeholderTextKannada: {
        color: '#666',
        textAlign: 'center',
        fontSize: 12,
        marginTop: 5,
    },
    buttonSection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    actionButton: {
        backgroundColor: '#31A05F',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        minWidth: 120,
        justifyContent: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    loadingSection: {
        padding: 20,
        alignItems: 'center',
    },
    loadingTextKannada: {
        color: '#666',
        fontSize: 12,
        marginTop: 5,
    },
    diagnosisSection: {
        padding: 20,
    },
    diagnosisHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    diagnosisTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 8,
    },
    diseaseCard: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    diseaseName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    diseaseNameKannada: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    diseaseDescription: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
        marginBottom: 15,
    },
    confidenceContainer: {
        marginTop: 10,
    },
    confidenceText: {
        fontSize: 12,
        color: '#666',
        marginBottom: 5,
    },
    confidenceBar: {
        height: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    confidenceFill: {
        height: '100%',
        backgroundColor: '#31A05F',
        borderRadius: 4,
    },
    symptomsSection: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    symptomItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    symptomText: {
        fontSize: 14,
        color: '#333',
        marginLeft: 8,
        flex: 1,
    },
    treatmentSection: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    treatmentStep: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    stepNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#31A05F',
        color: 'white',
        textAlign: 'center',
        lineHeight: 24,
        fontSize: 12,
        fontWeight: 'bold',
        marginRight: 10,
    },
    stepText: {
        fontSize: 14,
        color: '#333',
        flex: 1,
        lineHeight: 20,
    },
    preventionSection: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    preventionStep: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    retakeButton: {
        backgroundColor: '#31A05F',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    retakeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
}); 