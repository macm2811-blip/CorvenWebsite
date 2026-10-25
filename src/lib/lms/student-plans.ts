export const STUDENT_PLANS = ["1 class / week", "2 classes / week"] as const;
export function validStudentPlan(value: string) { return value.trim().length > 0 && value.trim().length <= 120; }
