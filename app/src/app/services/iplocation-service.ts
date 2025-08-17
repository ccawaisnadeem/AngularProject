import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IpLocationService {
  constructor(private http: HttpClient) {}

  getLocationByIp(): Observable<any> {
    return this.http.get('https://ipapi.co/json/'); 
    // or use 'https://ipinfo.io/json?token=YOUR_TOKEN'
  }
}
