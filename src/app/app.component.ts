import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NzLayoutModule, NzMenuModule, NzIconModule, NzToolTipModule],
  template: `
    <nz-layout class="app-layout">

      <nz-sider class="app-sider"
        nzCollapsible
        [(nzCollapsed)]="collapsed"
        [nzTrigger]="null"
        [nzWidth]="240"
        [nzCollapsedWidth]="64">

        <!-- Brand -->
        <div class="brand" [class.brand-c]="collapsed">
          <div class="brand-icon"
               nz-tooltip [nzTooltipTitle]="collapsed ? 'OrgGraph' : ''" nzTooltipPlacement="right">
            <span nz-icon nzType="cluster"></span>
          </div>
          <div class="brand-text">
            <div class="brand-name">OrgGraph</div>
            <div class="brand-sub">Resource Manager</div>
          </div>
        </div>

        <!-- Navigation -->
        <ul nz-menu nzMode="inline" [nzInlineCollapsed]="collapsed" class="sidebar-nav">
          <li nz-menu-item nzMatchRouter routerLink="/dashboard">
            <span nz-icon nzType="apartment"></span>
            <span>Bagan Organisasi</span>
          </li>
          <li nz-menu-item nzMatchRouter routerLink="/resources">
            <span nz-icon nzType="team"></span>
            <span>Data Resource</span>
          </li>
          <li nz-menu-item nzMatchRouter routerLink="/teams">
            <span nz-icon nzType="project"></span>
            <span>Tim &amp; Proyek</span>
          </li>
          <li nz-menu-item nzMatchRouter routerLink="/settings">
            <span nz-icon nzType="setting"></span>
            <span>Pengaturan</span>
          </li>
        </ul>

        <!-- Spacer -->
        <div class="nav-spacer"></div>

        <!-- Collapse button -->
        <button class="collapse-btn"
                (click)="collapsed = !collapsed"
                nz-tooltip [nzTooltipTitle]="collapsed ? 'Buka sidebar' : ''" nzTooltipPlacement="right">
          <span nz-icon [nzType]="collapsed ? 'right' : 'left'" class="collapse-icon"></span>
          <span class="btn-label" [class.label-hidden]="collapsed">Tutup sidebar</span>
        </button>

        <!-- Footer -->
        <div class="sider-footer">
          <span class="ver-text" [class.label-hidden]="collapsed">v1.0</span>
        </div>

      </nz-sider>

      <nz-layout>
        <nz-content class="main-content">
          <router-outlet />
        </nz-content>
      </nz-layout>

    </nz-layout>
  `,
  styles: [`
    /* ── Shell ─────────────────────────────────── */
    .app-layout { min-height: 100vh; }

    /* ── Sider ─────────────────────────────────── */
    .app-sider {
      background: #fff !important;
      border-right: 1px solid #ede9fe !important;
      box-shadow: 2px 0 16px rgba(109,40,217,.07) !important;
    }

    /* ── Brand ─────────────────────────────────── */
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 16px 14px;
      border-bottom: 1px solid #f3e8ff;
      background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
      overflow: hidden;
      flex-shrink: 0;
    }
    .brand-icon {
      width: 38px; height: 38px; flex-shrink: 0;
      background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
      border-radius: 11px;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; color: #fff;
      box-shadow: 0 4px 12px rgba(124,58,237,.3);
    }
    .brand-text {
      min-width: 0; overflow: hidden;
      max-width: 160px; opacity: 1;
      transition: max-width .28s cubic-bezier(.4,0,.2,1), opacity .18s ease;
      white-space: nowrap;
    }
    .brand-name { font-size: 14px; font-weight: 700; color: #4c1d95; letter-spacing: -.2px; }
    .brand-sub  { font-size: 10.5px; color: #a78bfa; font-weight: 500; margin-top: 2px; }
    .brand-c .brand-text { max-width: 0; opacity: 0; }

    /* ── Nav menu ──────────────────────────────── */
    .sidebar-nav {
      border-right: none !important;
      background: transparent !important;
      flex: 1;
      overflow: hidden !important;
    }

    /* ── Spacer ────────────────────────────────── */
    .nav-spacer { flex: 1; }

    /* ── Collapse button ───────────────────────── */
    .collapse-btn {
      display: flex; align-items: center; gap: 8px;
      width: 100%; padding: 10px 20px;
      border: none; background: transparent;
      color: #9ca3af; font-size: 13px; font-family: inherit;
      cursor: pointer; text-align: left; overflow: hidden;
      white-space: nowrap;
      transition: color .15s, background .15s;
      flex-shrink: 0;
    }
    .collapse-btn:hover { color: #7c3aed; background: #faf5ff; }
    .collapse-icon { font-size: 14px; flex-shrink: 0; }

    .btn-label {
      max-width: 120px; overflow: hidden; opacity: 1;
      transition: max-width .28s cubic-bezier(.4,0,.2,1), opacity .18s ease;
      white-space: nowrap;
    }
    .label-hidden { max-width: 0 !important; opacity: 0 !important; }

    /* ── Footer ─────────────────────────────────── */
    .sider-footer {
      padding: 8px 20px 14px;
      border-top: 1px solid #f3e8ff;
      background: #fdfaff;
      flex-shrink: 0;
      overflow: hidden;
    }
    .ver-text {
      display: block; font-size: 11px; color: #c4b5fd;
      font-weight: 500; letter-spacing: .3px; white-space: nowrap;
      max-width: 80px; overflow: hidden; opacity: 1;
      transition: max-width .28s cubic-bezier(.4,0,.2,1), opacity .18s ease;
    }

    /* ── Main content ──────────────────────────── */
    .main-content {
      background: #f5f3ff !important;
      overflow-y: auto;
      height: 100vh;
    }
  `]
})
export class AppComponent {
  collapsed = false;
}
