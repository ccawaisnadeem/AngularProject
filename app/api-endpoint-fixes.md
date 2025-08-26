# API Endpoint Fixes

Based on the 405 (Method Not Allowed) errors, I need to update the following in your frontend services to match the backend API endpoints:

## 1. Cart Service Fixes

Update `cart-state.service.ts`:

```typescript
clearCart(): Observable<boolean> {
  const user = this.authService.currentUserValue;
  if (!user?.id) {
    this.updateCartState([]);
    return of(true);
  }

  const userId = parseInt(user.id);

  this.setLoading(true);
  this.setError(null);

  // Updated to match backend API endpoint structure - using clear method instead of DELETE
  return this.cartService.clearCartByUser(userId).pipe(
    tap(() => {
      this.currentCartId = null;
      this.updateCartState([]);
      this.setLoading(false);
    }),
    map(() => true),
    catchError(error => {
      console.error('Error clearing cart:', error);
      this.setError('Failed to clear cart');
      this.setLoading(false);
      return of(false);
    })
  );
}
```

## 2. Cart Service Implementation Fix

Update `carts.ts`:

```typescript
// Change from DELETE to POST for clearing cart
clearCartByUser(userId: number): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/user/${userId}/clear`, {})
    .pipe(catchError(this.handleError));
}

// Keep original method for compatibility
clearCart(cartId: number): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/${cartId}/clear`, {})
    .pipe(catchError(this.handleError));
}
```

## 3. Order Service Fix

Update `order.ts`:

```typescript
// Update to match backend endpoint structure
createOrderFromSession(orderData: any): Observable<Order> {
  return this.http.post<Order>(`${this.apiUrl}/create`, orderData)
    .pipe(catchError(this.handleError));
}

// Keep original method for compatibility
placeOrder(orderData: any): Observable<Order> {
  return this.http.post<Order>(`${this.apiUrl}/create`, orderData)
    .pipe(catchError(this.handleError));
}
```

## 4. CheckoutSuccessComponent Fix

Update `CheckoutSuccessComponent.ts`:

```typescript
// Clear the cart after successful payment and create order
this.cartStateService.clearCart().subscribe({
  next: () => {
    console.log('Cart cleared after successful payment');
    
    // Create a record in the order history using updated endpoint
    const orderData = {
      sessionId: this.sessionId,
      totalAmount: session.totalAmount / 100, // Convert from cents to dollars
      paymentStatus: session.paymentStatus,
      userId: this.authService.currentUserValue?.id
    };
    
    this.orderService.createOrderFromSession(orderData).subscribe({
      next: (order) => {
        console.log('Order created successfully:', order);
      },
      error: (error) => {
        console.error('Error creating order record:', error);
        // Don't show an error to the user here, as payment was still successful
      }
    });
  },
  error: (err) => {
    console.error('Failed to clear cart:', err);
  }
});
```

These changes should resolve the 405 errors by updating your frontend services to match the actual API endpoint methods available on your backend.

## Important Notes:

1. The 405 errors indicate your backend API doesn't support:
   - DELETE method on `/api/cart/{id}` - likely uses POST to `/api/cart/{id}/clear` instead
   - POST method to `/api/Order/place` - likely uses a different endpoint like `/api/Order/create`

2. You should either update your frontend to match the backend or update the backend to support these methods.

3. If you're using ASP.NET Core, check your controller method attributes to ensure they have the correct HTTP method attributes ([HttpDelete], [HttpPost], etc.)
