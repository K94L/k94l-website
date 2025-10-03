import type { PortfolioCompany } from "@/types/portfolio";

export const normaliseStatus = (status?: string | null) => {
  if (!status) return "Unknown";
  const cleaned = status.trim().toLowerCase();
  if (cleaned === "invested") return "Invested";
  if (cleaned === "exited") return "Exited";
  if (["rip", "inactive", "closed"].includes(cleaned)) return "RIP";
  return status.trim();
};

export const statusBadgeClass = (status: string) => {
  switch (status) {
    case "Invested":
      return "bg-blue-100 text-blue-800";
    case "Exited":
      return "bg-green-100 text-green-800";
    case "RIP":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const calculateStats = (rows: PortfolioCompany[]) => {
  let active = 0;
  let exits = 0;
  rows.forEach((row) => {
    const status = normaliseStatus(row.tag);
    if (status.toLowerCase() !== "rip") {
      active += 1;
    }
    if (status === "Exited") {
      exits += 1;
    }
  });
  return { active, exits };
};

export const sortPortfolio = (rows: PortfolioCompany[]) =>
  [...rows].sort((a, b) => {
    const statusOrder = (status?: string | null) => {
      const normalised = normaliseStatus(status);
      if (normalised === "Invested") return 0;
      if (normalised === "Exited") return 1;
      return 2;
    };

    const statusComparison = statusOrder(a.tag) - statusOrder(b.tag);
    if (statusComparison !== 0) return statusComparison;

    const yearA = Number(a.year ?? 0);
    const yearB = Number(b.year ?? 0);

    if (!Number.isNaN(yearA) && !Number.isNaN(yearB)) {
      return yearB - yearA;
    }

    return a.name.localeCompare(b.name);
  });
