import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Plus, RotateCcw } from 'lucide-react-native';

interface CalculatorSummaryProps {
  grandTotal: number;
  onAddItem: () => void;
  onClearAll: () => void;
  onPrint?: () => void; // Add optional onPrint prop
}

export default function CalculatorSummary({
  grandTotal,
  onAddItem,
  onClearAll,
  onPrint,
}: CalculatorSummaryProps) {
  const formatCurrency = (value: number) => {
    return `₱${value.toFixed(2)}`;
  };

  return (
    <View className="bg-white py-5 px-6 border-t border-gray-200">
      {/* Button Row */}
      <View className="flex-row justify-between mb-5">
        {/* Add Item Button */}
        <TouchableOpacity
          onPress={onAddItem}
          className="flex-row items-center bg-blue-500 px-5 py-3 rounded-lg flex-[0.31] justify-center"
        >
          <Plus size={20} className="text-white" />
          <Text className="text-white font-semibold text-base ml-2">
            Add Item
          </Text>
        </TouchableOpacity>

        {/* Print Button */}
        {onPrint && (
          <TouchableOpacity
            onPress={onPrint}
            className="flex-row items-center bg-emerald-500 px-5 py-3 rounded-lg flex-[0.31] justify-center"
          >
            {/* Printer icon can be added here if available */}
            <Text className="text-white font-semibold text-base">Print</Text>
          </TouchableOpacity>
        )}

        {/* Clear All Button */}
        <TouchableOpacity
          onPress={onClearAll}
          className="flex-row items-center bg-gray-50 px-5 py-3 rounded-lg flex-[0.31] justify-center border border-gray-300"
        >
          <RotateCcw size={20} className="text-gray-500" />
          <Text className="text-gray-500 font-semibold text-base ml-2">
            Clear All
          </Text>
        </TouchableOpacity>
      </View>

      {/* Grand Total */}
      <View className="bg-emerald-50 py-4 px-6 rounded-xl border border-emerald-200 items-center">
        <Text className="text-emerald-800 font-medium text-base mb-1">
          Grand Total
        </Text>
        <Text className="text-emerald-600 font-bold text-3xl">
          {formatCurrency(grandTotal)}
        </Text>
      </View>
    </View>
  );
}
