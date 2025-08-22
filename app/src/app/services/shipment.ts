import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Shipment {
  id?: number;
  orderId: number;
  trackingNumber?: string;
  courierName?: string;
  shipmentDate?: string;
  deliveryDate?: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class ShipmentService {
  private apiUrl = `${environment.apiUrl}/Shipment`;

  constructor(private http: HttpClient) {}

  // Get shipment status for a specific order
  getShipmentByOrder(orderId: number): Observable<Shipment> {
    return this.http.get<Shipment>(`${this.apiUrl}/order/${orderId}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('Shipment API error:', error);
    return throwError(() => new Error('Something went wrong with shipments.'));
  }
}
