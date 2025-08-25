import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

// Interfaces
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
  imageUrl?: string;
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

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret: string;
}

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  //private readonly apiUrl = `${environment.apiUrl}/StripeCheckout`;
  private readonly apiUrl = `${environment.apiUrl.replace('/api', '')}/StripeCheckout`;
  
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
      // Use environment variable for the publishable key
      const publishableKey = environment.stripePublishableKey;
      if (!publishableKey) {
        console.error('Stripe publishable key is missing');
        this.stripeLoaded.next(false);
        return;
      }
      
      // Log for debugging
      console.log('Initializing Stripe with key:', publishableKey.substring(0, 8) + '...');
      
      // Create Stripe instance with specific options
      this.stripe = window.Stripe(publishableKey, {
        apiVersion: '2023-10-16', // Use a specific API version
        locale: 'en', // Set locale
        betas: ['captcha_beta_1'] // Enable necessary betas for hCaptcha
      });
      
      console.log('Stripe initialized successfully');
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
   * Create checkout session
   */
  createCheckoutSession(data: CheckoutSessionRequest): Observable<CheckoutSessionResponse> {
    return this.http.post<CheckoutSessionResponse>(
      `${this.apiUrl}/create-checkout-session`, 
      data
      // Let JWT interceptor handle auth automatically
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
   * Get checkout session details
   */
  getCheckoutSession(sessionId: string): Observable<StripeSessionDetails> {
    return this.http.get<StripeSessionDetails>(
      `${this.apiUrl}/session/${sessionId}`
      // Let JWT interceptor handle auth automatically
    );
  }

  /**
   * Create Stripe Elements
   */
  createElement(type: string, options?: any): any {
    if (!this.isStripeReady()) {
      throw new Error('Stripe is not loaded yet');
    }

    const elements = this.stripe.elements();
    return elements.create(type, options);
  }

  /**
   * Create payment intent (for custom payment flows)
   */
  createPaymentIntent(amount: number, currency: string = 'usd'): Observable<PaymentIntent> {
    const data = { amount, currency };
    return this.http.post<PaymentIntent>(`${this.apiUrl}/create-payment-intent`, data);
  }

  /**
   * Confirm payment with payment method
   */
  async confirmPayment(clientSecret: string, paymentMethod: any): Promise<any> {
    if (!this.isStripeReady()) {
      throw new Error('Stripe is not loaded yet');
    }

    this.isProcessing.next(true);

    try {
      const result = await this.stripe.confirmPayment({
        payment_method: paymentMethod,
        client_secret: clientSecret,
        return_url: `${environment.frontendUrl}/checkout/success`
      });

      this.isProcessing.next(false);
      return result;
    } catch (error) {
      this.isProcessing.next(false);
      throw error;
    }
  }

  /**
   * Confirm card payment
   */
  async confirmCardPayment(clientSecret: string, cardElement: any, billingDetails?: any): Promise<any> {
    if (!this.isStripeReady()) {
      throw new Error('Stripe is not loaded yet');
    }

    this.isProcessing.next(true);

    try {
      const result = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: billingDetails
        }
      });

      this.isProcessing.next(false);
      return result;
    } catch (error) {
      this.isProcessing.next(false);
      throw error;
    }
  }

  /**
   * Handle generic Stripe errors
   */
  handleStripeError(error: any): string {
    switch (error.type) {
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
   * Format amount for Stripe (convert to cents)
   */
  formatAmountForStripe(amount: number): number {
    return Math.round(amount * 100);
  }

  /**
   * Format amount from Stripe (convert from cents)
   */
  formatAmountFromStripe(amount: number): number {
    return amount / 100;
  }

  /**
   * Validate card element
   */
  async validateCardElement(cardElement: any): Promise<{ valid: boolean; error?: string }> {
    if (!cardElement) {
      return { valid: false, error: 'Card element not found' };
    }

    // This would typically be handled by Stripe's real-time validation
    // You can add additional custom validation here if needed
    return { valid: true };
  }

  /**
   * Get payment method types available
   */
  getAvailablePaymentMethods(): string[] {
    return ['card']; // Add more payment methods as needed (apple_pay, google_pay, etc.)
  }

  /**
   * Check if Apple Pay is available
   */
  async isApplePayAvailable(): Promise<boolean> {
    if (!this.isStripeReady()) {
      return false;
    }

    try {
      const paymentRequest = this.stripe.paymentRequest({
        country: 'US',
        currency: 'usd',
        total: { label: 'Test', amount: 100 }
      });

      const result = await paymentRequest.canMakePayment();
      return result?.applePay === true;
    } catch {
      return false;
    }
  }

  /**
   * Check if Google Pay is available
   */
  async isGooglePayAvailable(): Promise<boolean> {
    if (!this.isStripeReady()) {
      return false;
    }

    try {
      const paymentRequest = this.stripe.paymentRequest({
        country: 'US',
        currency: 'usd',
        total: { label: 'Test', amount: 100 }
      });

      const result = await paymentRequest.canMakePayment();
      return result?.googlePay === true;
    } catch {
      return false;
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