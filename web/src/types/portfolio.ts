export type PortfolioStatus = "Invested" | "Exited" | "RIP" | string;

export interface PortfolioCompany {
  id: number;
  created_at: string | null;
  name: string;
  year: string | null;
  website: string | null;
  tag: PortfolioStatus | null;
  industry: string | null;
}

export interface PortfolioPayload {
  name: string;
  year?: string | null;
  website?: string | null;
  tag?: PortfolioStatus | null;
  industry?: string | null;
}
