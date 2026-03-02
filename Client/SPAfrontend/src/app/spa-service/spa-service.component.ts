import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SpaServiceService } from '../services/spa-service.service';
import { SpaServiceInputDTO, SpaServiceOutputDTO } from '../models/spa-service.model';

@Component({
  selector: 'app-spa-service',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './spa-service.component.html',
  styleUrls: ['./spa-service.component.scss']
})
export class SpaServiceComponent implements OnInit {
  services: SpaServiceOutputDTO[] = [];
  serviceForm: FormGroup;
  editingId: number | null = null;
  formError = '';

  constructor(private spaService: SpaServiceService, private fb: FormBuilder) {
    this.serviceForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      vipOnly: [false]
    });
  }

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices() {
    this.spaService.getAllServices().subscribe(data => this.services = data);
  }

  saveService() {
    this.formError = '';
    if (this.serviceForm.invalid) {
      this.formError = 'Complete all required service fields.';
      return;
    }
    const payload: SpaServiceInputDTO = this.serviceForm.value;
    const request = this.editingId
      ? this.spaService.updateService(this.editingId, payload)
      : this.spaService.createService(payload);
    request.subscribe({
      next: () => {
        this.serviceForm.reset({ price: 0, vipOnly: false });
        this.editingId = null;
        this.loadServices();
      },
      error: () => {
        this.formError = 'Service save failed.';
      }
    });
  }

  editService(service: SpaServiceOutputDTO) {
    this.editingId = service.id;
    this.serviceForm.patchValue({
      name: service.name,
      description: service.description,
      price: service.price,
      vipOnly: service.vipOnly
    });
  }

  cancelEdit() {
    this.editingId = null;
    this.serviceForm.reset({ price: 0, vipOnly: false });
  }

  deleteService(id: number) {
    if (!confirm('Delete this service?')) return;
    this.spaService.deleteService(id).subscribe(() => this.loadServices());
  }

  exportPdfServices() {
    this.spaService.downloadPriceChart().subscribe({
      next: data => {
        const url = window.URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'price-chart.pdf';
        link.click();
      },
      error: () => {
        this.formError = 'Price chart PDF is not uploaded yet.';
      }
    });
  }
}
