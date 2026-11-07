/**
 * Admin Types
 */

export interface User {
  id: number;
  name: string;
  email: string;
  username?: string;
  role: string;
}

export interface Area {
  id: number;
  name: string;
  description: string;
  lastRun: string;
  status: string;
  user: string;
  enabled: boolean;
}

export interface Service {
  id: number;
  name: string;
  logo: string;
}

export interface LineDataPoint {
  date: string;
  users: number;
}

export interface BarDataPoint {
  month: string;
  users: number;
}

export interface CardUserDataPoint {
  title: string;
  icon: 'user' | 'discount' | 'receipt' | 'coin';
  value: string;
  diff: number;
}

export interface AreaRun {
  id: number;
  areaName: string;
  user: string;
  timestamp: string;
  status: string;
  duration: string;
}

export interface AreaStat {
  title: string;
  value: string;
  icon: string;
}

export interface ServiceBarData {
  service: string;
  usage: number;
}
