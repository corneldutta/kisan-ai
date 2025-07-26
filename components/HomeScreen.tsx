import { IconSymbol } from '@/components/ui/IconSymbol';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface CropData {
  id: string;
  name: string;
  price: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

interface SchemeData {
  id: string;
  title: string;
  description: string;
}

interface ServiceData {
  id: string;
  title: string;
  icon: string;
}

export default function HomeScreen() {
  const cropData: CropData[] = [
    { id: '1', name: 'Tomato', price: 25, trend: 'up', trendPercentage: 5 },
    { id: '2', name: 'Onion', price: 18, trend: 'down', trendPercentage: 2 },
    { id: '3', name: 'Rice', price: 42, trend: 'stable', trendPercentage: 0 },
    { id: '4', name: 'Wheat', price: 35, trend: 'up', trendPercentage: 3 },
  ];

  const schemes: SchemeData[] = [
    { id: '1', title: 'PM-KISAN', description: 'Direct income support' },
    { id: '2', title: 'Soil Health Card', description: 'Soil testing scheme' },
    { id: '3', title: 'Crop Insurance', description: 'Fasal Bima Yojana' },
    { id: '4', title: 'Drip Irrigation', description: 'Water conservation subsidy' },
  ];

  const services: ServiceData[] = [
    { id: '1', title: 'Soil Testing', icon: 'leaf.fill' },
    { id: '2', title: 'News', icon: 'newspaper.fill' },
    { id: '3', title: 'Water Testing', icon: 'drop.fill' },
  ];

  const handleCropPress = (crop: CropData) => {
    Alert.alert(
      crop.name,
      `Current price: ₹${crop.price}/kg\nTrend: ${crop.trend} ${crop.trendPercentage}%`
    );
  };

  const handleSchemePress = (scheme: SchemeData) => {
    Alert.alert(scheme.title, scheme.description);
  };

  const handleServicePress = (service: ServiceData) => {
    Alert.alert(service.title, `Opening ${service.title} service...`);
  };

  const renderCropCard = (crop: CropData) => (
    <TouchableOpacity
      key={crop.id}
      style={styles.cropCard}
      onPress={() => handleCropPress(crop)}
    >
      <View style={styles.cropInfo}>
        <Text style={styles.cropName}>{crop.name}</Text>
        <Text style={styles.cropPrice}>₹{crop.price}/kg</Text>
        <View style={styles.trendContainer}>
          <IconSymbol
            name={crop.trend === 'up' ? 'arrow.up' : crop.trend === 'down' ? 'arrow.down' : 'minus'}
            size={12}
            color={crop.trend === 'up' ? '#31A05F' : crop.trend === 'down' ? '#EF9920' : '#4B4B4B'}
          />
          <Text
            style={[
              styles.trendText,
              {
                color: crop.trend === 'up' ? '#31A05F' : crop.trend === 'down' ? '#EF9920' : '#4B4B4B'
              }
            ]}
          >
            {crop.trendPercentage}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSchemeCard = (scheme: SchemeData) => (
    <TouchableOpacity
      key={scheme.id}
      style={styles.schemeCard}
      onPress={() => handleSchemePress(scheme)}
    >
      <Text style={styles.schemeTitle}>{scheme.title}</Text>
      <Text style={styles.schemeDescription}>{scheme.description}</Text>
    </TouchableOpacity>
  );

  const renderServiceCard = (service: ServiceData) => (
    <TouchableOpacity
      key={service.id}
      style={styles.serviceCard}
      onPress={() => handleServicePress(service)}
    >
      <IconSymbol name={service.icon} size={32} color="#31A05F" />
      <Text style={styles.serviceTitle}>{service.title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {/* My Crops Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>MY CROPS</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          {cropData.map(renderCropCard)}
        </ScrollView>
      </View>

      {/* Government Schemes Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>GOV SCHEMES</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          {schemes.map(renderSchemeCard)}
        </ScrollView>
      </View>

      {/* Services Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SERVICES</Text>
        <View style={styles.servicesGrid}>
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
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4B4B4B',
    marginHorizontal: 16,
    marginBottom: 12,
    fontFamily: 'System',
  },
  horizontalScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  cropCard: {
    width: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cropInfo: {
    alignItems: 'center',
  },
  cropName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4B4B4B',
    marginBottom: 4,
    fontFamily: 'System',
  },
  cropPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#31A05F',
    marginBottom: 4,
    fontFamily: 'System',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'System',
  },
  schemeCard: {
    width: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  schemeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4B4B4B',
    marginBottom: 8,
    fontFamily: 'System',
  },
  schemeDescription: {
    fontSize: 12,
    color: '#4B4B4B',
    lineHeight: 16,
    fontFamily: 'System',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  serviceCard: {
    flex: 1,
    minWidth: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B4B4B',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'System',
  },
}); 