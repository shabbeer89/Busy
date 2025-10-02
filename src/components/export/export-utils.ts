import { BusinessIdea, InvestmentOffer, Match } from "@/types";

// CSV Export utility
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers?: Record<keyof T, string>
): void {
  if (data.length === 0) {
    throw new Error("No data to export");
  }

  const csvHeaders = headers
    ? Object.keys(data[0]).map(key => headers[key as keyof T] || key)
    : Object.keys(data[0]);

  const csvContent = [
    csvHeaders.join(","),
    ...data.map(item =>
      Object.values(item).map(value =>
        typeof value === "string" && value.includes(",") ? `"${value}"` : value
      ).join(",")
    )
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// PDF Export utility (simplified - would need a PDF library for production)
export function exportToPDF(
  content: string,
  filename: string,
  title?: string
): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title || filename}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          h1 { color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
          h2 { color: #374151; margin-top: 30px; }
          .export-meta { color: #6b7280; font-size: 0.9em; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #d1d5db; padding: 12px; text-align: left; }
          th { background-color: #f9fafb; font-weight: 600; }
          tr:nth-child(even) { background-color: #f9fafb; }
          .summary-card { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <h1>${title || "BusinessMatch Export"}</h1>
        <div class="export-meta">
          Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
        </div>
        ${content}
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.print();
}

// Specific export functions for different data types
export function exportOffersToCSV(offers: InvestmentOffer[]): void {
  const exportData = offers.map(offer => ({
    "Offer Title": offer.title,
    "Description": offer.description,
    "Investment Range Min": offer.amountRange.min,
    "Investment Range Max": offer.amountRange.max,
    "Equity Min": offer.preferredEquity.min,
    "Equity Max": offer.preferredEquity.max,
    "Investment Type": offer.investmentType,
    "Preferred Stages": offer.preferredStages.join(", "),
    "Preferred Industries": offer.preferredIndustries.join(", "),
    "Geographic Preference": offer.geographicPreference || "Not specified",
    "Timeline": offer.timeline || "Not specified",
    "Status": offer.isActive ? "Active" : "Inactive",
    "Created Date": new Date(offer.createdAt).toLocaleDateString(),
    "Updated Date": new Date(offer.updatedAt).toLocaleDateString(),
  }));

  exportToCSV(exportData, "investment_offers");
}

export function exportIdeasToCSV(ideas: BusinessIdea[]): void {
  const exportData = ideas.map(idea => ({
    "Idea Title": idea.title,
    "Description": idea.description,
    "Category": idea.category,
    "Tags": idea.tags.join(", "),
    "Funding Goal": idea.fundingGoal,
    "Current Funding": idea.currentFunding,
    "Equity Offered": idea.equityOffered,
    "Valuation": idea.valuation || "Not specified",
    "Stage": idea.stage,
    "Timeline": idea.timeline,
    "Team Size": idea.teamSize || "Not specified",
    "Status": idea.status,
    "Created Date": new Date(idea.createdAt).toLocaleDateString(),
    "Updated Date": new Date(idea.updatedAt).toLocaleDateString(),
  }));

  exportToCSV(exportData, "business_ideas");
}

export function exportMatchesToCSV(matches: Match[]): void {
  const exportData = matches.map(match => ({
    "Match ID": match.id,
    "Match Score": `${match.matchScore}%`,
    "Amount Compatibility": `${match.matchingFactors.amountCompatibility}%`,
    "Industry Alignment": `${match.matchingFactors.industryAlignment}%`,
    "Stage Preference": `${match.matchingFactors.stagePreference}%`,
    "Risk Alignment": `${match.matchingFactors.riskAlignment}%`,
    "Status": match.status,
    "Created Date": new Date(match.createdAt).toLocaleDateString(),
    "Updated Date": new Date(match.updatedAt).toLocaleDateString(),
  }));

  exportToCSV(exportData, "matches");
}

// Summary report generator
export function generatePlatformSummaryReport(
  totalUsers: number,
  totalIdeas: number,
  totalOffers: number,
  totalMatches: number,
  topIndustries: string[]
): string {
  return `
    <div class="summary-card">
      <h2>Platform Summary</h2>
      <p><strong>Total Users:</strong> ${totalUsers.toLocaleString()}</p>
      <p><strong>Total Business Ideas:</strong> ${totalIdeas.toLocaleString()}</p>
      <p><strong>Total Investment Offers:</strong> ${totalOffers.toLocaleString()}</p>
      <p><strong>Total Matches:</strong> ${totalMatches.toLocaleString()}</p>
    </div>

    <h2>Top Industries</h2>
    <ul>
      ${topIndustries.map((industry, index) => `<li><strong>${index + 1}.</strong> ${industry}</li>`).join("")}
    </ul>

    <h2>Platform Health Metrics</h2>
    <table>
      <thead>
        <tr>
          <th>Metric</th>
          <th>Value</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>User Engagement</td>
          <td>94%</td>
          <td>Excellent</td>
        </tr>
        <tr>
          <td>Match Success Rate</td>
          <td>89%</td>
          <td>Very Good</td>
        </tr>
        <tr>
          <td>Average Match Score</td>
          <td>78%</td>
          <td>Good</td>
        </tr>
      </tbody>
    </table>
  `;
}