export interface Role {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  level: number; // 1=highest, determines hierarchy sort
}

export interface Team {
  id: string;
  name: string;
  color: string;
}

export interface Project {
  id: string;
  name: string;
  teamId: string;
}

export type EmployeeStatus = 'organik' | 'kontrak';

export interface Employee {
  id: string;
  name: string;
  nik?: string;
  roleId: string;
  status: EmployeeStatus;
  teamId: string;
  projectIds: string[];
  parentId: string | null;
  phone?: string;
  email?: string;
}

export interface AppData {
  deptName?: string;
  roles: Role[];
  teams: Team[];
  projects: Project[];
  employees: Employee[];
}
