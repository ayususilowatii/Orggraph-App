import {
  Component, AfterViewInit, OnDestroy, ElementRef,
  ViewChild, ViewChildren, QueryList,
  inject, signal, computed, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { DataService } from '../../services/data.service';
import { Employee } from '../../models';

interface SvgLine { x1: number; y1: number; x2: number; y2: number; }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    NzCardModule, NzButtonModule, NzIconModule, NzSelectModule,
    NzToolTipModule, NzDividerModule, NzSpinModule, NzTagModule,
  ],
  template: `
    <div class="page-wrap">

      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Bagan Organisasi</h1>
          <p class="page-sub">Struktur tim dan distribusi resource departemen</p>
        </div>
        <div class="header-actions">
          <button nz-button (click)="downloadJpg()" [nzLoading]="downloading()">
            <span nz-icon nzType="file-image"></span>JPG
          </button>
          <button nz-button nzType="primary" (click)="downloadPng()" [nzLoading]="downloading()">
            <span nz-icon nzType="download"></span>Download PNG
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon vi"><span nz-icon nzType="team"></span></div>
          <div><div class="stat-val">{{ totalEmps() }}</div><div class="stat-lbl">Total Resource</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon gr"><span nz-icon nzType="check-circle"></span></div>
          <div><div class="stat-val">{{ organikCount() }}</div><div class="stat-lbl">Organik</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon or"><span nz-icon nzType="solution"></span></div>
          <div><div class="stat-val">{{ kontrakCount() }}</div><div class="stat-lbl">Kontrak</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon vi"><span nz-icon nzType="project"></span></div>
          <div><div class="stat-val">{{ visibleTeams().length }}</div><div class="stat-lbl">Tim Aktif</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon te"><span nz-icon nzType="folder-open"></span></div>
          <div><div class="stat-val">{{ projects().length }}</div><div class="stat-lbl">Proyek</div></div>
        </div>
      </div>

      <!-- Filters -->
      <nz-card class="filter-card">
        <div class="filter-row">
          <nz-select [(ngModel)]="filterTeam" (ngModelChange)="onFilterChange()" nzPlaceHolder="Semua Tim" nzAllowClear style="width:170px">
            @for (t of teams(); track t.id) {
              <nz-option [nzValue]="t.id" [nzLabel]="t.name"></nz-option>
            }
          </nz-select>

          <nz-select [(ngModel)]="filterStatus" (ngModelChange)="onFilterChange()" nzPlaceHolder="Semua Status" nzAllowClear style="width:160px">
            <nz-option nzValue="organik" nzLabel="Organik"></nz-option>
            <nz-option nzValue="kontrak" nzLabel="Kontrak"></nz-option>
          </nz-select>

          <nz-select [(ngModel)]="filterRole" (ngModelChange)="onFilterChange()" nzPlaceHolder="Semua Role" nzAllowClear style="width:170px">
            @for (r of roles(); track r.id) {
              <nz-option [nzValue]="r.id" [nzLabel]="r.name"></nz-option>
            }
          </nz-select>

          <button nz-button (click)="resetFilters()">
            <span nz-icon nzType="reload"></span>Reset
          </button>
        </div>
      </nz-card>

      <!-- Chart Card -->
      <nz-card [nzBodyStyle]="{'padding': '0'}" class="chart-card">
        <div class="chart-scroll">
          <div #chartArea class="chart-export-root">

            <div class="chart-header-bar">
              <div class="chart-dept-badge">{{ deptName() }}</div>
              <h2 class="chart-main-title">ORGANIZATION STRUCTURE CHART</h2>
            </div>

            @if (mainManager()) {
              <div class="root-section">
                <div #mainManagerEl class="root-node"
                     [style.background]="getRoleBg(mainManager()!.roleId)"
                     [style.color]="getRoleColor(mainManager()!.roleId)">
                  <span class="root-name">{{ mainManager()!.name }}</span>
                  <span class="root-role">{{ getRoleName(mainManager()!.roleId) }}</span>
                  <span [class]="'root-status status-' + mainManager()!.status">
                    {{ mainManager()!.status === 'organik' ? 'Organik' : 'Kontrak' }}
                  </span>
                </div>
                @for (emp of sideEmployees(); track emp.id) {
                  <div class="root-side-connector">
                    <div class="side-line-h"></div>
                    <div class="root-node side-node"
                         [style.background]="getRoleBg(emp.roleId)"
                         [style.color]="getRoleColor(emp.roleId)">
                      <span class="root-name">{{ emp.name }}</span>
                      <span class="root-role">{{ getRoleName(emp.roleId) }}</span>
                      <span [class]="'root-status status-' + emp.status">
                        {{ emp.status === 'organik' ? 'Organik' : 'Kontrak' }}
                      </span>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="empty-root">
                <span nz-icon nzType="user" style="font-size:40px;color:#c4b5fd"></span>
                <p>Belum ada data root employee (tanpa atasan)</p>
              </div>
            }

            <div class="teams-section">
              @for (team of visibleTeams(); track team.id) {
                <div class="team-col" #teamCol>
                  <div class="team-card-inner">
                    <div class="team-name-header">{{ team.name }}</div>
                    @for (emp of getTeamMembers(team.id); track emp.id) {
                      <div class="member-node"
                           [style.background]="getRoleBg(emp.roleId)"
                           [style.color]="getRoleColor(emp.roleId)">
                        <span class="member-name-text">{{ emp.name }}</span>
                        @if (emp.status === 'kontrak') {
                          <span class="member-k-dot" title="Kontrak"></span>
                        }
                      </div>
                    }
                    @if (getTeamMembers(team.id).length === 0) {
                      <div class="team-empty">— kosong —</div>
                    }
                  </div>
                </div>
              }
              @if (visibleTeams().length === 0) {
                <div class="no-teams">Tidak ada tim yang sesuai filter</div>
              }
            </div>

            <div class="chart-legend">
              @for (role of roles(); track role.id) {
                <div class="legend-item">
                  <span class="legend-dot" [style.background]="role.bgColor"></span>
                  <span>{{ role.name }}</span>
                </div>
              }
              <div class="legend-divider"></div>
              <div class="legend-item">
                <span class="legend-dot" style="background:#16a34a"></span><span>Organik</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot dot-ring" style="border-color:#ea580c"></span><span>Kontrak</span>
              </div>
            </div>

            <svg class="conn-svg" [attr.width]="svgW()" [attr.height]="svgH()">
              @for (line of lines(); track $index) {
                <line [attr.x1]="line.x1" [attr.y1]="line.y1"
                      [attr.x2]="line.x2" [attr.y2]="line.y2"
                      stroke="#7c3aed" stroke-width="2" stroke-linecap="round" stroke-opacity="0.5"/>
              }
            </svg>

          </div>
        </div>
      </nz-card>

    </div>
  `,
  styles: [`
    .filter-card { margin-bottom: 16px; }
    .filter-card .ant-card-body { padding: 14px 18px !important; }
    .filter-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }

    .chart-card { overflow: hidden; }
    .chart-scroll { overflow-x: auto; overflow-y: visible; }

    /* Chart header */
    .chart-header-bar { text-align: center; margin-bottom: 32px; }
    .chart-dept-badge {
      display: inline-block;
      background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
      color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
      padding: 5px 18px; border-radius: 20px; margin-bottom: 8px;
      text-transform: uppercase; box-shadow: 0 4px 12px rgba(124,58,237,.3);
    }
    .chart-main-title {
      font-size: 22px; font-weight: 800; color: #1e1b4b;
      margin: 0; letter-spacing: 1px; text-transform: uppercase;
    }

    /* Root nodes */
    .root-section { display: flex; justify-content: center; align-items: center; gap: 0; margin-bottom: 0; }
    .root-node {
      min-width: 200px; max-width: 260px; padding: 14px 24px;
      border-radius: 12px; text-align: center;
      box-shadow: 0 4px 16px rgba(0,0,0,.15); position: relative; z-index: 2;
    }
    .root-name  { display: block; font-size: 15px; font-weight: 700; margin-bottom: 4px; }
    .root-role  { display: block; font-size: 11px; opacity: .85; margin-bottom: 6px; }
    .root-status {
      display: inline-block; font-size: 10px; font-weight: 700;
      padding: 2px 8px; border-radius: 10px; background: rgba(255,255,255,.25);
    }
    .root-side-connector { display: flex; align-items: center; }
    .side-line-h { width: 32px; height: 2px; background: #7c3aed; opacity: .5; flex-shrink: 0; }
    .side-node { box-shadow: 0 3px 12px rgba(0,0,0,.12); }
    .empty-root { text-align: center; padding: 40px; color: #9ca3af; }

    /* Teams */
    .teams-section { display: flex; gap: 16px; margin-top: 70px; align-items: flex-start; }
    .team-col { flex: 1; min-width: 170px; max-width: 220px; }
    .team-card-inner {
      border: 2px dashed #c4b5fd; border-radius: 14px; padding: 16px 12px 12px;
      background: rgba(255,255,255,.78); backdrop-filter: blur(4px);
      box-shadow: 0 2px 8px rgba(124,58,237,.08);
    }
    .team-name-header {
      font-size: 13px; font-weight: 700; color: #4c1d95; text-align: center;
      margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #ede9fe;
    }
    .member-node {
      border-radius: 8px; padding: 7px 10px; margin-bottom: 6px;
      font-size: 12px; font-weight: 600; text-align: center;
      display: flex; align-items: center; justify-content: center; gap: 6px;
      box-shadow: 0 1px 4px rgba(0,0,0,.1);
    }
    .member-name-text { flex: 1; text-align: center; }
    .member-k-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: rgba(255,255,255,.5); border: 1.5px solid rgba(255,255,255,.7);
      flex-shrink: 0;
    }
    .team-empty { text-align: center; color: #9ca3af; font-size: 12px; padding: 8px; }
    .no-teams { padding: 40px; color: #9ca3af; text-align: center; width: 100%; }

    /* Legend */
    .chart-legend {
      display: flex; flex-wrap: wrap; gap: 12px;
      margin-top: 28px; padding-top: 16px; border-top: 1px solid #ddd6fe;
      justify-content: flex-end;
    }
    .legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; color: #4c1d95; }
    .legend-dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
    .dot-ring { background: transparent !important; border: 2.5px solid; }
    .legend-divider { width: 1px; height: 16px; background: #ddd6fe; }

    /* SVG */
    .conn-svg { position: absolute; top: 0; left: 0; pointer-events: none; z-index: 1; overflow: visible; }
  `]
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chartArea')     chartArea!:     ElementRef<HTMLDivElement>;
  @ViewChild('mainManagerEl') mainManagerEl?: ElementRef<HTMLDivElement>;
  @ViewChildren('teamCol')    teamColEls!:    QueryList<ElementRef<HTMLDivElement>>;

  private ds  = inject(DataService);
  private cdr = inject(ChangeDetectorRef);

  employees = this.ds.employees;
  roles     = this.ds.roles;
  teams     = this.ds.teams;
  projects  = this.ds.projects;
  deptName  = this.ds.deptName;

  filterTeam   = '';
  filterStatus = '';
  filterRole   = '';
  lines        = signal<SvgLine[]>([]);
  svgW         = signal(800);
  svgH         = signal(600);
  downloading  = signal(false);

  totalEmps    = computed(() => this.employees().length);
  organikCount = computed(() => this.employees().filter(e => e.status === 'organik').length);
  kontrakCount = computed(() => this.employees().filter(e => e.status === 'kontrak').length);

  topRowEmps = computed(() =>
    [...this.employees().filter(e => e.parentId === null)]
      .sort((a, b) => (this.ds.getRole(a.roleId)?.level ?? 99) - (this.ds.getRole(b.roleId)?.level ?? 99))
  );
  mainManager   = computed(() => this.topRowEmps()[0] ?? null);
  sideEmployees = computed(() => this.topRowEmps().slice(1));

  visibleTeams = computed(() => {
    let t = this.teams();
    if (this.filterTeam) t = t.filter(x => x.id === this.filterTeam);
    return t.filter(team => this.getTeamMembers(team.id).length > 0);
  });

  getTeamMembers(teamId: string): Employee[] {
    let list = this.employees().filter(e => e.teamId === teamId);
    if (this.filterStatus) list = list.filter(e => e.status === this.filterStatus);
    if (this.filterRole)   list = list.filter(e => e.roleId === this.filterRole);
    return list.sort((a, b) =>
      (this.ds.getRole(a.roleId)?.level ?? 99) - (this.ds.getRole(b.roleId)?.level ?? 99)
    );
  }

  getRoleName(id?: string | null) { return id ? (this.ds.getRole(id)?.name ?? '-') : '-'; }
  getRoleBg(id: string)           { return this.ds.getRole(id)?.bgColor ?? '#334155'; }
  getRoleColor(id: string)        { return this.ds.getRole(id)?.color   ?? '#fff'; }

  ngAfterViewInit() { setTimeout(() => this.computeLines(), 160); }

  onFilterChange() { setTimeout(() => this.computeLines(), 80); }

  resetFilters() {
    this.filterTeam = this.filterStatus = this.filterRole = '';
    this.onFilterChange();
  }

  private computeLines() {
    const chartEl = this.chartArea?.nativeElement;
    const mgrEl   = this.mainManagerEl?.nativeElement;
    const teamEls = this.teamColEls?.toArray();
    if (!chartEl || !mgrEl || !teamEls?.length) { this.lines.set([]); return; }

    const cRect = chartEl.getBoundingClientRect();
    const rel = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return { top: r.top - cRect.top, bottom: r.bottom - cRect.top, cx: r.left + r.width / 2 - cRect.left };
    };

    const mgr    = rel(mgrEl);
    const teams  = teamEls.map(e => rel(e.nativeElement));
    const horizY = mgr.bottom + 30;

    this.lines.set([
      { x1: mgr.cx, y1: mgr.bottom, x2: mgr.cx, y2: horizY },
      { x1: teams[0].cx, y1: horizY, x2: teams[teams.length - 1].cx, y2: horizY },
      ...teams.map(t => ({ x1: t.cx, y1: horizY, x2: t.cx, y2: t.top }))
    ]);
    this.svgW.set(chartEl.scrollWidth);
    this.svgH.set(chartEl.scrollHeight);
    this.cdr.detectChanges();
  }

  async downloadPng() { await this.export('png'); }
  async downloadJpg() { await this.export('jpg'); }

  private async export(fmt: 'png' | 'jpg') {
    this.downloading.set(true);
    try {
      const { toPng, toJpeg } = await import('html-to-image');
      const fn = fmt === 'png' ? toPng : toJpeg;
      const dataUrl = await fn(this.chartArea.nativeElement, {
        pixelRatio: 2, backgroundColor: '#f5f3ff', skipAutoScale: false,
      });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${this.deptName()}-org-chart.${fmt}`;
      a.click();
    } finally { this.downloading.set(false); }
  }

  ngOnDestroy() {}
}
