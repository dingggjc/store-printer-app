import React from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calculator, Info } from 'lucide-react-native';

export default function Instructions() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white py-5 px-6 border-b border-gray-200">
        <View className="flex-row items-center">
          <Info size={28} className="text-blue-500" />
          <Text className="text-2xl font-bold text-gray-800 ml-3">
            Instructions
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="bg-white rounded-xl py-8 px-6 my-6 shadow-md shadow-black/10 items-center">
          {/* Icon */}
          <View className="w-20 h-20 rounded-full bg-blue-50 justify-center items-center mb-6 overflow-hidden">
            <Image
              source={require('../../assets/images/dingdong.png')}
              className="w-16 h-16 rounded-full"
              resizeMode="cover"
            />
          </View>

          {/* Title */}
          <Text className="text-3xl font-bold text-gray-800 mb-4 text-center">
            How to Use This App
          </Text>

          {/* Instructions */}
          <Text className="text-base text-gray-600 text-left leading-7 mb-8">
            1. <Text className="font-semibold">Calculator Tab:</Text>
            {'\n'}- Enter the beverage name, price, and quantity (cases).{'\n'}-
            Add more items with the "Add Item" button.{'\n'}- Remove items with
            the delete button.{'\n'}- The total is calculated automatically.
            {'\n'}- Press "Print" to print the receipt to your connected
            printer.{'\n'}
            {'\n'}
            2. <Text className="font-semibold">Devices Tab:</Text>
            {'\n'}- Make sure your Bluetooth printer is paired in your phone's
            Bluetooth settings.{'\n'}- Use the "Refresh" button to scan for
            paired printers.{'\n'}- Connect to a printer by tapping "Connect".
            {'\n'}- Disconnect anytime with the "Disconnect" button.{'\n'}
            {'\n'}
            3. <Text className="font-semibold">Printing:</Text>
            {'\n'}- Only one printer can be connected at a time.{'\n'}- The
            printed receipt will show your beverage list and grand total.{'\n'}
            {'\n'}
            4. <Text className="font-semibold">Tips:</Text>
            {'\n'}- Pair new printers in your phone's Bluetooth settings, not in
            the app.{'\n'}- For best results, use 58mm thermal paper.{'\n'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
