import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { UserOutputDTO, UserInputDTO } from '../models/user.model';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  imports: [
    ReactiveFormsModule
  ],
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  users: UserOutputDTO[] = [];
  userForm: FormGroup;
  editingId: number | null = null;

  constructor(private userService: UserService, private fb: FormBuilder) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['']
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe(data => this.users = data);
  }

  saveUser() {
    if (this.userForm.invalid) return;
    const payload: UserInputDTO = this.userForm.value;
    if (this.editingId) {
      this.userService.updateUser(payload.username, payload).subscribe(() => {
        this.loadUsers();
        this.cancelEdit();
      });
    } else {
      this.userService.register(payload).subscribe(() => {
        this.loadUsers();
        this.userForm.reset();
      });
    }
  }

  editUser(user: UserOutputDTO) {
    this.editingId = user.id;
    this.userForm.patchValue({
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone
    });
  }

  cancelEdit() {
    this.editingId = null;
    this.userForm.reset();
  }

  deleteUser(id: number) {
    if (!confirm('Delete user?')) return;
    this.userService.deleteUser(id).subscribe(() => this.loadUsers());
  }
}

