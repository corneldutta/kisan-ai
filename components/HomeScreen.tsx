import { IconSymbol } from '@/components/ui/IconSymbol';
import { navigateToScreen } from '@/utils/navigation';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface ServiceData {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
}

export default function HomeScreen() {
  const services: ServiceData[] = [
    { 
      id: '1', 
      title: 'Crop Diagnosis', 
      subtitle: 'ಬೆಳೆ ರೋಗ ನಿರ್ಣಯ',
      icon: 'leaf.fill', 
      color: '#31A05F'
    },
    { 
      id: '2', 
      title: 'Market Prices', 
      subtitle: 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು',
      icon: 'arrow.up', 
      color: '#FF6B35'
    },
    { 
      id: '3', 
      title: 'Government Schemes', 
      subtitle: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು',
      icon: 'newspaper.fill', 
      color: '#4A90E2'
    },
  ];

  const handleServicePress = (service: ServiceData) => {
    navigateToScreen(service.title);
  };

  const renderServiceCard = (service: ServiceData) => (
    <TouchableOpacity
      key={service.id}
      style={[styles.serviceCard, { borderLeftColor: service.color }]}
      onPress={() => handleServicePress(service)}
    >
      <View style={styles.serviceContent}>
        <View style={[styles.iconContainer, { backgroundColor: service.color }]}>
          <IconSymbol name={service.icon} size={24} color="#FFFFFF" />
        </View>
        <View style={styles.serviceText}>
          <Text style={styles.serviceTitle}>{service.title}</Text>
          <Text style={styles.serviceSubtitle}>{service.subtitle}</Text>
        </View>
        <IconSymbol name="chevron.right" size={20} color="#4B4B4B" />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>ಇಂದು ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?</Text>
        <Text style={styles.headerSubtitle}>How can I help you today?</Text>
      </View>

      {/* Services Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Services</Text>
        <Text style={styles.sectionTitleKannada}>ಸೇವೆಗಳು</Text>
        <View style={styles.servicesContainer}>
          {services.map(renderServiceCard)}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: '#EFEFEF',
  },
  headerSection: {
    backgroundColor: '#31A05F',
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 5,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  section: {
    marginVertical: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4B4B4B',
    marginBottom: 5,
    fontFamily: 'System',
  },
  sectionTitleKannada: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B4B4B',
    marginBottom: 15,
    fontFamily: 'System',
  },
    servicesContainer: {
    gap: 10,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    borderLeftWidth: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  serviceContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  serviceText: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4B4B4B',
    fontFamily: 'System',
  },
  serviceSubtitle: {
    fontSize: 14,
    color: '#4B4B4B',
    marginTop: 2,
    fontFamily: 'System',
  },
}); 