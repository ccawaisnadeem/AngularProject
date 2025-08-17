
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor(private http: HttpClient) {}

  getUserLocation(): Promise<{ lat: number, lon: number }> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lon: position.coords.longitude,
              
            });
            console.log("Latitude:", position.coords.latitude);
            console.log("Longitude:", position.coords.longitude);

          },
          (error) => {
            reject(error);
          },
          {
                enableHighAccuracy: true, // 🔥 This is key for better precision
                timeout: 10000,           // Optional: wait up to 10 seconds
                 maximumAge: 0            // Optional: don't use cached location
         }
        );
        
      } else {
        reject("Geolocation not supported");
      }
    });
  }

  // Reverse geocoding with OpenStreetMap API
  getAddress(lat: number, lon: number): Observable<any> {
    console.log(`Fetching address for coordinates: ${lat}, ${lon}`);
    return this.http.get(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&zoom=14`

    );
    
  }
}

