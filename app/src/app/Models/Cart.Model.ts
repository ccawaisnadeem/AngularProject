// models/cart.model.ts
export interface Cart {
  id?: number;
  userId: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  cartItems?: CartItem[];
}

export interface CartItem {
  id?: number;
  cartId: number;
  productId: number;
  quantity: number;
  priceAtAdd: number;
  createdAt?: string;
}
