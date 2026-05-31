import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { DataService } from '../../services/data.service';
import { Team, Project } from '../../models';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    NzCardModule, NzButtonModule, NzIconModule,
    NzFormModule, NzInputModule, NzSelectModule,
    NzDividerModule, NzTagModule, NzToolTipModule,
    NzGridModule, NzEmptyModule,
  ],
  template: `
    <div class="page-wrap">
      <div class="page-header">
        <div>
          <h1 class="page-title">Tim &amp; Proyek</h1>
          <p class="page-sub">Kelola tim departemen dan proyek/aplikasi yang dikerjakan</p>
        </div>
      </div>

      <div nz-row [nzGutter]="20">

        <!-- TEAMS -->
        <div nz-col [nzSpan]="12">
          <nz-card>
            <ng-template #teamTitle>
              <span nz-icon nzType="project" style="color:#7c3aed;margin-right:8px"></span>
              Manajemen Tim
            </ng-template>
            <nz-card [nzTitle]="teamTitle" style="box-shadow:none;border:none">

              <form nz-form [formGroup]="teamForm" nzLayout="inline" class="add-form">
                <nz-form-item style="flex:1;min-width:160px;margin-bottom:0">
                  <nz-form-control>
                    <input nz-input formControlName="name" placeholder="Nama Tim baru...">
                  </nz-form-control>
                </nz-form-item>
                <nz-form-item style="margin-bottom:0">
                  <nz-form-control>
                    <div class="color-wrap">
                      <label class="color-lbl">Warna</label>
                      <input type="color" formControlName="color" class="color-inp">
                    </div>
                  </nz-form-control>
                </nz-form-item>
                <nz-form-item style="margin-bottom:0">
                  <button nz-button nzType="primary" [disabled]="teamForm.invalid" (click)="saveTeam()">
                    <span nz-icon [nzType]="editingTeam ? 'save' : 'plus'"></span>
                    {{ editingTeam ? 'Simpan' : 'Tambah' }}
                  </button>
                  @if (editingTeam) {
                    <button nz-button style="margin-left:6px" (click)="cancelTeamEdit()">Batal</button>
                  }
                </nz-form-item>
              </form>

              <nz-divider style="margin:14px 0"></nz-divider>

              <div class="item-list">
                @for (t of teams(); track t.id) {
                  <div class="item-row" [style.border-left-color]="t.color">
                    <span class="color-dot" [style.background]="t.color"></span>
                    <span class="item-name">{{ t.name }}</span>
                    <nz-tag [nzColor]="'purple'" class="count-tag">{{ projectCount(t.id) }} proyek</nz-tag>
                    <div class="item-acts">
                      <button nz-button nzType="text" nzSize="small" nz-tooltip nzTooltipTitle="Edit" (click)="editTeam(t)">
                        <span nz-icon nzType="edit"></span>
                      </button>
                      <button nz-button nzType="text" nzSize="small" nz-tooltip nzTooltipTitle="Hapus" (click)="deleteTeam(t)" class="del-btn">
                        <span nz-icon nzType="delete"></span>
                      </button>
                    </div>
                  </div>
                }
                @if (!teams().length) {
                  <nz-empty nzNotFoundContent="Belum ada tim" style="margin:16px 0"></nz-empty>
                }
              </div>
            </nz-card>
          </nz-card>
        </div>

        <!-- PROJECTS -->
        <div nz-col [nzSpan]="12">
          <nz-card>
            <ng-template #projTitle>
              <span nz-icon nzType="folder" style="color:#7c3aed;margin-right:8px"></span>
              Proyek / Aplikasi
            </ng-template>
            <nz-card [nzTitle]="projTitle" style="box-shadow:none;border:none">

              <form nz-form [formGroup]="projectForm" nzLayout="vertical" class="proj-form">
                <nz-form-item>
                  <nz-form-label nzRequired>Nama Proyek / Aplikasi</nz-form-label>
                  <nz-form-control>
                    <input nz-input formControlName="name" placeholder="Contoh: Aplikasi CRM">
                  </nz-form-control>
                </nz-form-item>
                <nz-form-item>
                  <nz-form-label nzRequired>Tim</nz-form-label>
                  <nz-form-control>
                    <nz-select formControlName="teamId" style="width:100%" nzPlaceHolder="Pilih tim">
                      @for (t of teams(); track t.id) {
                        <nz-option [nzValue]="t.id" [nzLabel]="t.name"></nz-option>
                      }
                    </nz-select>
                  </nz-form-control>
                </nz-form-item>
                <div style="display:flex;gap:8px">
                  <button nz-button nzType="primary" [disabled]="projectForm.invalid" (click)="saveProject()">
                    <span nz-icon [nzType]="editingProject ? 'save' : 'plus'"></span>
                    {{ editingProject ? 'Simpan' : 'Tambah Proyek' }}
                  </button>
                  @if (editingProject) {
                    <button nz-button (click)="cancelProjectEdit()">Batal</button>
                  }
                </div>
              </form>

              <nz-divider style="margin:16px 0 10px"></nz-divider>

              @for (t of teams(); track t.id) {
                @if (getProjects(t.id).length) {
                  <div class="proj-group">
                    <div class="proj-group-hdr" [style.border-left-color]="t.color">
                      <span class="color-dot sm" [style.background]="t.color"></span>
                      <span>{{ t.name }}</span>
                      <nz-tag [nzColor]="'blue'" style="margin-left:auto">{{ getProjects(t.id).length }}</nz-tag>
                    </div>
                    @for (p of getProjects(t.id); track p.id) {
                      <div class="item-row proj-row">
                        <span nz-icon nzType="folder" style="color:#c4b5fd;font-size:15px"></span>
                        <span class="item-name">{{ p.name }}</span>
                        <div class="item-acts">
                          <button nz-button nzType="text" nzSize="small" nz-tooltip nzTooltipTitle="Edit" (click)="editProject(p)">
                            <span nz-icon nzType="edit"></span>
                          </button>
                          <button nz-button nzType="text" nzSize="small" nz-tooltip nzTooltipTitle="Hapus" (click)="deleteProject(p)" class="del-btn">
                            <span nz-icon nzType="delete"></span>
                          </button>
                        </div>
                      </div>
                    }
                  </div>
                }
              }
              @if (!projects().length) {
                <nz-empty nzNotFoundContent="Belum ada proyek" style="margin:16px 0"></nz-empty>
              }
            </nz-card>
          </nz-card>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .add-form { display: flex; gap: 8px; flex-wrap: wrap; align-items: flex-start; margin-bottom: 0; }
    .proj-form nz-form-item { margin-bottom: 10px !important; }
    .color-wrap { display: flex; flex-direction: column; align-items: center; gap: 2px; }
    .color-lbl  { font-size: 10px; color: #9ca3af; }
    .color-inp  { width: 44px; height: 34px; padding: 2px; border: 1px solid #ede9fe; border-radius: 8px; cursor: pointer; }

    .item-list { display: flex; flex-direction: column; gap: 2px; }
    .item-row {
      display: flex; align-items: center; gap: 8px;
      padding: 9px 8px; border-radius: 8px; border-left: 3px solid transparent;
      transition: background .12s;
    }
    .item-row:hover { background: #faf5ff; }
    .color-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .color-dot.sm { width: 8px; height: 8px; }
    .item-name { flex: 1; font-size: 13px; font-weight: 500; color: #1e1b4b; }
    .count-tag { font-size: 11px !important; }
    .item-acts { display: flex; gap: 0; }
    .item-acts button { color: #9ca3af !important; }
    .item-acts .del-btn:hover { color: #dc2626 !important; }
    .item-acts button:not(.del-btn):hover { color: #7c3aed !important; }

    .proj-group { margin-bottom: 10px; border: 1px solid #ede9fe; border-radius: 10px; overflow: hidden; }
    .proj-group-hdr {
      display: flex; align-items: center; gap: 8px;
      padding: 7px 10px; font-size: 12px; font-weight: 600; color: #374151;
      border-left: 3px solid transparent; background: #fafafa;
    }
    .proj-row { padding-left: 10px; }
  `]
})
export class TeamsComponent {
  private ds     = inject(DataService);
  private fb     = inject(FormBuilder);
  private modal  = inject(NzModalService);
  private msg    = inject(NzMessageService);

  teams    = this.ds.teams;
  projects = this.ds.projects;

  editingTeam:    Team | null    = null;
  editingProject: Project | null = null;

  teamForm = this.fb.group({ name: ['', Validators.required], color: ['#c4b5fd'] });
  projectForm = this.fb.group({ name: ['', Validators.required], teamId: ['', Validators.required] });

  getProjects(teamId: string) { return this.ds.getProjects(teamId); }
  projectCount(tid: string)   { return this.getProjects(tid).length; }

  saveTeam() {
    const v = this.teamForm.value;
    if (this.editingTeam) {
      this.ds.updateTeam({ ...this.editingTeam, name: v.name!, color: v.color! });
      this.msg.success('Tim diperbarui');
      this.cancelTeamEdit();
    } else {
      this.ds.addTeam({ id: crypto.randomUUID(), name: v.name!, color: v.color! });
      this.msg.success('Tim ditambahkan');
      this.teamForm.reset({ color: '#c4b5fd' });
    }
  }

  editTeam(t: Team)   { this.editingTeam = t; this.teamForm.patchValue(t); }
  cancelTeamEdit()    { this.editingTeam = null; this.teamForm.reset({ color: '#c4b5fd' }); }

  deleteTeam(t: Team) {
    this.modal.confirm({
      nzTitle: 'Hapus Tim',
      nzContent: `Yakin ingin menghapus "<b>${t.name}</b>"? Semua proyek dalam tim ini akan ikut terhapus.`,
      nzOkText: 'Ya, Hapus', nzOkDanger: true, nzOkType: 'primary', nzCancelText: 'Batal',
      nzOnOk: () => { this.ds.deleteTeam(t.id); this.msg.success('Tim dihapus'); }
    });
  }

  saveProject() {
    const v = this.projectForm.value;
    if (this.editingProject) {
      this.ds.updateProject({ ...this.editingProject, name: v.name!, teamId: v.teamId! });
      this.msg.success('Proyek diperbarui');
      this.cancelProjectEdit();
    } else {
      this.ds.addProject({ id: crypto.randomUUID(), name: v.name!, teamId: v.teamId! });
      this.msg.success('Proyek ditambahkan');
      this.projectForm.patchValue({ name: '' });
    }
  }

  editProject(p: Project)  { this.editingProject = p; this.projectForm.patchValue(p); }
  cancelProjectEdit()       { this.editingProject = null; this.projectForm.reset(); }

  deleteProject(p: Project) {
    this.modal.confirm({
      nzTitle: 'Hapus Proyek',
      nzContent: `Yakin ingin menghapus proyek "<b>${p.name}</b>"?`,
      nzOkText: 'Ya, Hapus', nzOkDanger: true, nzOkType: 'primary', nzCancelText: 'Batal',
      nzOnOk: () => { this.ds.deleteProject(p.id); this.msg.success('Proyek dihapus'); }
    });
  }
}

