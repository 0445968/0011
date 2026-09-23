export interface LabItem {
  id: string;
  title: string;
  description: string;
  href: string;
  type: string;
  status: string;
  featured?: boolean;
  estimatedTime?: string;
}