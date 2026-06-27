"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Coins,
  Download,
  ArrowLeft,
  CheckCircle,
  Loader2,
  LogOut,
  Search,
  MessageCircle,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";

type Transaction = {
  id: number;
  userId: string;
  type: "SALE" | "PURCHASE";
  product: string;
  quantity: number;
  unit: string;
  unitPrice: string;
  total: string;
  date: string | null;
  language: string | null;
  inputType: string | null;
};

type ChartBucket = {
  date: string;
  sales: number;
  purchases: number;
  profit: number;
};

type UserInfo = {
  phone: string;
  businessName: string;
  language: string;
  businessType: string;
};

type DashboardData = {
  user: UserInfo;
  stats: {
    totalSales: number;
    totalPurchases: number;
    netProfit: number;
    transactionCount: number;
  };
  chartData: ChartBucket[];
  transactions: Transaction[];
};

export default function DashboardPage() {
  // App States
  const [step, setStep] = useState<"lookup" | "verify" | "dashboard">("lookup");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Loaded Dashboard Data
  const [data, setData] = useState<DashboardData | null>(null);

  // Search State
  const [searchTerm, setSearchTerm] = useState("");

  // Try to load session on mount
  useEffect(() => {
    const savedData = sessionStorage.getItem("nibbot_dashboard_data");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setData(parsed);
        setPhone(parsed.user.phone);
        setBusinessName(parsed.user.businessName);
        setStep("dashboard");
      } catch (e) {
        console.error("Failed to parse saved session", e);
      }
    }
  }, []);

  // Step 1: Request Code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !businessName) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/dashboard/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, businessName }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Something went wrong");
      }

      setMessage(
        "Verification code sent! Please check your WhatsApp messages."
      );
      setStep("verify");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Confirm Verification & Load Data
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/dashboard/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: verificationCode, businessName }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Incorrect code. Please try again.");
      }

      setData(result);
      sessionStorage.setItem("nibbot_dashboard_data", JSON.stringify(result));
      setStep("dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Logout/Reset Session
  const handleLogout = () => {
    sessionStorage.removeItem("nibbot_dashboard_data");
    setData(null);
    setVerificationCode("");
    setStep("lookup");
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!data || data.transactions.length === 0) return;

    // CSV Header
    const headers = [
      "Date",
      "Type (Sale/Expense)",
      "Product Name",
      "Quantity",
      "Unit",
      "Price Per Unit (Naira)",
      "Total Amount (Naira)",
      "Entered Via",
    ];

    // CSV Rows
    const rows = data.transactions.map((t) => {
      const dateStr = t.date
        ? new Date(t.date).toLocaleDateString("en-NG")
        : "N/A";
      const typeLabel = t.type === "SALE" ? "Sale (Money In)" : "Purchase (Money Out)";
      const priceVal = parseFloat(t.unitPrice).toFixed(2);
      const totalVal = parseFloat(t.total).toFixed(2);

      return [
        `"${dateStr}"`,
        `"${typeLabel}"`,
        `"${t.product}"`,
        t.quantity,
        `"${t.unit}"`,
        priceVal,
        totalVal,
        `"${t.inputType || "text"}"`,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `${data.user.businessName.replace(/\s+/g, "_")}_Transactions.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter transactions
  const filteredTransactions = data
    ? data.transactions.filter((t) =>
        t.product.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <main className="min-h-screen bg-[#fafafa] text-charcoal flex flex-col justify-between">
      {/* Top Banner/Navbar */}
      <div className="bg-[#0a0a0a] text-white py-5 px-6 border-b border-white/5 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">
            Nib<span className="text-gold">Bot</span>
          </span>
        </a>
        <h1 className="text-sm font-semibold tracking-wider text-white/50 uppercase hidden sm:block">
          Business Owner Portal
        </h1>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <AnimatePresence mode="wait">
          {/* STEP 1: Lookup Form */}
          {step === "lookup" && (
            <motion.div
              key="lookup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md bg-white border border-border shadow-xl rounded-2xl p-6 sm:p-8"
            >
              <div className="text-center mb-6">
                <span className="text-xs font-bold text-gold uppercase tracking-wider bg-gold/10 px-3 py-1 rounded-full">
                  Step 1 of 2
                </span>
                <h2 className="text-2xl font-bold text-charcoal mt-3">
                  Check Your Bookings
                </h2>
                <p className="text-sm text-muted mt-2">
                  Enter your WhatsApp number to view your sales and profit records.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-xs text-red-600 rounded-xl">
                  {error}
                </div>
              )}

              <form onSubmit={handleRequestCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal/80 uppercase tracking-wider mb-1.5">
                    WhatsApp Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0801 234 5678 or +234..."
                    className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal/80 uppercase tracking-wider mb-1.5">
                    Your Business Name
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Mama Ngozi Provisions"
                    className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gold hover:bg-gold-dark text-white font-semibold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Checking Account...
                    </>
                  ) : (
                    <>Send Code to WhatsApp</>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 2: Verification Code Input */}
          {step === "verify" && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md bg-white border border-border shadow-xl rounded-2xl p-6 sm:p-8"
            >
              <button
                onClick={() => setStep("lookup")}
                className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-charcoal transition-colors mb-4"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>

              <div className="text-center mb-6">
                <span className="text-xs font-bold text-gold uppercase tracking-wider bg-gold/10 px-3 py-1 rounded-full">
                  Step 2 of 2
                </span>
                <h2 className="text-2xl font-bold text-charcoal mt-3">
                  Enter Code
                </h2>
                <p className="text-sm text-muted mt-2">
                  We sent a 6-digit verification code to your WhatsApp number.
                  Enter it below to confirm it is you.
                </p>
              </div>

              {message && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-xs text-green-700 rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-xs text-red-600 rounded-xl">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal/80 uppercase tracking-wider mb-1.5">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    pattern="\d{6}"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="e.g. 123456"
                    className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm text-center font-bold tracking-[0.4em] text-charcoal focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gold hover:bg-gold-dark text-white font-semibold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying Code...
                    </>
                  ) : (
                    <>Show My Records</>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 3: Dashboard View */}
          {step === "dashboard" && data && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full max-w-7xl space-y-6 py-6"
            >
              {/* Dashboard Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-border p-5 rounded-2xl shadow-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-charcoal">
                      {data.user.businessName}
                    </h2>
                    <span className="text-[10px] font-bold text-gold uppercase tracking-wider bg-gold/10 px-2.5 py-0.5 rounded-full border border-gold/20">
                      {data.user.businessType}
                    </span>
                  </div>
                  <p className="text-sm text-muted mt-1">
                    WhatsApp Number: <span className="font-semibold text-charcoal">{data.user.phone}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleExportCSV}
                    className="inline-flex items-center justify-center gap-2 bg-charcoal hover:bg-black text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Download Records (Excel/CSV)
                  </button>
                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="inline-flex items-center justify-center w-10 h-10 border border-border text-muted hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Simple Metrics Rows */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Metric 1: Money In */}
                <div className="bg-white border border-border p-5 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between text-muted mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Money In (Sales)</span>
                    <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-charcoal">
                    ₦{data.stats.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-muted mt-1">Total revenue collected</p>
                </div>

                {/* Metric 2: Money Out */}
                <div className="bg-white border border-border p-5 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between text-muted mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Money Out (Purchases)</span>
                    <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-charcoal">
                    ₦{data.stats.totalPurchases.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-muted mt-1">Money spent restocking/materials</p>
                </div>

                {/* Metric 3: Profit */}
                <div className="bg-white border border-border p-5 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between text-muted mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Profit (Money Kept)</span>
                    <div className="w-8 h-8 bg-gold/10 rounded-lg flex items-center justify-center">
                      <Coins className="w-4 h-4 text-gold" />
                    </div>
                  </div>
                  <p
                    className={`text-2xl font-black ${
                      data.stats.netProfit >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    ₦{data.stats.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-muted mt-1">
                    {data.stats.netProfit >= 0 ? "You made a profit!" : "You spent more than you sold"}
                  </p>
                </div>

                {/* Metric 4: Total records */}
                <div className="bg-white border border-border p-5 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between text-muted mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Bookings</span>
                    <div className="w-8 h-8 bg-gray-150 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-charcoal" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-charcoal">
                    {data.stats.transactionCount}
                  </p>
                  <p className="text-[10px] text-muted mt-1">Total items logged in WhatsApp</p>
                </div>
              </div>

              {/* Chart & Daily Progress */}
              <div className="bg-white border border-border p-5 rounded-2xl shadow-sm">
                <div className="mb-4">
                  <h3 className="text-base font-bold text-charcoal flex items-center gap-1.5">
                    Sales Trend (Money In Day by Day)
                  </h3>
                  <p className="text-xs text-muted">A timeline showing your store sales logs</p>
                </div>

                {data.chartData.length === 0 ? (
                  <div className="h-[200px] flex items-center justify-center border border-dashed border-border rounded-xl">
                    <p className="text-sm text-muted">No timeline data available. Keep recording daily!</p>
                  </div>
                ) : (
                  <div className="w-full overflow-x-auto">
                    <div className="min-w-[600px] h-[220px] relative px-4">
                      {/* Custom Inline SVG Chart */}
                      {(() => {
                        const width = 800;
                        const height = 180;
                        const padding = 30;

                        // Find max sales for scaling
                        const maxSales = Math.max(
                          ...data.chartData.map((d) => Math.max(d.sales, d.purchases, 1000))
                        );

                        // Scale functions
                        const getX = (index: number) => {
                          if (data.chartData.length <= 1) return width / 2;
                          return padding + (index / (data.chartData.length - 1)) * (width - 2 * padding);
                        };

                        const getY = (value: number) => {
                          return height - padding - (value / maxSales) * (height - 2 * padding);
                        };

                        // SVG lines path strings
                        let salesPathPoints = "";
                        let purchasePathPoints = "";

                        data.chartData.forEach((d, idx) => {
                          const x = getX(idx);
                          const ySales = getY(d.sales);
                          const yPurchases = getY(d.purchases);

                          if (idx === 0) {
                            salesPathPoints = `M ${x} ${ySales}`;
                            purchasePathPoints = `M ${x} ${yPurchases}`;
                          } else {
                            salesPathPoints += ` L ${x} ${ySales}`;
                            purchasePathPoints += ` L ${x} ${yPurchases}`;
                          }
                        });

                        return (
                          <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
                            {/* Grid Lines */}
                            {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
                              const y = padding + r * (height - 2 * padding);
                              return (
                                <g key={i}>
                                  <line
                                    x1={padding}
                                    y1={y}
                                    x2={width - padding}
                                    y2={y}
                                    stroke="#e5e5e5"
                                    strokeWidth="1"
                                    strokeDasharray="4 4"
                                  />
                                  <text
                                    x={padding - 5}
                                    y={y + 3}
                                    textAnchor="end"
                                    fill="#999"
                                    fontSize="8"
                                  >
                                    ₦{Math.round(maxSales * (1 - r)).toLocaleString()}
                                  </text>
                                </g>
                              );
                            })}

                            {/* Sales Path (Green Line) */}
                            {data.chartData.length > 1 && (
                              <path
                                d={salesPathPoints}
                                fill="none"
                                stroke="#16a34a"
                                strokeWidth="3"
                                strokeLinecap="round"
                              />
                            )}

                            {/* Purchases Path (Red Line) */}
                            {data.chartData.length > 1 && (
                              <path
                                d={purchasePathPoints}
                                fill="none"
                                stroke="#dc2626"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeDasharray="3 3"
                              />
                            )}

                            {/* Data points */}
                            {data.chartData.map((d, idx) => {
                              const x = getX(idx);
                              const ySales = getY(d.sales);
                              const yPurchases = getY(d.purchases);

                              return (
                                <g key={idx}>
                                  {/* Sales Dot */}
                                  <circle
                                    cx={x}
                                    cy={ySales}
                                    r="5"
                                    fill="#16a34a"
                                    stroke="#fff"
                                    strokeWidth="1.5"
                                    className="cursor-pointer"
                                  />
                                  {/* Purchases Dot */}
                                  <circle
                                    cx={x}
                                    cy={yPurchases}
                                    r="4"
                                    fill="#dc2626"
                                    stroke="#fff"
                                    strokeWidth="1.5"
                                    className="cursor-pointer"
                                  />
                                  {/* Date label */}
                                  <text
                                    x={x}
                                    y={height - 5}
                                    textAnchor="middle"
                                    fill="#666"
                                    fontSize="9"
                                    fontWeight="bold"
                                  >
                                    {d.date}
                                  </text>
                                </g>
                              );
                            })}
                          </svg>
                        );
                      })()}
                    </div>
                    {/* Legend */}
                    <div className="flex justify-center items-center gap-6 mt-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-0.5 bg-green-600 border border-green-600"></div>
                        <span className="font-bold text-green-700">Money In (Sales)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-0.5 bg-red-600 border-dashed border border-red-600"></div>
                        <span className="font-bold text-red-700">Money Out (Purchases)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Transactions List */}
              <div className="bg-white border border-border p-5 rounded-2xl shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                  <div>
                    <h3 className="text-base font-bold text-charcoal flex items-center gap-2">
                      Your Booking History
                    </h3>
                    <p className="text-xs text-muted">A full list of items logged on WhatsApp</p>
                  </div>
                  <div className="relative max-w-xs w-full">
                    <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Filter by product..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-[#fafafa] border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-charcoal focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                </div>

                {filteredTransactions.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-border rounded-xl">
                    <p className="text-sm text-muted">No matching products found.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-border text-muted uppercase font-bold tracking-wider">
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Type</th>
                          <th className="py-3 px-4">Product</th>
                          <th className="py-3 px-4 text-center">Qty / Unit</th>
                          <th className="py-3 px-4 text-right">Price per Unit</th>
                          <th className="py-3 px-4 text-right">Total Amount</th>
                          <th className="py-3 px-4 text-center">Entered Via</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.map((t) => {
                          const dateObj = t.date ? new Date(t.date) : null;
                          const formattedDate = dateObj
                            ? dateObj.toLocaleDateString("en-NG", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "N/A";

                          return (
                            <tr key={t.id} className="border-b border-border hover:bg-[#fafafa]/50 transition-colors">
                              <td className="py-4 px-4 font-semibold text-charcoal">{formattedDate}</td>
                              <td className="py-4 px-4">
                                {t.type === "SALE" ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                                    IN (Sale)
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                                    OUT (Buy)
                                  </span>
                                )}
                              </td>
                              <td className="py-4 px-4 font-bold text-charcoal">{t.product}</td>
                              <td className="py-4 px-4 text-center text-muted font-medium">
                                {t.quantity} {t.unit}
                              </td>
                              <td className="py-4 px-4 text-right font-medium text-charcoal">
                                ₦{parseFloat(t.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>
                              <td className="py-4 px-4 text-right font-black text-charcoal">
                                ₦{parseFloat(t.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>
                              <td className="py-4 px-4 text-center text-muted capitalize">
                                {t.inputType === "voice" ? "Voice" : "Text"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer copyright */}
      <div className="bg-[#0a0a0a] text-white/30 text-center py-6 text-xs border-t border-white/5">
        &copy; {new Date().getFullYear()} NibBot. All rights reserved.
      </div>
    </main>
  );
}
