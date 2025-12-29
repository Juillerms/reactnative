import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications'; // <--- Importe
import React, { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';

export type Coords = {
  latitude: number;
  longitude: number;
};

export interface Order {
  id: string;
  vehicle: string;
  destination: string;
  destinationCoords: Coords;
  price: number;
  status: 'pending' | 'accepted' | 'delivered';
  createdAt: number;
  proofPhoto?: string | null;
}

interface OrderContextType {
  orders: Order[];
  createOrder: (vehicle: string, price: number, destination: string, coords: Coords) => void;
  acceptOrder: (orderId: string) => void;
  finishOrder: (orderId: string, photoUri?: string) => void;
}

const ORDERS_KEY = '@logitech:orders';

const OrderContext = createContext<OrderContextType>({} as OrderContextType);

export function OrderProvider({ children }: PropsWithChildren) {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const storedOrders = await AsyncStorage.getItem(ORDERS_KEY);
        if (storedOrders) {
          setOrders(JSON.parse(storedOrders));
        }
      } catch (e) {
        console.error('Erro ao carregar pedidos', e);
      }
    })();
  }, []);

  const saveOrders = async (newOrders: Order[]) => {
    try {
      await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(newOrders));
    } catch (e) {
      console.error('Erro ao salvar pedidos', e);
    }
  };

  // Helper para enviar notificação
  const sendNotification = async (title: string, body: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: null, // null = dispara imediatamente
    });
  };

  const createOrder = (vehicle: string, price: number, destination: string, coords: Coords) => {
    const fakeCoords = { latitude: -8.063169, longitude: -34.871139 };
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      vehicle,
      price,
      destination,
      destinationCoords: coords || fakeCoords,
      status: 'pending',
      createdAt: Date.now(),
      proofPhoto: null,
    };
    
    setOrders((prev) => {
      const updated = [newOrder, ...prev];
      saveOrders(updated);
      return updated;
    }); 
  };

  const acceptOrder = (orderId: string) => {
    setOrders((prev) => {
      const updated = prev.map((order) =>
        order.id === orderId ? { ...order, status: 'accepted' as const } : order
      );
      saveOrders(updated);
      
      // DISPARA NOTIFICAÇÃO: MOTORISTA ACEITOU
      sendNotification("🚚 Motorista a caminho!", `O pedido #${orderId} foi aceito e está em rota.`);
      
      return updated;
    });
  };

  const finishOrder = (orderId: string, photoUri?: string) => {
    setOrders((prev) => {
      const updated = prev.map((order) =>
        order.id === orderId 
          ? { ...order, status: 'delivered' as const, proofPhoto: photoUri || null } 
          : order
      );
      saveOrders(updated);

      // DISPARA NOTIFICAÇÃO: ENTREGA CONCLUÍDA
      sendNotification("✅ Entrega Finalizada", `O pedido #${orderId} foi entregue com sucesso. Verifique o comprovante.`);

      return updated;
    });
  };

  return (
    <OrderContext.Provider value={{ orders, createOrder, acceptOrder, finishOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export const useOrder = () => useContext(OrderContext);