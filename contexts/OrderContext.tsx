import React, { createContext, PropsWithChildren, useContext, useState } from 'react';

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
  proofPhoto?: string | null; // <--- O CAMPO DA FOTO
}

interface OrderContextType {
  orders: Order[];
  createOrder: (vehicle: string, price: number, destination: string, coords: Coords) => void;
  acceptOrder: (orderId: string) => void;
  finishOrder: (orderId: string, photoUri?: string) => void; // <--- ATENÇÃO AQUI
}

const OrderContext = createContext<OrderContextType>({} as OrderContextType);

export function OrderProvider({ children }: PropsWithChildren) {
  const [orders, setOrders] = useState<Order[]>([]);

  const createOrder = (vehicle: string, price: number, destination: string, coords: Coords) => {
    // Coordenadas fake (apenas para fallback)
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
    setOrders((prev) => [newOrder, ...prev]); 
  };

  const acceptOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: 'accepted' } : order
      )
    );
  };

  // --- O FIX CRÍTICO ESTÁ AQUI ---
  // Certifique-se que esta função está aceitando photoUri e salvando no state
  const finishOrder = (orderId: string, photoUri?: string) => {
    console.log("Finalizando pedido:", orderId, "Com foto:", photoUri); // Log para debug
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId 
          ? { ...order, status: 'delivered', proofPhoto: photoUri || null } 
          : order
      )
    );
  };

  return (
    <OrderContext.Provider value={{ orders, createOrder, acceptOrder, finishOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export const useOrder = () => useContext(OrderContext);