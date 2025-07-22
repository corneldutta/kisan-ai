import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import CropDiagnosisScreen from './src/screens/CropDiagnosisScreen';
import MarketAnalysisScreen from './src/screens/MarketAnalysisScreen';
import GovernmentSchemesScreen from './src/screens/GovernmentSchemesScreen';
import VoiceAssistantScreen from './src/screens/VoiceAssistantScreen';
import WhisperIntelligenceScreen from './src/screens/WhisperIntelligenceScreen';

const Stack = createStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <StatusBar style="auto" />
            <Stack.Navigator
                initialRouteName="Home"
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#87CEEB',
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                }}
            >
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{ title: 'Project Kisan' }}
                />
                <Stack.Screen
                    name="WhisperIntelligence"
                    component={WhisperIntelligenceScreen}
                    options={{ title: 'Whisper Intelligence' }}
                />
                <Stack.Screen
                    name="VoiceAssistant"
                    component={VoiceAssistantScreen}
                    options={{ title: 'Voice Assistant' }}
                />
                <Stack.Screen
                    name="CropDiagnosis"
                    component={CropDiagnosisScreen}
                    options={{ title: 'Crop Diagnosis' }}
                />
                <Stack.Screen
                    name="MarketAnalysis"
                    component={MarketAnalysisScreen}
                    options={{ title: 'Market Prices' }}
                />
                <Stack.Screen
                    name="GovernmentSchemes"
                    component={GovernmentSchemesScreen}
                    options={{ title: 'Government Schemes' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});