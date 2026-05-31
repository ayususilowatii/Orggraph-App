import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { DataService } from '../../services/data.service';
import { Role } from '../../models';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    NzCardModule, NzButtonModule, NzIconModule,
    NzFormModule, NzInputModule, NzInputNumberModule,
    NzTableModule, NzDividerModule, NzTagModule,
    NzToolTipModule, NzGridModule, NzAlertModule,
  ],
  template: `
    <div class="page-wrap">
      <div class="page-header">
        <div>
          <h1 class="page-title">Pengaturan</h1>
          <p class="page-sub">Konfigurasi departemen, role, dan preferensi tampilan</p>
        </div>
      </div>

      <!-- Dept Name -->
      <nz-card class="settings-card">
        <ng-template #deptTitle>
          <span nz-icon nzType="bank" style="color:#7c3aed;margin-right:8px"></span>
          Nama Departemen / Chart
        </ng-template>
        <nz-card [nzTitle]="deptTitle" style="box-shadow:none;border:none">
          <p class="section-desc">Nama ini akan tampil sebagai judul pada bagan organisasi yang digenerate.</p>
          <div style="display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap">
            <input nz-input [(ngModel)]="deptNameInput" placeholder="Contoh: RCD, IT Division..."
                   style="flex:1;max-width:360px">
            <button nz-button nzType="primary" (click)="saveDeptName()">
              <span nz-icon nzType="save"></span>Simpan
            </button>
          </div>
          <p style="margin-top:10px;font-size:13px;color:#6b7280">
            Preview: <strong style="color:#7c3aed">{{ deptNameInput || deptName() }} ORGANIZATION CHART</strong>
          </p>
        </nz-card>
      </nz-card>

      <!-- Role Management -->
      <nz-card class="settings-card">
        <ng-template #roleTitle>
          <span nz-icon nzType="tag" style="color:#7c3aed;margin-right:8px"></span>
          Manajemen Role
        </ng-template>
        <nz-card [nzTitle]="roleTitle" style="box-shadow:none;border:none">
          <p class="section-desc">
            Warna background dan teks akan ditampilkan pada bagan dan tabel resource. Level menentukan urutan tampil (1 = tertinggi).
          </p>

          <!-- Role Form -->
          <div class="role-form-box">
            <form nz-form [formGroup]="roleForm" nzLayout="inline">
              <nz-form-item style="flex:1;min-width:150px">
                <nz-form-label nzRequired>Nama Role</nz-form-label>
                <nz-form-control>
                  <input nz-input formControlName="name" placeholder="Developer, QA, BA...">
                </nz-form-control>
              </nz-form-item>

              <nz-form-item style="width:90px">
                <nz-form-label nzRequired>Level</nz-form-label>
                <nz-form-control>
                  <nz-input-number formControlName="level" [nzMin]="1" [nzStep]="1" style="width:100%"></nz-input-number>
                </nz-form-control>
              </nz-form-item>

              <nz-form-item>
                <nz-form-label>Background</nz-form-label>
                <nz-form-control>
                  <div class="color-field">
                    <input type="color" formControlName="bgColor" class="color-inp">
                    <code class="hex-val">{{ roleForm.get('bgColor')?.value }}</code>
                  </div>
                </nz-form-control>
              </nz-form-item>

              <nz-form-item>
                <nz-form-label>Teks</nz-form-label>
                <nz-form-control>
                  <div class="color-field">
                    <input type="color" formControlName="color" class="color-inp">
                    <code class="hex-val">{{ roleForm.get('color')?.value }}</code>
                  </div>
                </nz-form-control>
              </nz-form-item>

              <nz-form-item>
                <nz-form-label>Preview</nz-form-label>
                <nz-form-control>
                  <span class="preview-badge"
                        [style.background]="roleForm.get('bgColor')?.value"
                        [style.color]="roleForm.get('color')?.value">
                    {{ roleForm.get('name')?.value || 'Role Name' }}
                  </span>
                </nz-form-control>
              </nz-form-item>

              <nz-form-item style="align-self:flex-end;margin-bottom:0">
                <button nz-button nzType="primary" [disabled]="roleForm.invalid" (click)="saveRole()" style="margin-top:8px">
                  <span nz-icon [nzType]="editingRole ? 'save' : 'plus'"></span>
                  {{ editingRole ? 'Simpan' : 'Tambah Role' }}
                </button>
                @if (editingRole) {
                  <button nz-button (click)="cancelEdit()" style="margin-left:6px;margin-top:8px">Batal</button>
                }
              </nz-form-item>
            </form>
          </div>

          <!-- Role Table -->
          <nz-table [nzData]="roles()" nzSize="small" [nzShowPagination]="false" style="margin-top:16px">
            <thead>
              <tr>
                <th>Badge</th>
                <th>Nama</th>
                <th>Level</th>
                <th>Warna</th>
                <th>Resource</th>
                <th style="width:80px"></th>
              </tr>
            </thead>
            <tbody>
              @for (r of roles(); track r.id) {
                <tr>
                  <td>
                    <span class="role-badge" [style.background]="r.bgColor" [style.color]="r.color">
                      {{ r.name }}
                    </span>
                  </td>
                  <td><strong>{{ r.name }}</strong></td>
                  <td>
                    <nz-tag nzColor="purple">{{ r.level }}</nz-tag>
                  </td>
                  <td>
                    <div class="swatch-row">
                      <span class="swatch" [style.background]="r.bgColor" nz-tooltip [nzTooltipTitle]="'BG: ' + r.bgColor"></span>
                      <code class="hex-sm">{{ r.bgColor }}</code>
                      <span class="swatch" [style.background]="r.color" nz-tooltip [nzTooltipTitle]="'Text: ' + r.color"></span>
                      <code class="hex-sm">{{ r.color }}</code>
                    </div>
                  </td>
                  <td>
                    <nz-tag nzColor="green">{{ empCount(r.id) }}</nz-tag>
                  </td>
                  <td>
                    <button nz-button nzType="text" nzSize="small" nz-tooltip nzTooltipTitle="Edit" (click)="editRole(r)">
                      <span nz-icon nzType="edit"></span>
                    </button>
                    <button nz-button nzType="text" nzSize="small"
                            [nz-tooltip]="empCount(r.id) > 0 ? 'Masih digunakan' : 'Hapus'"
                            [disabled]="empCount(r.id) > 0" (click)="deleteRole(r)" class="del-btn">
                      <span nz-icon nzType="delete"></span>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </nz-table>
        </nz-card>
      </nz-card>

      <!-- Backup & Restore -->
      <nz-card class="settings-card">
        <ng-template #backupTitle>
          <span nz-icon nzType="cloud-sync" style="color:#7c3aed;margin-right:8px"></span>
          Backup &amp; Restore
        </ng-template>
        <nz-card [nzTitle]="backupTitle" style="box-shadow:none;border:none">
          <div nz-row [nzGutter]="32">
            <div nz-col [nzSpan]="12">
              <div class="backup-panel">
                <div class="bp-icon" style="background:#faf5ff">
                  <span nz-icon nzType="download" style="color:#7c3aed;font-size:22px"></span>
                </div>
                <div>
                  <div class="bp-title">Export Data</div>
                  <p class="bp-desc">Download semua data (resource, tim, proyek, role) sebagai file JSON untuk backup.</p>
                  <button nz-button nzType="primary" (click)="exportData()">
                    <span nz-icon nzType="download"></span>Download Backup
                  </button>
                </div>
              </div>
            </div>
            <div nz-col [nzSpan]="12">
              <div class="backup-panel">
                <div class="bp-icon" style="background:#f0fdf4">
                  <span nz-icon nzType="upload" style="color:#16a34a;font-size:22px"></span>
                </div>
                <div>
                  <div class="bp-title">Import Data</div>
                  <p class="bp-desc">Restore data dari file backup JSON. Data saat ini akan digantikan seluruhnya.</p>
                  <input #fileInput type="file" accept=".json" style="display:none" (change)="importData($event)">
                  <button nz-button (click)="fileInput.click()">
                    <span nz-icon nzType="upload"></span>Pilih File JSON
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nz-card>
      </nz-card>

      <!-- Danger Zone -->
      <nz-card class="settings-card danger-card">
        <ng-template #dangerTitle>
          <span nz-icon nzType="warning" style="color:#dc2626;margin-right:8px"></span>
          <span style="color:#dc2626">Zona Berbahaya</span>
        </ng-template>
        <nz-card [nzTitle]="dangerTitle" style="box-shadow:none;border:none">
          <p class="section-desc">Reset semua data (resource, tim, proyek, role) ke kondisi demo awal. Aksi ini tidak dapat dibatalkan.</p>
          <button nz-button nzDanger nzType="primary" (click)="reset()">
            <span nz-icon nzType="rollback"></span>Reset ke Data Default
          </button>
        </nz-card>
      </nz-card>

    </div>
  `,
  styles: [`
    .settings-card { margin-bottom: 18px; }

    .section-desc { font-size: 13px; color: #6b7280; margin: 0 0 14px; line-height: 1.6; }

    .role-form-box {
      background: #faf5ff; border: 1px solid #ede9fe;
      border-radius: 12px; padding: 16px 18px; margin-bottom: 4px;
    }
    .role-form-box nz-form-item { margin-bottom: 0 !important; }

    .color-field { display: flex; flex-direction: column; align-items: center; gap: 3px; }
    .color-inp { width: 46px; height: 36px; border: 1px solid #ede9fe; border-radius: 8px; padding: 2px; cursor: pointer; }
    .hex-val { font-size: 9px; color: #9ca3af; }

    .preview-badge { padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; white-space: nowrap; }

    .role-badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; white-space: nowrap; }
    .swatch-row { display: flex; align-items: center; gap: 5px; }
    .swatch { width: 16px; height: 16px; border-radius: 4px; border: 1px solid #e5e7eb; display: inline-block; }
    .hex-sm { font-size: 10px; font-family: monospace; color: #9ca3af; }
    .del-btn:not([disabled]):hover { color: #dc2626 !important; }

    .backup-panel { display: flex; gap: 14px; align-items: flex-start; }
    .bp-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .bp-title { font-size: 14px; font-weight: 700; color: #1e1b4b; margin-bottom: 6px; }
    .bp-desc  { font-size: 12.5px; color: #6b7280; line-height: 1.6; margin: 0 0 12px; }

    .danger-card { border-color: #fee2e2 !important; }
    .danger-card .ant-card { border-color: transparent !important; }
  `]
})
export class SettingsComponent {
  private ds    = inject(DataService);
  private fb    = inject(FormBuilder);
  private modal = inject(NzModalService);
  private msg   = inject(NzMessageService);

  roles     = this.ds.roles;
  employees = this.ds.employees;
  deptName  = this.ds.deptName;
  deptNameInput = this.ds.deptName();

  editingRole: Role | null = null;

  roleForm = this.fb.group({
    name:    ['', Validators.required],
    bgColor: ['#1e40af'],
    color:   ['#ffffff'],
    level:   [3, [Validators.required, Validators.min(1)]],
  });

  saveDeptName() {
    this.ds.setDeptName(this.deptNameInput.trim() || 'DEPARTMENT');
    this.msg.success('Nama departemen disimpan');
  }

  empCount(roleId: string) { return this.employees().filter(e => e.roleId === roleId).length; }

  editRole(r: Role)  { this.editingRole = r; this.roleForm.patchValue(r); }
  cancelEdit()       { this.editingRole = null; this.roleForm.reset({ bgColor: '#1e40af', color: '#ffffff', level: 3 }); }

  saveRole() {
    const v = this.roleForm.value;
    const role: Role = {
      id:      this.editingRole?.id ?? crypto.randomUUID(),
      name:    v.name!,
      bgColor: v.bgColor!,
      color:   v.color!,
      level:   Number(v.level),
    };
    if (this.editingRole) {
      this.ds.updateRole(role);
      this.msg.success('Role diperbarui');
      this.cancelEdit();
    } else {
      this.ds.addRole(role);
      this.msg.success('Role ditambahkan');
      this.roleForm.reset({ bgColor: '#1e40af', color: '#ffffff', level: 3 });
    }
  }

  deleteRole(r: Role) {
    if (this.empCount(r.id) > 0) return;
    this.modal.confirm({
      nzTitle: 'Hapus Role',
      nzContent: `Yakin ingin menghapus role "<b>${r.name}</b>"?`,
      nzOkText: 'Ya, Hapus', nzOkDanger: true, nzOkType: 'primary', nzCancelText: 'Batal',
      nzOnOk: () => { this.ds.deleteRole(r.id); this.msg.success('Role dihapus'); }
    });
  }

  exportData() {
    const blob = new Blob([this.ds.exportData()], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `orggraph-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.msg.success('Backup berhasil didownload');
  }

  importData(event: Event) {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = this.ds.importData(reader.result as string);
      if (result.ok) {
        this.deptNameInput = this.ds.deptName();
        this.msg.success('Data berhasil diimport');
      } else {
        this.msg.error(result.error ?? 'Gagal import');
      }
      input.value = '';
    };
    reader.readAsText(file);
  }

  reset() {
    this.modal.confirm({
      nzTitle: 'Reset ke Data Default',
      nzContent: 'Semua data resource, tim, proyek, dan role akan direset ke kondisi demo awal. Aksi ini tidak dapat dibatalkan.',
      nzOkText: 'Ya, Reset Sekarang', nzOkDanger: true, nzOkType: 'primary', nzCancelText: 'Batal',
      nzOnOk: () => {
        this.ds.resetToDefault();
        this.deptNameInput = this.ds.deptName();
        this.msg.success('Data direset ke default');
      }
    });
  }
}

