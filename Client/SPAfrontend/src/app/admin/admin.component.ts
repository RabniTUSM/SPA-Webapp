import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { RoleService } from '../services/role.service';
import { RoleViewService, RoleView } from '../services/role-view.service';
import { VipRequestService, VipRequest } from '../services/vip-request.service';
import { UserOutputDTO, CreateAdminDTO } from '../models/user.model';
import { RoleOutputDTO, RoleInputDTO } from '../models/role.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-admin',
  standalone: true,
  templateUrl: './admin.component.html',
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  activeTab = 'roles';
  roles: RoleOutputDTO[] = [];
  users: UserOutputDTO[] = [];
  vipRequests: VipRequest[] = [];
  roleForm: FormGroup;
  adminForm: FormGroup;
  showRoleForm = false;
  editingRoleId: number | null = null;
  roleViewMap: Record<string, RoleView> = {};
  roleViewOptions: RoleView[] = ['customer', 'vip', 'employee', 'admin'];
  roleFormError = '';
  adminFormError = '';

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private roleView: RoleViewService,
    private vipRequestService: VipRequestService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.roleForm = this.fb.group({
      name: ['', Validators.required],
      hasAdminAccess: [false],
      description: [''],
      viewType: ['customer', Validators.required]
    });
    this.adminForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['']
    });
  }

  ngOnInit() {
    this.loadRoles();
    this.loadUsers();
    this.loadVipRequests();
    this.loadRoleViews();
  }

  loadRoles() {
    this.roleService.getAllRoles().subscribe(data => {
      this.roles = data;
      this.loadRoleViews();
    });
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe(data => {
      this.users = data;
    });
  }

  loadVipRequests() {
    this.vipRequests = this.vipRequestService.getPendingRequests();
  }

  loadRoleViews() {
    this.roleViewMap = this.roleView.getRoleViewMap();
  }

  toggleRoleForm() {
    this.showRoleForm = !this.showRoleForm;
    this.editingRoleId = null;
    this.roleForm.reset({
      name: '',
      hasAdminAccess: false,
      description: '',
      viewType: 'customer'
    });
  }

  saveRole() {
    this.roleFormError = '';
    if (this.roleForm.invalid) {
      this.roleFormError = 'Complete required role fields.';
      return;
    }
    const { name, hasAdminAccess, description, viewType } = this.roleForm.value;
    const roleData: RoleInputDTO = { name, hasAdminAccess, description };
    const request = this.editingRoleId
      ? this.roleService.updateRole(this.editingRoleId, roleData)
      : this.roleService.createRole(roleData);
    request.subscribe({
      next: () => {
        this.roleView.setRoleView(name, viewType);
        this.loadRoles();
        this.toggleRoleForm();
      },
      error: () => {
        this.roleFormError = 'Role save failed.';
      }
    });
  }

  editRole(role: RoleOutputDTO) {
    this.editingRoleId = role.id;
    const view = this.getViewForRole(role.name);
    this.roleForm.patchValue({
      name: role.name,
      hasAdminAccess: role.hasAdminAccess,
      description: role.description,
      viewType: view
    });
    this.showRoleForm = true;
  }

  updateRoleView(role: RoleOutputDTO, view: RoleView | string) {
    this.roleView.setRoleView(role.name, view as RoleView);
    this.loadRoleViews();
  }

  getViewForRole(roleName: string): RoleView {
    if (this.roleViewMap[roleName]) {
      return this.roleViewMap[roleName];
    }
    const match = Object.keys(this.roleViewMap).find(key => key.toLowerCase() === roleName.toLowerCase());
    return match ? this.roleViewMap[match] : 'customer';
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

  createAdmin() {
    this.adminFormError = '';
    if (this.adminForm.invalid) {
      this.adminFormError = 'Complete all admin fields.';
      return;
    }
    const payload: CreateAdminDTO = this.adminForm.value;
    this.userService.createAdmin(payload).subscribe({
      next: () => {
        this.adminForm.reset();
        this.loadUsers();
      },
      error: () => {
        this.adminFormError = 'Admin creation failed.';
      }
    });
  }

  approveVip(request: VipRequest) {
    this.vipRequestService.approveRequest(request.id);
    this.loadVipRequests();
  }

  rejectVip(request: VipRequest) {
    this.vipRequestService.rejectRequest(request.id);
    this.loadVipRequests();
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }
}
