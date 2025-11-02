import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { BeverageItem } from '@/types/beverage';

interface BeverageRowProps {
  item: BeverageItem;
  index: number;
  onUpdate: (
    id: string,
    field: keyof BeverageItem,
    value: string | number
  ) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

export default function BeverageRow({
  item,
  index,
  onUpdate,
  onRemove,
  canRemove,
}: BeverageRowProps) {
  const formatCurrency = (value: number) => {
    return `₱${value.toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <View
      className={`flex-row items-center py-3 px-2 border-b border-gray-200 ${
        index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
      }`}
      style={{ minHeight: 60 }}
    >
      {/* Number - Matches header width */}
      <View className="w-6 mr-1">
        <Text className="text-sm font-semibold text-gray-500 text-center">
          {index + 1}
        </Text>
      </View>

      {/* Item Name - Matches header width */}
      <View className="flex-1 mr-1 min-w-[80px]">
        <TextInput
          value={item.name}
          onChangeText={(value) => onUpdate(item.id, 'name', value)}
          placeholder="Item name"
          className="bg-white border border-gray-300 rounded px-2 py-1 text-sm text-gray-800"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Price - Right aligned to match currency */}
      <View className="w-16 mr-1">
        <TextInput
          value={item.price > 0 ? item.price.toString() : ''}
          onChangeText={(value) =>
            onUpdate(item.id, 'price', parseFloat(value) || 0)
          }
          placeholder="0.00"
          keyboardType="numeric"
          className="bg-white border border-gray-300 rounded px-1 py-1 text-sm text-gray-800 text-right"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Quantity - Center aligned */}
      <View className="w-12 mr-1">
        <TextInput
          value={item.cases > 0 ? item.cases.toString() : ''}
          onChangeText={(value) =>
            onUpdate(item.id, 'cases', parseInt(value) || 0)
          }
          placeholder="0"
          keyboardType="numeric"
          className="bg-white border border-gray-300 rounded px-1 py-1 text-sm text-gray-800 text-center"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Total - Right aligned for currency */}
      <View className="w-20 mr-1">
        <Text className="text-sm font-semibold text-emerald-600 text-right bg-emerald-50 py-1 px-1 rounded">
          {formatCurrency(item.total)}
        </Text>
      </View>

      {/* Delete - Center aligned */}
      <View className="w-6 items-center">
        {canRemove && (
          <TouchableOpacity
            onPress={() => onRemove(item.id)}
            className="p-1 rounded bg-red-50"
          >
            <Trash2 size={14} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
