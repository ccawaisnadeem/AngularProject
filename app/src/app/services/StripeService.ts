import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

// Interfaces that match backend exactly
export interface CheckoutSessionRequest {
  userId: number;
  cartId: number;
  customerEmail: string;
  lineItems: CheckoutLineItem[];
}

export interface CheckoutLineItem {
  name: string;
  description: string;
  price: number;
  quantity: number;
  imageUrl?: string | null; // Allow null as a valid value
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface StripeSessionDetails {
  id: string;
  paymentStatus: string;
  customerEmail: string;
  totalAmount: number;
  currency: string;
}

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  // Fixed API URL - matches backend route exactly
  private readonly apiUrl = `${environment.apiUrl}/StripeCheckout`;
  
  // Stripe instance
  private stripe: any = null;
  private stripeLoaded = new BehaviorSubject<boolean>(false);
  public stripeLoaded$ = this.stripeLoaded.asObservable();

  // Payment processing state
  private isProcessing = new BehaviorSubject<boolean>(false);
  public isProcessing$ = this.isProcessing.asObservable();

  constructor(private http: HttpClient) {
    this.loadStripe();
  }

  /**
   * Load Stripe.js library
   */
  private async loadStripe(): Promise<void> {
    try {
      if (window.Stripe) {
        this.initializeStripe();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = () => {
        this.initializeStripe();
      };
      script.onerror = () => {
        console.error('Failed to load Stripe.js');
        this.stripeLoaded.next(false);
      };
      
      document.head.appendChild(script);
    } catch (error) {
      console.error('Error loading Stripe:', error);
      this.stripeLoaded.next(false);
    }
  }

  /**
   * Initialize Stripe with publishable key
   */
  private initializeStripe(): void {
    try {
      const publishableKey = environment.stripePublishableKey;
      if (!publishableKey) {
        console.error('Stripe publishable key is missing');
        this.stripeLoaded.next(false);
        return;
      }
      
      // Initialize Stripe with proper configuration
      this.stripe = window.Stripe(publishableKey, {
        apiVersion: '2022-11-15',  // Use a stable API version
        locale: 'auto'             // Use browser's locale
      });
      
      console.log('Stripe initialized successfully with key:', publishableKey.substring(0, 8) + '...');
      this.stripeLoaded.next(true);
    } catch (error) {
      console.error('Error initializing Stripe:', error);
      this.stripeLoaded.next(false);
    }
  }

  /**
   * Get Stripe instance
   */
  getStripe(): any {
    return this.stripe;
  }

  /**
   * Check if Stripe is loaded and ready
   */
  isStripeReady(): boolean {
    return this.stripe !== null && this.stripeLoaded.value;
  }

  /**
   * Create checkout session - JWT token automatically attached by interceptor
   */
  createCheckoutSession(data: CheckoutSessionRequest): Observable<CheckoutSessionResponse> {
    console.log('Creating checkout session with API URL:', `${this.apiUrl}/create-checkout-session`);
    
    // Only log detailed data in development mode
    if (!environment.production) {
      console.log('Request data:', JSON.stringify(data, null, 2));
    }
    
    // Ensure the request matches the backend expectations exactly
    const validData: CheckoutSessionRequest = {
      userId: data.userId || 0,
      cartId: data.cartId || 0,
      customerEmail: data.customerEmail || '',
      lineItems: data.lineItems.map(item => ({
        name: item.name || '',
        description: item.description || '',
        price: item.price || 0,
        quantity: item.quantity || 0,
        // Don't convert null to empty string - backend expects either valid URL or null
        imageUrl: item.imageUrl 
      }))
    };
    
    return this.http.post<CheckoutSessionResponse>(
      `${this.apiUrl}/create-checkout-session`, 
      validData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }

  /**
   * Redirect to Stripe Checkout
   */
  async redirectToCheckout(sessionId: string): Promise<{ error?: any }> {
    if (!this.isStripeReady()) {
      throw new Error('Stripe is not loaded yet');
    }

    this.isProcessing.next(true);

    try {
      const { error } = await this.stripe.redirectToCheckout({
        sessionId: sessionId
      });

      this.isProcessing.next(false);
      return { error };
    } catch (err) {
      this.isProcessing.next(false);
      console.error('Error redirecting to checkout:', err);
      return { error: err };
    }
  }

  /**
   * Get checkout session details - JWT token automatically attached by interceptor
   */
  getCheckoutSession(sessionId: string): Observable<StripeSessionDetails> {
    return this.http.get<StripeSessionDetails>(
      `${this.apiUrl}/session/${sessionId}`
    );
  }

  /**
   * Handle generic Stripe errors
   */
  handleStripeError(error: any): string {
    if (error && error.message) {
      return error.message;
    }
    
    switch (error?.type) {
      case 'card_error':
        return error.message;
      case 'validation_error':
        return error.message;
      case 'authentication_required':
        return 'Authentication required. Please try again.';
      case 'api_connection_error':
        return 'Network error. Please check your connection.';
      case 'api_error':
        return 'Payment processing error. Please try again.';
      case 'rate_limit_error':
        return 'Too many requests. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stripeLoaded.next(false);
    this.isProcessing.next(false);
    this.stripe = null;
  }
}

// Extend Window interface to include Stripe
declare global {
  interface Window {
    Stripe: any;
  }
}