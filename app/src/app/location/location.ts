import { Component, OnInit } from '@angular/core';
import { LocationService } from '../services/location-service';

@Component({
  selector: 'app-location',
  templateUrl: './location.html',
  styleUrls: ['./location.scss']
})
export class LocationComponent implements OnInit {
  location: string = "Fetching location...";

  constructor(private locationService: LocationService) {}

  ngOnInit(): void {
    this.locationService.getUserLocation().then(coords => {
      this.locationService.getAddress(coords.lat, coords.lon).subscribe(data => {
        this.location = `${data.address.city || data.address.town || data.address.village}, ${data.address.country}`;
      });
    }).catch(() => {
      this.location = "Location not available";
    });
  }
}
