import React, { useState, useCallback } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CalculatorHeader from '@/components/CalculatorHeader';
import TableHeader from '@/components/TableHeader';
import BeverageRow from '@/components/BeverageRow';
import CalculatorSummary from '@/components/CalculatorSummary';
import { BeverageItem } from '@/types/beverage';
import { BLEPrinter } from 'react-native-thermal-receipt-printer-image-qr';

export default function BeverageCalculator() {
  const [items, setItems] = useState<BeverageItem[]>([
    { id: '1', name: 'Coke', price: 0, cases: 0, total: 0 },
    { id: '2', name: 'Sprite', price: 0, cases: 0, total: 0 },
    { id: '3', name: 'Pepsi', price: 0, cases: 0, total: 0 },
  ]);

  const calculateTotal = useCallback((price: number, cases: number): number => {
    return price * cases;
  }, []);

  const updateItem = useCallback(
    (id: string, field: keyof BeverageItem, value: string | number) => {
      setItems((currentItems) =>
        currentItems.map((item) => {
          if (item.id === id) {
            const updatedItem = { ...item, [field]: value };

            if (field === 'price' || field === 'cases') {
              updatedItem.total = calculateTotal(
                field === 'price' ? (value as number) : item.price,
                field === 'cases' ? (value as number) : item.cases
              );
            }

            return updatedItem;
          }
          return item;
        })
      );
    },
    [calculateTotal]
  );

  const addItem = useCallback(() => {
    const newId = Date.now().toString();
    const newItem: BeverageItem = {
      id: newId,
      name: `Item ${items.length + 1}`,
      price: 0,
      cases: 0,
      total: 0,
    };
    setItems((currentItems) => [...currentItems, newItem]);
  }, [items.length]);

  const removeItem = useCallback((id: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setItems((currentItems) =>
      currentItems.map((item) => ({
        ...item,
        price: 0,
        cases: 0,
        total: 0,
      }))
    );
  }, []);

  const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

  // Print handler
  const handlePrint = useCallback(() => {
    try {
      let printText = 'Beverage List\n';
      printText += '-----------------------------\n';
      items.forEach((item) => {
        printText += `${item.name}  x${item.cases}  ${item.price}  = ${item.total}\n`;
      });
      printText += '-----------------------------\n';
      printText += `Grand Total: PHP ${grandTotal.toFixed(2)}\n`;
      BLEPrinter.printText(printText, {});
    } catch (e) {
      Alert.alert('Print Error', String(e) || 'Failed to print');
    }
  }, [items, grandTotal]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <CalculatorHeader />

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="bg-white rounded-xl my-4 shadow-md shadow-black/10 overflow-hidden">
          <TableHeader />

          {items.map((item, index) => (
            <BeverageRow
              key={item.id}
              item={item}
              index={index}
              onUpdate={updateItem}
              onRemove={removeItem}
              canRemove={items.length > 1}
            />
          ))}
        </View>
      </ScrollView>

      <CalculatorSummary
        grandTotal={grandTotal}
        onAddItem={addItem}
        onClearAll={clearAll}
        onPrint={handlePrint}
      />
    </SafeAreaView>
  );
}
