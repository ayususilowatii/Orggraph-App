import { Injectable, signal, computed } from '@angular/core';
import { AppData, Employee, Role, Team, Project } from '../models';

const STORAGE_KEY = 'orggraph_data';

const DEFAULT_DATA: AppData = {
  deptName: 'RCD',
  roles: [
    { id: 'r1', name: 'Manager', color: '#ffffff', bgColor: '#1a237e', level: 1 },
    { id: 'r2', name: 'Team Lead', color: '#ffffff', bgColor: '#283593', level: 2 },
    { id: 'r3', name: 'Senior Dev', color: '#ffffff', bgColor: '#1565c0', level: 3 },
    { id: 'r4', name: 'Developer', color: '#ffffff', bgColor: '#1976d2', level: 4 },
    { id: 'r5', name: 'QA Engineer', color: '#ffffff', bgColor: '#6a1b9a', level: 4 },
    { id: 'r6', name: 'Business Analyst', color: '#ffffff', bgColor: '#00695c', level: 4 },
  ],
  teams: [
    { id: 't1', name: 'Tim Alpha', color: '#e3f2fd' },
    { id: 't2', name: 'Tim Beta', color: '#f3e5f5' },
  ],
  projects: [
    { id: 'p1', name: 'Aplikasi CRM', teamId: 't1' },
    { id: 'p2', name: 'Portal Internal', teamId: 't1' },
    { id: 'p3', name: 'Mobile App', teamId: 't2' },
  ],
  employees: [
    { id: 'e1', name: 'Budi Santoso', nik: '001', roleId: 'r1', status: 'organik', teamId: 't1', projectIds: ['p1', 'p2'], parentId: null },
    { id: 'e2', name: 'Dewi Rahayu', nik: '002', roleId: 'r2', status: 'organik', teamId: 't1', projectIds: ['p1'], parentId: 'e1' },
    { id: 'e3', name: 'Andi Wijaya', nik: '003', roleId: 'r3', status: 'organik', teamId: 't1', projectIds: ['p1'], parentId: 'e2' },
    { id: 'e4', name: 'Sari Putri', nik: '004', roleId: 'r4', status: 'kontrak', teamId: 't1', projectIds: ['p1'], parentId: 'e2' },
    { id: 'e5', name: 'Riko Pratama', nik: '005', roleId: 'r2', status: 'organik', teamId: 't2', projectIds: ['p3'], parentId: 'e1' },
    { id: 'e6', name: 'Nina Lestari', nik: '006', roleId: 'r4', status: 'kontrak', teamId: 't2', projectIds: ['p3'], parentId: 'e5' },
    { id: 'e7', name: 'Eko Susilo', nik: '007', roleId: 'r5', status: 'organik', teamId: 't1', projectIds: ['p2'], parentId: 'e2' },
  ]
};

@Injectable({ providedIn: 'root' })
export class DataService {
  private data = signal<AppData>(this.load());

  roles = computed(() => this.data().roles);
  teams = computed(() => this.data().teams);
  projects = computed(() => this.data().projects);
  employees = computed(() => this.data().employees);
  deptName = computed(() => this.data().deptName ?? 'DEPARTMENT');
  setDeptName(name: string) { this.update({ deptName: name }); }

  private load(): AppData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_DATA;
    } catch {
      return DEFAULT_DATA;
    }
  }

  private save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data()));
  }

  private update(patch: Partial<AppData>) {
    this.data.update(d => ({ ...d, ...patch }));
    this.save();
  }

  // Roles
  addRole(role: Role) { this.update({ roles: [...this.data().roles, role] }); }
  updateRole(role: Role) { this.update({ roles: this.data().roles.map(r => r.id === role.id ? role : r) }); }
  deleteRole(id: string) { this.update({ roles: this.data().roles.filter(r => r.id !== id) }); }

  // Teams
  addTeam(team: Team) { this.update({ teams: [...this.data().teams, team] }); }
  updateTeam(team: Team) { this.update({ teams: this.data().teams.map(t => t.id === team.id ? team : t) }); }
  deleteTeam(id: string) {
    this.update({
      teams: this.data().teams.filter(t => t.id !== id),
      projects: this.data().projects.filter(p => p.teamId !== id),
    });
  }

  // Projects
  addProject(project: Project) { this.update({ projects: [...this.data().projects, project] }); }
  updateProject(project: Project) { this.update({ projects: this.data().projects.map(p => p.id === project.id ? project : p) }); }
  deleteProject(id: string) { this.update({ projects: this.data().projects.filter(p => p.id !== id) }); }

  // Employees
  addEmployee(emp: Employee) { this.update({ employees: [...this.data().employees, emp] }); }
  updateEmployee(emp: Employee) { this.update({ employees: this.data().employees.map(e => e.id === emp.id ? emp : e) }); }
  deleteEmployee(id: string) {
    // reassign children to grandparent
    const emp = this.data().employees.find(e => e.id === id);
    const updated = this.data().employees
      .filter(e => e.id !== id)
      .map(e => e.parentId === id ? { ...e, parentId: emp?.parentId ?? null } : e);
    this.update({ employees: updated });
  }

  getRole(id: string) { return this.data().roles.find(r => r.id === id); }
  getTeam(id: string) { return this.data().teams.find(t => t.id === id); }
  getProjects(teamId?: string) {
    return teamId ? this.data().projects.filter(p => p.teamId === teamId) : this.data().projects;
  }

  resetToDefault() {
    this.data.set(DEFAULT_DATA);
    this.save();
  }

  exportData(): string {
    return JSON.stringify(this.data(), null, 2);
  }

  importData(raw: string): { ok: boolean; error?: string } {
    try {
      const parsed = JSON.parse(raw);
      if (
        !Array.isArray(parsed.roles) ||
        !Array.isArray(parsed.teams) ||
        !Array.isArray(parsed.projects) ||
        !Array.isArray(parsed.employees)
      ) {
        return { ok: false, error: 'Format file tidak valid. Pastikan file adalah backup OrgGraph.' };
      }
      this.data.set(parsed as AppData);
      this.save();
      return { ok: true };
    } catch {
      return { ok: false, error: 'File tidak bisa dibaca. Pastikan file berformat JSON.' };
    }
  }
}
