import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BLEPrinter,
  IBLEPrinter,
} from 'react-native-thermal-receipt-printer-image-qr';
import { Printer, RefreshCcw } from 'lucide-react-native';

async function requestBluetoothPermissions() {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      // Optionally check granted values here
    } catch (err) {
      Alert.alert('Permission Error', 'Bluetooth permissions are required.');
    }
  }
  // iOS: permissions are handled via Info.plist
}

export default function Devices() {
  const [devices, setDevices] = useState<IBLEPrinter[]>([]);
  const [connected, setConnected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const scanDevices = useCallback(async () => {
    setRefreshing(true);
    await requestBluetoothPermissions();
    BLEPrinter.init()
      .then(() => BLEPrinter.getDeviceList())
      .then((list) => setDevices(list))
      .catch((e) => Alert.alert('Error', String(e)))
      .finally(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    scanDevices();
  }, [scanDevices]);

  const connect = (mac: string) => {
    setLoading(true);
    BLEPrinter.connectPrinter(mac)
      .then(() => {
        setConnected(mac);
        Alert.alert('Connected', 'Printer connected successfully');
      })
      .catch((e) => Alert.alert('Connection Error', String(e)))
      .finally(() => setLoading(false));
  };

  const disconnect = () => {
    setLoading(true);
    BLEPrinter.closeConn()
      .then(() => {
        setConnected(null);
        Alert.alert('Disconnected', 'Printer disconnected');
      })
      .catch((e) => Alert.alert('Disconnection Error', String(e)))
      .finally(() => setLoading(false));
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white py-5 px-6 border-b border-gray-200 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Printer size={28} className="text-blue-500" />
          <Text className="text-2xl font-bold text-gray-800 ml-3">Devices</Text>
        </View>
        <TouchableOpacity
          onPress={scanDevices}
          className="flex-row items-center bg-blue-100 px-3 py-2 rounded-lg"
          disabled={refreshing}
        >
          <RefreshCcw size={20} className="text-blue-500" />
          <Text className="text-blue-700 font-semibold ml-2">Refresh</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={devices}
        keyExtractor={(item) => item.inner_mac_address}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text className="text-gray-500 text-center mt-10">
            No devices found
          </Text>
        }
        renderItem={({ item }) => (
          <View className="bg-white rounded-xl p-4 mb-4 flex-row items-center justify-between border border-gray-200">
            <View>
              <Text className="text-lg font-semibold text-gray-800">
                {item.device_name}
              </Text>
              <Text className="text-xs text-gray-500">
                {item.inner_mac_address}
              </Text>
            </View>
            {connected === item.inner_mac_address ? (
              <TouchableOpacity
                onPress={disconnect}
                className="bg-red-500 px-4 py-2 rounded-lg"
                disabled={loading}
              >
                <Text className="text-white font-semibold">Disconnect</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => connect(item.inner_mac_address)}
                className="bg-blue-500 px-4 py-2 rounded-lg"
                disabled={loading}
              >
                <Text className="text-white font-semibold">Connect</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}
