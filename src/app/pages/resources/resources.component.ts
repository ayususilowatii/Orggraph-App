import { Component, inject, computed, signal, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { DataService } from '../../services/data.service';
import { Employee } from '../../models';
import { ResourceFormDialogComponent } from './resource-form-dialog.component';

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    NzTableModule, NzCardModule, NzButtonModule, NzIconModule,
    NzInputModule, NzSelectModule, NzTagModule, NzToolTipModule,
    NzDividerModule, NzSpaceModule,
  ],
  template: `
    <div class="page-wrap">

      <div class="page-header">
        <div>
          <h1 class="page-title">Data Resource</h1>
          <p class="page-sub">Kelola seluruh anggota tim departemen</p>
        </div>
        <button nz-button nzType="primary" (click)="openForm()">
          <span nz-icon nzType="user-add"></span>Tambah Resource
        </button>
      </div>

      <nz-card [nzBodyStyle]="{'padding': '0'}">

        <!-- Toolbar -->
        <div class="toolbar">
          <nz-input-group [nzPrefix]="searchIcon" style="max-width:260px">
            <input nz-input
                   [(ngModel)]="searchQ"
                   (ngModelChange)="onSearch($event)"
                   placeholder="Cari nama / NIK…">
          </nz-input-group>
          <ng-template #searchIcon><span nz-icon nzType="search"></span></ng-template>

          <nz-select [(ngModel)]="filterTeam" (ngModelChange)="applyFilters()"
                     nzPlaceHolder="Semua Tim" nzAllowClear style="width:160px">
            @for (t of teams(); track t.id) {
              <nz-option [nzValue]="t.id" [nzLabel]="t.name"></nz-option>
            }
          </nz-select>

          <nz-select [(ngModel)]="filterStatus" (ngModelChange)="applyFilters()"
                     nzPlaceHolder="Semua Status" nzAllowClear style="width:160px">
            <nz-option nzValue="organik" nzLabel="Organik"></nz-option>
            <nz-option nzValue="kontrak" nzLabel="Kontrak"></nz-option>
          </nz-select>

          <nz-select [(ngModel)]="filterRole" (ngModelChange)="applyFilters()"
                     nzPlaceHolder="Semua Role" nzAllowClear style="width:160px">
            @for (r of roles(); track r.id) {
              <nz-option [nzValue]="r.id" [nzLabel]="r.name"></nz-option>
            }
          </nz-select>

          <span class="count-lbl">{{ filtered().length }} resource</span>
        </div>

        <nz-divider style="margin:0"></nz-divider>

        <!-- Table -->
        <nz-table
          #tbl
          [nzData]="filtered()"
          [nzPageSize]="10"
          [nzPageSizeOptions]="[10, 25, 50]"
          nzShowSizeChanger
          nzSize="middle"
          [nzScroll]="{ x: '900px' }">
          <thead>
            <tr>
              <th nzColumnKey="name" [nzSortFn]="sortName">Nama</th>
              <th nzColumnKey="role" [nzSortFn]="sortRole">Role</th>
              <th nzColumnKey="status" [nzSortFn]="sortStatus">Status</th>
              <th nzColumnKey="team" [nzSortFn]="sortTeam">Tim</th>
              <th>Proyek</th>
              <th>Atasan</th>
              <th nzWidth="80px"></th>
            </tr>
          </thead>
          <tbody>
            @for (emp of tbl.data; track emp.id) {
              <tr>
                <td>
                  <div class="name-cell">
                    <div class="avatar" [style.background]="getRoleBg(emp.roleId)">
                      {{ initials(emp.name) }}
                    </div>
                    <div>
                      <div class="emp-name">{{ emp.name }}</div>
                      <div class="emp-nik">{{ emp.nik || '—' }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <nz-tag [nzColor]="getRoleBg(emp.roleId)"
                          [style.color]="getRoleColor(emp.roleId)"
                          [style.border-color]="getRoleBg(emp.roleId)">
                    {{ getRoleName(emp.roleId) }}
                  </nz-tag>
                </td>
                <td>
                  <span [class]="'badge-' + emp.status">{{ emp.status | titlecase }}</span>
                </td>
                <td>
                  <span class="team-tag">{{ getTeamName(emp.teamId) }}</span>
                </td>
                <td>
                  <div class="proj-chips">
                    @for (pid of emp.projectIds; track pid) {
                      <nz-tag nzColor="purple">{{ getProjectName(pid) }}</nz-tag>
                    }
                    @if (!emp.projectIds.length) { <span class="none-txt">—</span> }
                  </div>
                </td>
                <td><span class="atasan-txt">{{ getEmpName(emp.parentId) }}</span></td>
                <td>
                  <button nz-button nzType="text" nz-tooltip nzTooltipTitle="Edit" (click)="openForm(emp)" class="act-btn">
                    <span nz-icon nzType="edit"></span>
                  </button>
                  <button nz-button nzType="text" nz-tooltip nzTooltipTitle="Hapus" (click)="deleteEmp(emp)" class="act-btn warn">
                    <span nz-icon nzType="delete"></span>
                  </button>
                </td>
              </tr>
            }
            @if (!filtered().length) {
              <tr>
                <td [attr.colspan]="7" class="empty-row">
                  <span nz-icon nzType="search" style="font-size:32px;color:#ddd6fe"></span>
                  <p style="margin:8px 0 0;color:#9ca3af">Tidak ada data resource yang sesuai</p>
                </td>
              </tr>
            }
          </tbody>
        </nz-table>

      </nz-card>
    </div>
  `,
  styles: [`
    .toolbar {
      display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
      padding: 14px 18px 12px;
    }
    .count-lbl { margin-left: auto; font-size: 13px; color: #6b7280; font-weight: 500; white-space: nowrap; }

    .name-cell { display: flex; align-items: center; gap: 10px; }
    .avatar {
      width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-weight: 700; font-size: 12px;
      box-shadow: 0 2px 6px rgba(0,0,0,.14);
    }
    .emp-name { font-weight: 600; font-size: 13px; color: #1e1b4b; }
    .emp-nik  { font-size: 11px; color: #9ca3af; }

    .team-tag {
      padding: 2px 9px; border-radius: 20px; font-size: 11px; font-weight: 600;
      color: #374151; background: #f3f4f6; border: 1px solid #e5e7eb;
    }
    .proj-chips { display: flex; gap: 4px; flex-wrap: wrap; }
    .none-txt { color: #d1d5db; font-size: 12px; }
    .atasan-txt { font-size: 12.5px; color: #6b7280; }

    .act-btn { color: #9ca3af !important; }
    .act-btn:hover { color: #7c3aed !important; }
    .act-btn.warn:hover { color: #dc2626 !important; }

    .empty-row { text-align: center; padding: 48px 0 !important; }
  `]
})
export class ResourcesComponent {
  private ds      = inject(DataService);
  private modal   = inject(NzModalService);
  private message = inject(NzMessageService);

  employees = this.ds.employees;
  roles     = this.ds.roles;
  teams     = this.ds.teams;

  searchQ      = '';
  filterTeam   = '';
  filterStatus = '';
  filterRole   = '';

  private _filtered = signal<Employee[]>([]);

  filtered = computed(() => {
    let list = this.employees();
    const q = this.searchQ.toLowerCase();
    if (q)                list = list.filter(e => e.name.toLowerCase().includes(q) || (e.nik ?? '').toLowerCase().includes(q));
    if (this.filterTeam)   list = list.filter(e => e.teamId   === this.filterTeam);
    if (this.filterStatus) list = list.filter(e => e.status   === this.filterStatus);
    if (this.filterRole)   list = list.filter(e => e.roleId   === this.filterRole);
    return list;
  });

  onSearch(_q: string)  { /* computed reacts to searchQ changes */ }
  applyFilters()        { /* computed reacts to filter changes */ }

  /* Sort functions */
  sortName   = (a: Employee, b: Employee) => a.name.localeCompare(b.name);
  sortRole   = (a: Employee, b: Employee) => this.getRoleName(a.roleId).localeCompare(this.getRoleName(b.roleId));
  sortStatus = (a: Employee, b: Employee) => a.status.localeCompare(b.status);
  sortTeam   = (a: Employee, b: Employee) => this.getTeamName(a.teamId).localeCompare(this.getTeamName(b.teamId));

  getRoleName(id: string)   { return this.ds.getRole(id)?.name    ?? '-'; }
  getRoleBg(id: string)     { return this.ds.getRole(id)?.bgColor ?? '#64748b'; }
  getRoleColor(id: string)  { return this.ds.getRole(id)?.color   ?? '#fff'; }
  getTeamName(id: string)   { return this.ds.getTeam(id)?.name    ?? '-'; }
  getProjectName(id: string){ return this.ds.projects().find(p => p.id === id)?.name ?? id; }
  getEmpName(id: string | null) { return id ? (this.employees().find(e => e.id === id)?.name ?? '—') : '—'; }
  initials(name: string)    { return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase(); }

  openForm(emp?: Employee) {
    const modal = this.modal.create<ResourceFormDialogComponent, Employee | null>({
      nzTitle: emp ? 'Edit Resource' : 'Tambah Resource',
      nzContent: ResourceFormDialogComponent,
      nzData: emp ?? null,
      nzWidth: 580,
      nzFooter: null,
    });
    modal.afterClose.subscribe((result: Employee) => {
      if (!result) return;
      if (emp) { this.ds.updateEmployee(result); this.message.success('Resource diperbarui'); }
      else     { this.ds.addEmployee(result);    this.message.success('Resource ditambahkan'); }
    });
  }

  deleteEmp(emp: Employee) {
    this.modal.confirm({
      nzTitle: `Hapus Resource`,
      nzContent: `Yakin ingin menghapus <b>${emp.name}</b>? Data tidak dapat dikembalikan.`,
      nzOkText: 'Ya, Hapus',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: 'Batal',
      nzOnOk: () => {
        this.ds.deleteEmployee(emp.id);
        this.message.success('Resource dihapus');
      }
    });
  }
}
