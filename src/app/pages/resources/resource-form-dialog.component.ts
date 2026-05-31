import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzModalRef, NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { DataService } from '../../services/data.service';
import { Employee } from '../../models';

@Component({
  selector: 'app-resource-form-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    NzFormModule, NzInputModule, NzSelectModule,
    NzButtonModule, NzIconModule, NzDividerModule,
    NzGridModule, NzTagModule,
  ],
  template: `
    <form nz-form [formGroup]="form" nzLayout="vertical">

      <div nz-row [nzGutter]="16">
        <div nz-col [nzSpan]="24">
          <nz-form-item>
            <nz-form-label nzRequired>Nama Lengkap</nz-form-label>
            <nz-form-control nzErrorTip="Nama wajib diisi">
              <input nz-input formControlName="name" placeholder="Masukkan nama lengkap">
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>

      <div nz-row [nzGutter]="16">
        <div nz-col [nzSpan]="12">
          <nz-form-item>
            <nz-form-label>NIK</nz-form-label>
            <nz-form-control>
              <input nz-input formControlName="nik" placeholder="Nomor identitas">
            </nz-form-control>
          </nz-form-item>
        </div>
        <div nz-col [nzSpan]="12">
          <nz-form-item>
            <nz-form-label nzRequired>Status</nz-form-label>
            <nz-form-control nzErrorTip="Status wajib dipilih">
              <nz-select formControlName="status" style="width:100%">
                <nz-option nzValue="organik" nzLabel="Organik"></nz-option>
                <nz-option nzValue="kontrak" nzLabel="Kontrak"></nz-option>
              </nz-select>
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>

      <div nz-row [nzGutter]="16">
        <div nz-col [nzSpan]="24">
          <nz-form-item>
            <nz-form-label nzRequired>Role</nz-form-label>
            <nz-form-control nzErrorTip="Role wajib dipilih">
              <nz-select formControlName="roleId" style="width:100%" nzPlaceHolder="Pilih role">
                @for (r of roles(); track r.id) {
                  <nz-option [nzValue]="r.id" [nzLabel]="r.name">
                    <span class="role-opt" [style.background]="r.bgColor" [style.color]="r.color">
                      {{ r.name }}
                    </span>
                  </nz-option>
                }
              </nz-select>
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>

      <div nz-row [nzGutter]="16">
        <div nz-col [nzSpan]="12">
          <nz-form-item>
            <nz-form-label nzRequired>Tim</nz-form-label>
            <nz-form-control nzErrorTip="Tim wajib dipilih">
              <nz-select formControlName="teamId" style="width:100%"
                         nzPlaceHolder="Pilih tim" (ngModelChange)="onTeamChange()">
                @for (t of teams(); track t.id) {
                  <nz-option [nzValue]="t.id" [nzLabel]="t.name"></nz-option>
                }
              </nz-select>
            </nz-form-control>
          </nz-form-item>
        </div>
        <div nz-col [nzSpan]="12">
          <nz-form-item>
            <nz-form-label>Atasan</nz-form-label>
            <nz-form-control>
              <nz-select formControlName="parentId" style="width:100%"
                         nzPlaceHolder="— Tidak ada —" nzAllowClear>
                @for (e of otherEmployees(); track e.id) {
                  <nz-option [nzValue]="e.id" [nzLabel]="e.name"></nz-option>
                }
              </nz-select>
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>

      <div nz-row [nzGutter]="16">
        <div nz-col [nzSpan]="24">
          <nz-form-item>
            <nz-form-label>Proyek / Aplikasi</nz-form-label>
            <nz-form-control>
              <nz-select formControlName="projectIds" style="width:100%"
                         nzMode="multiple" nzPlaceHolder="Pilih proyek (opsional)">
                @for (p of availableProjects(); track p.id) {
                  <nz-option [nzValue]="p.id" [nzLabel]="p.name"></nz-option>
                }
                @if (!availableProjects().length) {
                  <nz-option nzDisabled nzLabel="Belum ada proyek untuk tim ini" nzValue="__none__"></nz-option>
                }
              </nz-select>
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>

      <div nz-row [nzGutter]="16">
        <div nz-col [nzSpan]="12">
          <nz-form-item>
            <nz-form-label>Email</nz-form-label>
            <nz-form-control>
              <input nz-input formControlName="email" type="email" placeholder="email@domain.com">
            </nz-form-control>
          </nz-form-item>
        </div>
        <div nz-col [nzSpan]="12">
          <nz-form-item>
            <nz-form-label>Telepon</nz-form-label>
            <nz-form-control>
              <input nz-input formControlName="phone" placeholder="08xxxxxxxxxx">
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>

    </form>

    <div class="modal-footer">
      <button nz-button (click)="modalRef.close(null)">Batal</button>
      <button nz-button nzType="primary" [disabled]="form.invalid" (click)="submit()">
        <span nz-icon nzType="save"></span>
        {{ editing ? 'Simpan Perubahan' : 'Tambahkan' }}
      </button>
    </div>
  `,
  styles: [`
    .role-opt { padding: 2px 9px; border-radius: 10px; font-size: 12px; font-weight: 600; }
    .modal-footer {
      display: flex; justify-content: flex-end; gap: 8px;
      margin-top: 4px; padding-top: 16px; border-top: 1px solid #ede9fe;
    }
  `]
})
export class ResourceFormDialogComponent implements OnInit {
  private fb   = inject(FormBuilder);
  private ds   = inject(DataService);
  readonly modalRef = inject(NzModalRef);
  readonly data: Employee | null = inject(NZ_MODAL_DATA);

  editing   = false;
  roles     = this.ds.roles;
  teams     = this.ds.teams;
  employees = this.ds.employees;

  form = this.fb.group({
    name:       ['', Validators.required],
    nik:        [''],
    status:     ['organik', Validators.required],
    roleId:     ['', Validators.required],
    teamId:     ['', Validators.required],
    parentId:   [null as string | null],
    projectIds: [[] as string[]],
    email:      [''],
    phone:      [''],
  });

  ngOnInit() {
    if (this.data) {
      this.editing = true;
      this.form.patchValue(this.data as any);
    } else if (this.teams().length) {
      this.form.patchValue({ teamId: this.teams()[0].id });
    }
    if (this.roles().length) {
      this.form.patchValue({ roleId: this.roles()[this.roles().length - 1].id });
    }
  }

  otherEmployees() { return this.employees().filter(e => e.id !== this.data?.id); }
  availableProjects() {
    const teamId = this.form.get('teamId')?.value;
    return teamId ? this.ds.getProjects(teamId) : [];
  }
  onTeamChange() { this.form.patchValue({ projectIds: [] }); }

  submit() {
    if (this.form.invalid) return;
    const v = this.form.value;
    const emp: Employee = {
      id:         this.data?.id ?? crypto.randomUUID(),
      name:       v.name!,
      nik:        v.nik || undefined,
      roleId:     v.roleId!,
      status:     v.status as any,
      teamId:     v.teamId!,
      parentId:   v.parentId ?? null,
      projectIds: v.projectIds ?? [],
      email:      v.email || undefined,
      phone:      v.phone || undefined,
    };
    this.modalRef.close(emp);
  }
}
