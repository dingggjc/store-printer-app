import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BLEPrinter,
  IBLEPrinter,
} from 'react-native-thermal-receipt-printer-image-qr';
import { Printer, RefreshCcw, AlertCircle } from 'lucide-react-native';

async function requestBluetoothPermissions() {
  if (Platform.OS === 'android') {
    try {
      if (Platform.Version >= 31) {
        // Android 12 and above
        console.log('Requesting Android 12+ permissions...');
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        console.log('Permission results:', granted);

        const allGranted = Object.values(granted).every(
          (permission) => permission === PermissionsAndroid.RESULTS.GRANTED
        );

        if (!allGranted) {
          Alert.alert(
            'Permission Required',
            'This app needs Bluetooth and Location permissions to scan for printers. Location is required by Android for Bluetooth scanning.',
            [{ text: 'OK' }]
          );
          return false;
        }
      } else {
        // Android 11 and below
        console.log('Requesting Android 11 permissions...');
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );

        console.log('Permission result:', granted);

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Permission Required',
            'Location permission is required by Android for Bluetooth scanning.',
            [{ text: 'OK' }]
          );
          return false;
        }
      }
      return true;
    } catch (err) {
      console.error('Permission request error:', err);
      Alert.alert(
        'Permission Error',
        'Failed to request permissions: ' + String(err)
      );
      return false;
    }
  }
  return true;
}

export default function Devices() {
  const [devices, setDevices] = useState<IBLEPrinter[]>([]);
  const [connected, setConnected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const scanDevices = useCallback(async () => {
    console.log('Starting scan...');
    setRefreshing(true);
    setDevices([]); // Clear previous devices

    const hasPermission = await requestBluetoothPermissions();
    console.log('Has permission:', hasPermission);

    if (!hasPermission) {
      setRefreshing(false);
      return;
    }

    try {
      console.log('Initializing BLE...');
      await BLEPrinter.init();
      console.log('BLE initialized, getting device list...');

      const list = await BLEPrinter.getDeviceList();
      console.log('Device list received:', list);

      setDevices(list);

      if (list.length === 0) {
        Alert.alert(
          'No Devices Found',
          'Troubleshooting tips:\n\n' +
            '1. Make sure Bluetooth is ON in phone settings\n' +
            '2. Turn on your thermal printer\n' +
            '3. Some printers need to be paired in phone Bluetooth settings first\n' +
            '4. Try turning the printer off and on\n' +
            '5. Make sure printer is in discoverable mode',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Success', `Found ${list.length} device(s)`);
      }
    } catch (e) {
      console.error('Scan error:', e);
      Alert.alert(
        'Scan Error',
        'Error: ' +
          String(e) +
          '\n\nMake sure Bluetooth is enabled in your phone settings.'
      );
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // Delay initial scan to ensure permissions are ready
    const timer = setTimeout(() => {
      scanDevices();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const connect = useCallback((mac: string) => {
    console.log('Connecting to:', mac);
    setLoading(true);
    BLEPrinter.connectPrinter(mac)
      .then(() => {
        console.log('Connected successfully');
        setConnected(mac);
        Alert.alert('Connected', 'Printer connected successfully!');
      })
      .catch((e) => {
        console.error('Connection error:', e);
        Alert.alert(
          'Connection Failed',
          String(e) +
            '\n\nTry:\n1. Turning printer off/on\n2. Re-pairing in phone settings\n3. Moving closer to printer'
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const disconnect = useCallback(() => {
    console.log('Disconnecting...');
    setLoading(true);
    BLEPrinter.closeConn()
      .then(() => {
        console.log('Disconnected successfully');
        setConnected(null);
        Alert.alert('Disconnected', 'Printer disconnected');
      })
      .catch((e) => {
        console.error('Disconnection error:', e);
        Alert.alert('Disconnection Error', String(e));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-blue-600 py-5 px-6 border-b border-blue-700">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <Printer size={28} color="white" />
            <Text className="text-2xl font-bold text-white ml-3">Devices</Text>
          </View>
          <TouchableOpacity
            onPress={scanDevices}
            className="flex-row items-center bg-blue-500 px-4 py-2 rounded-lg"
            disabled={refreshing}
          >
            <RefreshCcw size={20} color="white" />
            <Text className="text-white font-semibold ml-2">
              {refreshing ? 'Scanning...' : 'Scan'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info banner */}
        <View className="bg-blue-700 rounded-lg p-3 flex-row items-start">
          <AlertCircle size={16} color="#93C5FD" style={{ marginTop: 2 }} />
          <Text className="text-blue-100 text-xs ml-2 flex-1">
            Location permission is required by Android for Bluetooth scanning.
            Your location data is not collected.
          </Text>
        </View>
      </View>

      <FlatList
        data={devices}
        keyExtractor={(item) => item.inner_mac_address}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View className="items-center mt-10 px-6">
            {refreshing ? (
              <>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="text-gray-500 text-center text-base mt-4">
                  Scanning for Bluetooth devices...
                </Text>
              </>
            ) : (
              <>
                <Printer size={64} color="#D1D5DB" />
                <Text className="text-gray-600 text-center text-lg font-semibold mt-4">
                  No Devices Found
                </Text>
                <Text className="text-gray-400 text-center text-sm mt-2">
                  Tap "Scan" to search for Bluetooth printers
                </Text>
                <View className="bg-blue-50 rounded-lg p-4 mt-6 w-full">
                  <Text className="text-blue-900 font-semibold mb-2">
                    Troubleshooting:
                  </Text>
                  <Text className="text-blue-700 text-sm">
                    • Enable Bluetooth in phone settings{'\n'}• Turn on your
                    thermal printer{'\n'}• Move closer to the printer{'\n'}•
                    Some printers need manual pairing first
                  </Text>
                </View>
              </>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View className="bg-white rounded-xl p-4 mb-3 flex-row items-center justify-between border border-gray-200 shadow-sm">
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-800">
                {item.device_name || 'Unknown Device'}
              </Text>
              <Text className="text-xs text-gray-500 mt-1 font-mono">
                {item.inner_mac_address}
              </Text>
              {connected === item.inner_mac_address && (
                <View className="bg-emerald-100 px-3 py-1 rounded-full mt-2 self-start">
                  <Text className="text-emerald-700 text-xs font-semibold">
                    ✓ Connected
                  </Text>
                </View>
              )}
            </View>
            {connected === item.inner_mac_address ? (
              <TouchableOpacity
                onPress={disconnect}
                className="bg-red-500 px-5 py-2.5 rounded-lg ml-3"
                disabled={loading}
              >
                <Text className="text-white font-semibold">
                  {loading ? 'Wait...' : 'Disconnect'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => connect(item.inner_mac_address)}
                className="bg-blue-500 px-5 py-2.5 rounded-lg ml-3"
                disabled={loading}
              >
                <Text className="text-white font-semibold">
                  {loading ? 'Wait...' : 'Connect'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}
