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

export type LmsCourseBlockKind =
  | "text"
  | "image"
  | "youtube"
  | "document"
  | "audio"
  | "quiz"
  | "exam";

export type LmsCourseBlockConfig = {
  fontFamily: "sans" | "serif" | "display";
  fontSize: "small" | "normal" | "large" | "title";
  textColor: string;
  backgroundColor: string;
  align: "left" | "center" | "right";
  width: "full" | "half" | "third";
  bold: boolean;
  italic: boolean;
  underline: boolean;
};

export type LmsCourseBlock = {
  id: string;
  kind: LmsCourseBlockKind;
  title: string;
  body: string;
  url: string;
  position: number;
  config: LmsCourseBlockConfig;
  question?: string;
  options?: string[];
  correctAnswer?: string;
  passingScore?: number;
  maxAttempts?: number;
};

export type LmsTicket = {
  id: string;
  organizationId?: string;
  source: string;
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

export type LmsAcademyAdmin = {
  id: string;
  name: string;
  email: string;
  role: "academy_admin" | "instructor";
  accessStatus: "invited" | "active" | "suspended" | "archived";
};

export type LmsAcademy = {
  id: string;
  name: string;
  slug: string;
  status: "active" | "suspended" | "archived";
  learningModel: "self_paced" | "instructor_led" | "hybrid";
  studentCount: number;
  courseCount: number;
  adminCount: number;
  monthlyRevenue: number;
  defaultMonthlyFee: number;
  currency: string;
  createdAt: string;
  admins: LmsAcademyAdmin[];
  students: LmsStudent[];
  courses: LmsCourse[];
};

export type LmsActivityEvent = {
  id: string;
  action: string;
  actor: string;
  academy: string;
  created: string;
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
  academies: LmsAcademy[];
  activity: LmsActivityEvent[];
  brand: LmsBrand;
  logoUrl: string | null;
  monthlyFee: number;
};
