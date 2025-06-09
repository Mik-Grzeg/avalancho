// Mock data for recent reports
export const mockReports = [
  {
    report_id: 4957,
    issued_at: "2025-03-23 17:05",
    expires_at: "2025-03-24 20:00",
    mst_level: 2,
    author: "Andrzej Mikler",
    comment: "Po ostatnich opadach warunki śniegowe są bardzo zróżnicowane. W żlebach północnych świeży śnieg. Pokrywa śnieżna na grani stabilna."
  },
  {
    report_id: 4956,
    issued_at: "2025-03-22 16:59",
    expires_at: "2025-03-23 20:00",
    mst_level: 3,
    author: "Marcin Witek",
    comment: "Świeży śnieg w żlebach północnych. Pokrywa śnieżna na grani jest stabilna, ale w żlebach możliwe są małe lawiny."
  },
  {
    report_id: 4955,
    issued_at: "2025-03-21 17:15",
    expires_at: "2025-03-22 20:00",
    mst_level: 3,
    author: "Andrzej Mikler",
    comment: "Warunki śniegowe trudne. Widoczność ograniczona przez mgłę. Zalecana szczególna ostrożność."
  },
  {
    report_id: 4954,
    issued_at: "2025-03-20 16:45",
    expires_at: "2025-03-21 20:00",
    mst_level: 4,
    author: "Marcin Witek",
    comment: "Silny wiatr i intensywne opady śniegu. Bardzo wysokie zagrożenie lawinowe. Nie zaleca się wychodzenia w góry."
  },
  {
    report_id: 4953,
    issued_at: "2025-03-19 17:01",
    expires_at: "2025-03-20 20:00",
    mst_level: 2,
    author: "Andrzej Mikler",
    comment: "Stabilne warunki śniegowe. Dobra widoczność. Zalecana standardowa ostrożność."
  }
];

// Mock data for detailed report
export const mockDetailedReport = {
  report_id: 4953,
  issued_at: "2025-03-19 17:01",
  expires_at: "2025-03-20 20:00",
  author: "Andrzej Mikler",
  mst_level: 2,
  mst_tendency: 0,
  mst_wet: "",
  comment: "Po ostatnich opadach warunki śniegowe są bardzo zróżnicowane. W żlebach północnych świeży śnieg. Pokrywa śnieżna na grani jest stabilna, ale w żlebach możliwe są małe lawiny. Zalecana standardowa ostrożność podczas poruszania się w terenie wysokogórskim.",
  pdf_url: "https://lawiny.topr.pl/pdf/4953.pdf",
  history: [
    { dat: "2025-03-17", lev: 3, wet: "" },
    { dat: "2025-03-18", lev: 2, wet: "" },
    { dat: "2025-03-19", lev: 2, wet: "" },
    { dat: "2025-03-20", lev: 2, wet: "" },
    { dat: "2025-03-21", lev: 2, wet: "" }
  ]
};

// Generate 90 days of mock history data
const generateHistoryData = () => {
  const data = [];
  const authors = ["Andrzej Mikler", "Marcin Witek", "Piotr Konopka", "Jan Krzysztof"];
  let currentDate = new Date("2025-03-23");
  let reportId = 4957;

  for (let i = 0; i < 90; i++) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - i);
    
    // Generate more realistic danger levels with seasonal patterns
    let baseLevel;
    const month = date.getMonth();
    // Winter months (December-February) tend to have higher danger levels
    if (month === 11 || month === 0 || month === 1) {
      baseLevel = Math.floor(Math.random() * 3) + 2; // 2-4
    } 
    // Spring months (March-May) have variable conditions
    else if (month === 2 || month === 3 || month === 4) {
      baseLevel = Math.floor(Math.random() * 4) + 1; // 1-4
    }
    // Summer months (June-August) have lower danger levels
    else if (month === 5 || month === 6 || month === 7) {
      baseLevel = Math.floor(Math.random() * 2) + 1; // 1-2
    }
    // Autumn months (September-November) have moderate danger levels
    else {
      baseLevel = Math.floor(Math.random() * 3) + 1; // 1-3
    }

    // Add some randomness but maintain consistency
    const level = Math.max(1, Math.min(5, baseLevel + (Math.random() < 0.3 ? 1 : 0)));

    data.push({
      report_id: reportId - i,
      dat: date.toISOString().split('T')[0],
      lev: level,
      wet: Math.random() < 0.2 ? "w" : "" // 20% chance of wet conditions
    });
  }

  return data;
};

export const mockHistory = generateHistoryData();