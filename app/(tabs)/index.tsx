import React, { useState, useCallback } from 'react';
import { View, ScrollView, Alert, ToastAndroid, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CalculatorHeader from '@/components/CalculatorHeader';
import TableHeader from '@/components/TableHeader';
import BeverageRow from '@/components/BeverageRow';
import CalculatorSummary from '@/components/CalculatorSummary';
import { BeverageItem } from '@/types/beverage';
import { BLEPrinter } from 'react-native-thermal-receipt-printer-image-qr';

export default function BeverageCalculator() {
  const [items, setItems] = useState<BeverageItem[]>([
    { id: '1', name: 'Coke', price: 0, cases: 1, total: 0 },
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
      cases: 1,
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
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
        now.getDate()
      )}`;
      let hour = now.getHours();
      const ampm = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12;
      if (hour === 0) hour = 12;
      const timeStr = `${pad(hour)}:${pad(now.getMinutes())}:${pad(
        now.getSeconds()
      )} ${ampm}`;

      // Calculate subtotal and grand total
      const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

      // Header
      let printText = '';
      printText += '   Love Joy Grace Store\n';
      printText += '    BEVERAGE RECEIPT\n';
      printText += ` ${dateStr}  ${timeStr}\n\n`;
      printText += '------------------------------\n';
      printText += 'Item      Qty  Price   Total\n';
      printText += '------------------------------\n';

      // Items
      items.forEach((item) => {
        const name = (item.name || '').padEnd(9).slice(0, 9);
        const qty = ('x' + item.cases).padEnd(4).slice(0, 4);
        const price = item.price.toFixed(2).padStart(7).slice(-7);
        const total = item.total.toFixed(2).padStart(7).slice(-7);
        printText += `${name} ${qty} ${price} ${total}\n`;
      });
      printText += '------------------------------\n';
      printText += `GRAND TOTAL:${''.padStart(7)}PHP ${grandTotal.toFixed(
        2
      )}\n`;
      printText += '------------------------------\n\n';
      printText += '  Thank you for your purchase!\n';
      printText += 'Please come again. Stay hydrated!\n';
      printText += '\n\n\n\n\n'; // Extra spacing at the bottom

      BLEPrinter.printText(printText, {});
      if (Platform.OS === 'android') {
        ToastAndroid.show('Receipt sent to printer!', ToastAndroid.SHORT);
      } else {
        Alert.alert('Printed', 'Receipt sent to printer!');
      }
    } catch (e) {
      Alert.alert('Print Error', String(e) || 'Failed to print');
    }
  }, [items]);

  // Only enable print if at least one item has a total > 0
  const canPrint = items.some((item) => item.total > 0);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <CalculatorHeader />

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="bg-white rounded-2xl my-6 shadow-lg shadow-black/10 overflow-hidden border border-gray-200">
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

      <View className="px-4 pb-4">
        <CalculatorSummary
          grandTotal={grandTotal}
          onAddItem={addItem}
          onClearAll={clearAll}
          onPrint={canPrint ? handlePrint : undefined}
        />
      </View>
    </SafeAreaView>
  );
}
