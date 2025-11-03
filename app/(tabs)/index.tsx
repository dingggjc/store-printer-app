import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, Alert, ToastAndroid, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CalculatorHeader from '@/components/CalculatorHeader';
import TableHeader from '@/components/TableHeader';
import BeverageRow from '@/components/BeverageRow';
import CalculatorSummary from '@/components/CalculatorSummary';
import { BeverageItem } from '@/types/beverage';
import { BLEPrinter } from 'react-native-thermal-receipt-printer-image-qr';

export default function BeverageCalculator() {
  const [items, setItems] = useState<BeverageItem[]>([]);

  const calculateTotal = useCallback((price: number, cases: number): number => {
    return price * cases;
  }, []);

  const updateItem = useCallback(
    (id: string, field: keyof BeverageItem, value: string | number) => {
      setItems((currentItems) =>
        currentItems.map((item) => {
          if (item.id !== id) return item;

          const updatedItem = { ...item, [field]: value };

          if (field === 'price' || field === 'cases') {
            updatedItem.total = calculateTotal(
              field === 'price' ? (value as number) : item.price,
              field === 'cases' ? (value as number) : item.cases
            );
          }

          return updatedItem;
        })
      );
    },
    [calculateTotal]
  );

  const addItem = useCallback(() => {
    const newId = Date.now().toString();
    const newItem: BeverageItem = {
      id: newId,
      name: '',
      price: 0,
      cases: 0,
      total: 0,
    };
    setItems((currentItems) => [...currentItems, newItem]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
  }, []);

  const grandTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.total, 0),
    [items]
  );

  const formatDateTime = useCallback(() => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');

    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate()
    )}`;

    let hour = now.getHours();
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;

    const timeStr = `${pad(hour)}:${pad(now.getMinutes())}:${pad(
      now.getSeconds()
    )} ${ampm}`;

    return { dateStr, timeStr };
  }, []);

  const formatCurrency = useCallback((amount: number): string => {
    return amount.toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, []);

  const generateReceiptText = useCallback(() => {
    const { dateStr, timeStr } = formatDateTime();

    let receipt = '';
    receipt += '================================\n';
    receipt += 'JOY LOVE CONSUMER GOODS TRADING\n';
    receipt += '   Non-VAT Reg. TIN: 492517470\n';
    receipt += '   09942954786-09917422036\n';
    receipt += ' P8, Poblacion, Libona, Buk.\n';
    receipt += '================================\n';
    receipt += `Date: ${dateStr}\n`;
    receipt += `Time: ${timeStr}\n`;
    receipt += '================================\n\n';

    receipt += 'ITEM         QTY   PRICE    TOTAL\n';
    receipt += '--------------------------------\n';

    items.forEach((item) => {
      const name = (item.name || 'Unnamed').substring(0, 12).padEnd(12);
      const qty = item.cases.toString().padStart(3);
      const price = formatCurrency(item.price).padStart(6);
      const total = formatCurrency(item.total).padStart(10);
      receipt += `${name} ${qty} ${price} ${total}\n`;
    });

    receipt += '================================\n';
    receipt += `GRAND TOTAL: ${formatCurrency(grandTotal).padStart(18)}\n`;
    receipt += '================================\n\n';
    receipt += '   Thank you for your purchase!\n';
    receipt += '     Please come again!\n';
    receipt += '\n\n\n\n';

    return receipt;
  }, [items, grandTotal, formatDateTime, formatCurrency]);

  const handlePrint = useCallback(async () => {
    try {
      const receiptText = generateReceiptText();
      await BLEPrinter.printText(receiptText, {});

      const message = 'Receipt sent to printer!';
      if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.SHORT);
      } else {
        Alert.alert('Printed', message);
      }
    } catch (error) {
      Alert.alert(
        'Print Error',
        error instanceof Error ? error.message : 'Failed to print'
      );
    }
  }, [generateReceiptText]);

  const canPrint = useMemo(() => items.some((item) => item.total > 0), [items]);

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
