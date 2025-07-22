import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { CROP_DISEASES, COLORS, ERROR_MESSAGES, PERMISSIONS } from '../utils/constants';

export default function CropDiagnosisScreen() {
    const [hasPermission, setHasPermission] = useState(null);
    const [imageUri, setImageUri] = useState(null);
    const [diagnosis, setDiagnosis] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
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
            Alert.alert('Error', ERROR_MESSAGES.IMAGE_TOO_LARGE);
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
            Alert.alert('Error', ERROR_MESSAGES.PERMISSION_DENIED);
        }
    };

    const analyzeCropImage = async (uri) => {
        setIsAnalyzing(true);
        try {
            // Use constants for disease data
            setTimeout(() => {
                setDiagnosis({
                    disease: CROP_DISEASES.TOMATO.EARLY_BLIGHT.name,
                    nameKannada: CROP_DISEASES.TOMATO.EARLY_BLIGHT.nameKannada,
                    confidence: 0.87,
                    description: 'ಟೊಮೇಟೋ ಎಲೆಯಲ್ಲಿ ಆರಂಭಿಕ ಬ್ಲೈಟ್ ರೋಗ ಕಂಡುಬಂದಿದೆ. ಇದು ಅಲ್ಟರ್ನೇರಿಯಾ ಶಿಲೀಂಧ್ರದಿಂದ ಉಂಟಾಗುತ್ತದೆ.',
                    symptoms: CROP_DISEASES.TOMATO.EARLY_BLIGHT.symptoms,
                    causes: CROP_DISEASES.TOMATO.EARLY_BLIGHT.causes,
                    treatment: CROP_DISEASES.TOMATO.EARLY_BLIGHT.treatment,
                    prevention: CROP_DISEASES.TOMATO.EARLY_BLIGHT.prevention
                });
                setIsAnalyzing(false);
            }, 2000);
        } catch (error) {
            console.error('Analysis error:', error);
            setIsAnalyzing(false);
            Alert.alert('Error', ERROR_MESSAGES.API_ERROR);
        }
    };

    if (hasPermission === null) {
        return <View />;
    }

    if (hasPermission === false) {
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>{PERMISSIONS.CAMERA}</Text>
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

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Crop Disease Diagnosis</Text>
                <Text style={styles.subHeaderText}>ಬೆಳೆ ರೋಗ ನಿರ್ಣಯ</Text>
            </View>

            <View style={styles.imageSection}>
                {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.capturedImage} />
                ) : (
                    <View style={styles.placeholderImage}>
                        <Ionicons name="leaf-outline" size={50} color="#ccc" />
                        <Text style={styles.placeholderText}>Take or select a photo of your crop</Text>
                    </View>
                )}
            </View>

            <View style={styles.buttonSection}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={takePicture}
                >
                    <Ionicons name="camera" size={24} color="white" />
                    <Text style={styles.buttonText}>Take Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={pickImage}
                >
                    <Ionicons name="image" size={24} color="white" />
                    <Text style={styles.buttonText}>Gallery</Text>
                </TouchableOpacity>
            </View>

            {isAnalyzing && (
                <View style={styles.loadingSection}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                    <Text style={styles.loadingText}>Analyzing crop image...</Text>
                    <Text style={styles.loadingTextKannada}>ಚಿತ್ರ ವಿಶ್ಲೇಷಣೆ ನಡೆಯುತ್ತಿದೆ...</Text>
                </View>
            )}

            {diagnosis && !isAnalyzing && (
                <View style={styles.diagnosisSection}>
                    <View style={styles.diagnosisHeader}>
                        <Ionicons name="medical" size={24} color="#4CAF50" />
                        <Text style={styles.diagnosisTitle}>Diagnosis Result</Text>
                    </View>

                    <View style={styles.diseaseCard}>
                        <Text style={styles.diseaseName}>{diagnosis.disease}</Text>
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

                    <View style={styles.treatmentSection}>
                        <Text style={styles.sectionTitle}>
                            <Ionicons name="medical" size={16} color="#2196F3" /> Treatment
                        </Text>
                        {diagnosis.treatment.map((step, index) => (
                            <View key={index} style={styles.treatmentStep}>
                                <Text style={styles.stepNumber}>{index + 1}</Text>
                                <Text style={styles.stepText}>{step}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.preventionSection}>
                        <Text style={styles.sectionTitle}>
                            <Ionicons name="shield-checkmark" size={16} color="#FF9800" /> Prevention
                        </Text>
                        {diagnosis.prevention.map((step, index) => (
                            <View key={index} style={styles.preventionStep}>
                                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                                <Text style={styles.stepText}>{step}</Text>
                            </View>
                        ))}
                    </View>

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
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.BACKGROUND,
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    permissionText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        color: COLORS.TEXT_SECONDARY,
    },
    permissionButton: {
        backgroundColor: COLORS.PRIMARY,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    permissionButtonText: {
        color: COLORS.WHITE,
        fontWeight: 'bold',
    },
    header: {
        backgroundColor: COLORS.PRIMARY,
        padding: 20,
        alignItems: 'center',
    },
    headerText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.WHITE,
    },
    subHeaderText: {
        fontSize: 16,
        color: COLORS.WHITE,
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
        backgroundColor: COLORS.GRAY_LIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.BORDER,
        borderStyle: 'dashed',
    },
    placeholderText: {
        marginTop: 10,
        color: COLORS.TEXT_SECONDARY,
        textAlign: 'center',
    },
    buttonSection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    actionButton: {
        backgroundColor: COLORS.PRIMARY,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        elevation: 3,
    },
    buttonText: {
        color: COLORS.WHITE,
        marginLeft: 8,
        fontWeight: 'bold',
    },
    loadingSection: {
        alignItems: 'center',
        padding: 30,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: COLORS.TEXT_SECONDARY,
    },
    loadingTextKannada: {
        marginTop: 5,
        fontSize: 14,
        color: COLORS.TEXT_SECONDARY,
    },
    diagnosisSection: {
        margin: 20,
        backgroundColor: COLORS.WHITE,
        borderRadius: 10,
        padding: 20,
        elevation: 3,
    },
    diagnosisHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    diagnosisTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
        color: COLORS.TEXT_PRIMARY,
    },
    diseaseCard: {
        backgroundColor: '#fff3e0',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.WARNING,
    },
    diseaseName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#e65100',
        marginBottom: 8,
    },
    diseaseDescription: {
        fontSize: 14,
        color: COLORS.TEXT_PRIMARY,
        lineHeight: 20,
        marginBottom: 10,
    },
    confidenceContainer: {
        marginTop: 10,
    },
    confidenceText: {
        fontSize: 12,
        color: COLORS.TEXT_SECONDARY,
        marginBottom: 5,
    },
    confidenceBar: {
        height: 4,
        backgroundColor: COLORS.BORDER,
        borderRadius: 2,
    },
    confidenceFill: {
        height: '100%',
        backgroundColor: COLORS.SUCCESS,
        borderRadius: 2,
    },
    treatmentSection: {
        marginBottom: 20,
    },
    preventionSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.TEXT_PRIMARY,
        marginBottom: 12,
    },
    treatmentStep: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    preventionStep: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    stepNumber: {
        backgroundColor: COLORS.SECONDARY,
        color: COLORS.WHITE,
        width: 20,
        height: 20,
        borderRadius: 10,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: 'bold',
        marginRight: 10,
        lineHeight: 20,
    },
    stepText: {
        flex: 1,
        fontSize: 14,
        color: COLORS.TEXT_PRIMARY,
        lineHeight: 20,
        marginLeft: 8,
    },
    retakeButton: {
        backgroundColor: COLORS.PRIMARY,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    retakeButtonText: {
        color: COLORS.WHITE,
        fontWeight: 'bold',
    },
});