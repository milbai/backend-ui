export interface FenceItem {
  id: string;
  name: string;
  area: string;
  begin: number;
  end: number;
  outsideAlarm: boolean;
  outsideTimeout: number;
  insideAlarm: boolean;
  insideTimeout: number;
  employees: string;
}
