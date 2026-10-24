export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1"] as const;
export function journeyProgress(catalog: {id:string;level:string}[], details:{course:{id:string};percentage:number}[]) {
  return CEFR_LEVELS.map(level => {
    const units = catalog.filter(c => c.level === level);
    return units.length ? units.reduce((sum,c) => sum + Math.min(100,Math.max(0,details.find(d=>d.course.id===c.id)?.percentage ?? 0)),0)/units.length : 0;
  });
}
