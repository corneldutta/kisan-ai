import { router } from 'expo-router';

export const navigateToScreen = (screenName: string) => {
  switch (screenName) {
    case 'Market Prices':
      router.push('/screens/market-analysis');
      break;
    case 'Crop Diagnosis':
      router.push('/screens/crop-diagnosis');
      break;
    case 'Government Schemes':
      router.push('/screens/government-schemes');
      break;
    default:
      console.log(`Navigation to ${screenName} not implemented yet`);
  }
}; 