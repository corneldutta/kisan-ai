import HomeScreen from '@/components/HomeScreen';
import { IconSymbol } from '@/components/ui/IconSymbol';
import {
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function HomeTabScreen() {
  const handleMenuPress = () => {
    Alert.alert('Menu', 'Opening side menu...');
  };

  const handleSearchPress = () => {
    Alert.alert('Search', 'Opening search...');
  };

  const handleNotificationPress = () => {
    Alert.alert('Notifications', 'Opening notifications...');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={handleMenuPress}>
          <IconSymbol name="line.3.horizontal" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Kisan Mitra</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton} onPress={handleSearchPress}>
            <IconSymbol name="magnifyingglass" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleNotificationPress}>
            <IconSymbol name="bell" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <HomeScreen />
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
  menuButton: {
    padding: 8,
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
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
});
