export interface UserItem {
  id: string;
  name?: string;
  department?: string;
  telephone?: string;
  cardNumber?: string;
  deviceId?: string;
  type?: string;
  bondId?: string;

  pathPoints: string;
  begin: number;
  end: number;
  startPointX: number;
  startPointY: number;
  endPointX: number;
  endPointY: number;
  state: boolean;
}
