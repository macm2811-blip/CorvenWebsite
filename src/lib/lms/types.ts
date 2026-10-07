export type LmsRole = "student" | "admin" | "owner";

export type LmsStudent = {
  id: string | number;
  name: string;
  email: string;
  initials: string;
  level: string;
  progress: number;
  active: boolean;
  payment: "Pagado" | "Pendiente" | "Vencido";
  dueDate: string;
  lastAccess: string;
};

export type LmsCourse = {
  id: string | number;
  title: string;
  level: string;
  description: string;
  progress: number;
  lessons: number;
  duration: string;
  students: number;
  youtubeUrl: string;
  color: string;
  published: boolean;
};

export type LmsTicket = {
  id: string;
  source: "Level Up" | "Estudiante";
  person: string;
  title: string;
  detail: string;
  priority: "Alta" | "Media" | "Baja";
  status: "Abierto" | "En proceso" | "Respondido";
  created: string;
  reply?: string;
};

export type LmsBrand = {
  primary: string;
  secondary: string;
  accent: string;
};

export type LmsInitialData = {
  persistent: true;
  role: LmsRole;
  viewerId: string;
  viewerName: string;
  viewerEmail: string;
  organizationId: string;
  organizationName: string;
  accessStatus: "invited" | "active" | "suspended" | "archived";
  viewerLevel: string;
  viewerPayment: LmsStudent["payment"];
  viewerDueDate: string;
  students: LmsStudent[];
  courses: LmsCourse[];
  tickets: LmsTicket[];
  brand: LmsBrand;
  logoUrl: string | null;
  monthlyFee: number;
};
