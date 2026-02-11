import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { RoleService } from '../services/role.service';
import { UserOutputDTO } from '../models/user.model';
import { RoleOutputDTO, RoleInputDTO } from '../models/role.model';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  imports: [
    ReactiveFormsModule
  ],
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  activeTab = 'roles';
  roles: RoleOutputDTO[] = [];
  users: UserOutputDTO[] = [];
  roleForm: FormGroup;
  showRoleForm = false;
  editingRoleId: number | null = null;

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private fb: FormBuilder
  ) {
    this.roleForm = this.fb.group({
      name: ['', Validators.required],
      hasAdminAccess: [false],
      description: ['']
    });
  }

  ngOnInit() {
    this.loadRoles();
    this.loadUsers();
  }

  loadRoles() {
    this.roleService.getAllRoles().subscribe(data => {
      this.roles = data;
    });
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe(data => {
      this.users = data;
    });
  }

  toggleRoleForm() {
    this.showRoleForm = !this.showRoleForm;
    this.editingRoleId = null;
    this.roleForm.reset();
  }

  saveRole() {
    if (this.roleForm.invalid) return;
    const roleData = this.roleForm.value;
    if (this.editingRoleId) {
      this.roleService.updateRole(this.editingRoleId, roleData).subscribe(() => {
        this.loadRoles();
        this.toggleRoleForm();
      });
    } else {
      this.roleService.createRole(roleData).subscribe(() => {
        this.loadRoles();
        this.toggleRoleForm();
      });
    }
  }

  editRole(role: RoleOutputDTO) {
    this.editingRoleId = role.id;
    this.roleForm.patchValue(role);
    this.showRoleForm = true;
  }

  deleteRole(id: number) {
    if (confirm('Are you sure?')) {
      this.roleService.deleteRole(id).subscribe(() => {
        this.loadRoles();
      });
    }
  }

  deleteUser(id: number) {
    if (confirm('Are you sure?')) {
      this.userService.deleteUser(id).subscribe(() => {
        this.loadUsers();
      });
    }
  }
}

