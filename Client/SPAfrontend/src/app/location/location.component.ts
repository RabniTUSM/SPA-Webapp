import { Component, OnInit } from '@angular/core';
import { LocationService } from '../services/location.service';
import { LocationInputDTO, LocationOutputDTO } from '../models/location.model';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-location',
  standalone: true,
  templateUrl: './location.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  styleUrls: ['./location.component.scss']
})
export class LocationComponent implements OnInit {
  locations: LocationOutputDTO[] = [];
  locationForm: FormGroup;
  editingId: number | null = null;

  constructor(private locationService: LocationService, private fb: FormBuilder) {
    this.locationForm = this.fb.group({
      name: ['', Validators.required],
      address: [''],
      vipServiceAvailable: [false]
    });
  }

  ngOnInit(): void {
    this.loadLocations();
  }

  loadLocations() {
    this.locationService.getAllLocations().subscribe(data => this.locations = data);
  }

  saveLocation() {
    if (this.locationForm.invalid) return;
    const payload: LocationInputDTO = this.locationForm.value;
    if (this.editingId) {
      this.locationService.updateLocation(this.editingId, payload).subscribe(() => {
        this.loadLocations();
        this.cancelEdit();
      });
    } else {
      this.locationService.createLocation(payload).subscribe(() => {
        this.locationForm.reset();
        this.loadLocations();
      });
    }
  }

  editLocation(loc: LocationOutputDTO) {
    this.editingId = loc.id;
    this.locationForm.patchValue(loc);
  }

  cancelEdit() {
    this.editingId = null;
    this.locationForm.reset();
  }

  deleteLocation(id: number) {
    if (!confirm('Delete location?')) return;
    this.locationService.deleteLocation(id).subscribe(() => this.loadLocations());
  }
}
