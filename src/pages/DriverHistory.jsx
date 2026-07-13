import { jsPDF } from "jspdf";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// ===== Mock Data (replace later with API) =====
const DRIVERS = [
  { id: "DRV001", name: "Rajesh Kumar", email: "rajesh@example.com", phone: "+91-9876543210" },
  { id: "DRV002", name: "Anita Sharma", email: "anita@example.com", phone: "+91-9123456780" },
  { id: "DRV003", name: "Vikram Singh", email: "vikram@example.com", phone: "+91-9988776655" },
];

const TRIPS = {
  DRV001: [
    {
      id: "T1001",
      date: "2023-11-01",
      from: "MG Road",
      to: "Airport",
      fare: 250,
      addon: 30,
      gst: 18,
      tax: 10,
      Settlement: 0,
      commission: 40,
      mode: "Cash",
      user: "Pooja",
      invoice: "INV-001",
      status: "Completed",
    },
    {
      id: "T1002",
      date: "2023-11-03",
      from: "Koramangala",
      to: "Church St",
      fare: 180,
      addon: 15,
      gst: 10,
      tax: 8,
      Settlement: 50,
      commission: 32,
      mode: "Online",
      user: "Rohit",
      invoice: "INV-002",
      status: "Completed",
    },
    {
      id: "T1003",
      date: "2023-11-05",
      from: "Indiranagar",
      to: "Brigade Road",
      fare: 120,
      addon: 10,
      gst: 5,
      tax: 7,
      Settlement: 100,
      commission: 20,
      mode: "Cash",
      user: "Karan",
      invoice: "INV-003",
      status: "Cancelled",
    },
  ],
  DRV002: [
    {
      id: "T2001",
      date: "2023-10-21",
      from: "City Center",
      to: "Airport",
      fare: 320,
      addon: 20,
      gst: 18,
      tax: 13,
      Settlement: 0,
      commission: 45,
      mode: "Online",
      user: "Sonia",
      invoice: "INV-004",
      status: "Completed",
    },
  ],
  DRV003: [
    {
      id: "T3001",
      date: "2023-09-11",
      from: "Koramangala",
      to: "Hebbal",
      fare: 420,
      addon: 25,
      gst: 22,
      tax: 15,
      Settlement: 0,
      commission: 60,
      mode: "Cash",
      user: "Mehul",
      invoice: "INV-005",
      status: "Completed",
    },
  ],
};

// ==== Wallet base (example) ====
const BASE_WALLET = 1000;

// ===== Helper: Period Filter =====
const isInPeriod = (dateStr, period) => {
  if (period === "all") return true;

  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfToday = new Date(today);
  const endOfToday = new Date(today);
  endOfToday.setHours(23, 59, 59, 999);

  const startOfYesterday = new Date(today);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const endOfYesterday = new Date(startOfYesterday);
  endOfYesterday.setHours(23, 59, 59, 999);

  const startOf7DaysAgo = new Date(today);
  startOf7DaysAgo.setDate(startOf7DaysAgo.getDate() - 6);

  const startOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
  endOfLastMonth.setHours(23, 59, 59, 999);

  switch (period) {
    case "today":
      return d >= startOfToday && d <= endOfToday;
    case "yesterday":
      return d >= startOfYesterday && d <= endOfYesterday;
    case "last7":
      return d >= startOf7DaysAgo && d <= endOfToday;
    case "thisMonth":
      return d >= startOfThisMonth && d <= endOfToday;
    case "lastMonth":
      return d >= startOfLastMonth && d <= endOfLastMonth;
    default:
      return true;
  }
};

// ===== Component =====
const DriverHistory = () => {
  const navigate = useNavigate();

  const [selectedDriver, setSelectedDriver] = useState(
    new URLSearchParams(window.location.search).get("id") || DRIVERS[0].id
  );
  const [trips, setTrips] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [periodFilter, setPeriodFilter] = useState("last7");
  const [wallet, setWallet] = useState(BASE_WALLET);

  const [page, setPage] = useState(1);
  const limit = 5;

  // When driver changes, load trips and attach originalSettlement
  useEffect(() => {
    const baseTrips = (TRIPS[selectedDriver] || []).map((t) => ({
      ...t,
      originalSettlement:
        typeof t.originalSettlement === "number" ? t.originalSettlement : (t.Settlement || 0),
    }));
    setTrips(baseTrips);

    const url = new URL(window.location.href);
    url.searchParams.set("id", selectedDriver);
    window.history.replaceState({}, "", url.toString());
    setPage(1);
  }, [selectedDriver]);

  const driver = DRIVERS.find((d) => d.id === selectedDriver);

  // Auto-debit wallet for all cash-trip settlements (one-shot effect)
  useEffect(() => {
    const totalCashSettlement = trips.reduce((sum, t) => {
      if (t.mode === "Cash") {
        const s = typeof t.originalSettlement === "number" ? t.originalSettlement : (t.Settlement || 0);
        return sum + s;
      }
      return sum;
    }, 0);

    setWallet(BASE_WALLET - totalCashSettlement);
  }, [trips]);

  // Filter trips
  const filteredTrips = useMemo(() => {
    const q = search.trim().toLowerCase();
    return trips.filter((t) => {
      const matchesSearch =
        t.id.toLowerCase().includes(q) ||
        t.user.toLowerCase().includes(q) ||
        t.from.toLowerCase().includes(q) ||
        t.to.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "All" || t.status === statusFilter;
      const matchesPeriod = isInPeriod(t.date, periodFilter);

      return matchesSearch && matchesStatus && matchesPeriod;
    });
  }, [trips, search, statusFilter, periodFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTrips.length / limit));
  const shown = filteredTrips.slice((page - 1) * limit, page * limit);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, periodFilter]);

  // Totals card summary (lifetime, all trips for that driver)
  const totals = useMemo(() => {
    return {
      totalTrips: trips.length,
      completed: trips.filter((t) => t.status === "Completed").length,
      cancelled: trips.filter((t) => t.status !== "Completed").length,
      totalFare: trips.reduce((s, t) => s + t.fare, 0),
      addon: trips.reduce((s, t) => s + t.addon, 0),
      gst: trips.reduce((s, t) => s + t.gst, 0),
      tax: trips.reduce((s, t) => s + t.tax, 0),
      settlementTotal: trips.reduce(
        (s, t) => s + (typeof t.originalSettlement === "number" ? t.originalSettlement : (t.Settlement || 0)),
        0
      ),
      commission: trips.reduce((s, t) => s + t.commission, 0),
      driverEarning: trips.reduce((s, t) => {
        const baseSettle =
          typeof t.originalSettlement === "number" ? t.originalSettlement : (t.Settlement || 0);
        return s + (t.fare + t.addon - t.gst - t.tax - t.commission - baseSettle);
      }, 0),
    };
  }, [trips]);

  // Only ONLINE trips produce "pending dues" to be settled (wallet not touched)
  const pendingOnlineDues = useMemo(
    () =>
      trips.reduce((sum, t) => {
        if (t.mode === "Online") {
          return sum + (t.Settlement || 0);
        }
        return sum;
      }, 0),
    [trips]
  );

  // ===== Settle ALL ONLINE dues (no wallet effect) =====
  const handleSettleAllOnline = () => {
    if (pendingOnlineDues <= 0) {
      alert("No pending online dues for this driver.");
      return;
    }

    const amount = pendingOnlineDues;
    setTrips((prev) =>
      prev.map((t) =>
        t.mode === "Online" && (t.Settlement || 0) > 0 ? { ...t, Settlement: 0 } : t
      )
    );

    alert(`All online dues (₹${amount.toFixed(2)}) marked as settled.`);
  };

  // ===== GST-style Tax Invoice =====
  const downloadInvoice = (trip) => {
    const doc = new jsPDF();
    const companyName = "SwiftMed Cab Services";
    const companyAddress = "SwiftMed Cab Services\n123, Business Park,\nBengaluru, Karnataka, India";
    const companyGSTIN = "GSTIN: 29ABCDE1234F1Z5"; // example placeholder

    const settlementBase =
      typeof trip.originalSettlement === "number"
        ? trip.originalSettlement
        : (trip.Settlement || 0);

    // Header / Company Block
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("TAX INVOICE", 105, 14, { align: "center" });

    doc.setFontSize(14);
    doc.text(companyName, 14, 24);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const addrLines = companyAddress.split("\n");
    let y = 30;
    addrLines.forEach((line) => {
      doc.text(line, 14, y);
      y += 5;
    });
    doc.text(companyGSTIN, 14, y);
    y += 8;

    // Invoice Info (Right side)
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice No: ${trip.invoice}`, 150, 24, { align: "right" });
    doc.text(`Invoice Date: ${trip.date}`, 150, 30, { align: "right" });
    doc.text(`Trip ID: ${trip.id}`, 150, 36, { align: "right" });

    doc.line(14, y, 196, y);
    y += 8;

    // Driver & Rider block
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Bill To (Driver)", 14, y);
    doc.text("Ride Details", 110, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    // Driver
    doc.text(`Name: ${driver.name}`, 14, y);
    y += 5;
    doc.text(`Driver ID: ${driver.id}`, 14, y);
    y += 5;
    doc.text(`Phone: ${driver.phone}`, 14, y);
    y += 5;
    doc.text(`Email: ${driver.email}`, 14, y);
    y -= 15; // move back up to align ride details on right side

    // Ride / Rider on right
    doc.text(`Rider: ${trip.user}`, 110, y);
    y += 5;
    doc.text(`Payment Mode: ${trip.mode}`, 110, y);
    y += 5;
    doc.text(`From: ${trip.from}`, 110, y);
    y += 5;
    doc.text(`To: ${trip.to}`, 110, y);
    y += 10;

    doc.line(14, y, 196, y);
    y += 8;

    // Fare Breakdown Section Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Fare & Charges Breakdown (INR)", 14, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const netBase = trip.fare + trip.addon;
    const taxableValue = netBase - settlementBase; // example logic
    const totalTax = trip.gst + trip.tax;
    const platformCommission = trip.commission;
    const driverFinal =
      trip.fare + trip.addon - trip.gst - trip.tax - trip.commission - settlementBase;

    const lines = [
      ["Base Fare", trip.fare],
      ["Addon Charges", trip.addon],
      ["Gross Trip Value", netBase],
      ["Settlement / Dues", -settlementBase],
      ["Taxable Value", taxableValue],
      ["GST", trip.gst],
      ["Other Taxes", trip.tax],
      ["Total Tax", totalTax],
      ["Platform Commission", -platformCommission],
    ];

    lines.forEach(([label, amount]) => {
      doc.text(label, 20, y);
      const displayAmount =
        amount >= 0 ? `₹${amount.toFixed(2)}` : `-₹${Math.abs(amount).toFixed(2)}`;
      doc.text(displayAmount, 186, y, { align: "right" });
      y += 6;
    });

    doc.line(14, y, 196, y);
    y += 8;

    // Final Amount
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Net Earning Payable to Driver", 20, y);
    doc.text(`₹${driverFinal.toFixed(2)}`, 186, y, { align: "right" });
    y += 12;

    // Notes
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.text(
      "Note: This is a system generated tax invoice. Earnings are subject to platform terms and applicable taxes.",
      14,
      y,
      { maxWidth: 180 }
    );
    y += 6;
    doc.text(
      "For any dispute related to payout or invoice, please contact support@swiftmed.com within 7 days.",
      14,
      y,
      { maxWidth: 180 }
    );

    doc.save(`${trip.invoice}.pdf`);
  };

  return (
    <div className="p-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 bg-gray-200 px-4 py-1.5 rounded hover:bg-gray-300"
      >
        ← Back
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Driver Trip History</h1>
          <p className="text-sm text-gray-600">
            Uber-style earnings, settlements & GST tax invoices
          </p>
        </div>
        <select
          value={selectedDriver}
          onChange={(e) => setSelectedDriver(e.target.value)}
          className="border rounded px-3 py-2"
        >
          {DRIVERS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.id})
            </option>
          ))}
        </select>
      </div>

      {/* Driver Info */}
      <div className="mt-6 bg-white p-4 rounded shadow flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h3 className="font-semibold text-gray-900">{driver.name}</h3>
          <p className="text-xs text-gray-500 mt-1">
            Driver ID: <span className="font-mono">{driver.id}</span>
          </p>
          <p className="text-sm text-gray-700 mt-1">📧 {driver.email}</p>
          <p className="text-sm text-gray-700">📞 {driver.phone}</p>
        </div>

        <div className="text-sm text-gray-700 space-y-1 text-right">
          <p>
            <span className="font-medium">Total Trips:</span> {totals.totalTrips}
          </p>
          <p>
            <span className="font-medium">Lifetime Driver Earnings:</span>{" "}
            ₹{totals.driverEarning.toFixed(2)}
          </p>
          <p className="font-semibold text-green-600">
            Wallet Balance: ₹{wallet.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Stats Cards (lifetime) */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mt-6">
        {[
          { label: "Total Trips", value: totals.totalTrips },
          { label: "Completed", value: totals.completed },
          { label: "Cancelled", value: totals.cancelled },
          { label: "Total Fare", value: `₹${totals.totalFare.toFixed(2)}` },
          { label: "Addon", value: `₹${totals.addon.toFixed(2)}` },
          { label: "GST", value: `₹${totals.gst.toFixed(2)}` },
          { label: "Tax", value: `₹${totals.tax.toFixed(2)}` },
          { label: "Total Settlement (Cash + Online)", value: `₹${totals.settlementTotal.toFixed(2)}` },
          { label: "Commission", value: `₹${totals.commission.toFixed(2)}` },
          { label: "Driver Earning", value: `₹${totals.driverEarning.toFixed(2)}` },
        ].map((x, i) => (
          <div key={i} className="bg-white p-4 rounded shadow text-center">
            <p className="text-gray-500 text-xs sm:text-sm">{x.label}</p>
            <p className="text-base sm:text-lg font-semibold mt-1">{x.value}</p>
          </div>
        ))}
      </div>

      {/* Wallet / Pending Online Dues strip */}
      <div className="mt-4 bg-white rounded shadow p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <p className="text-sm text-gray-600">Driver Wallet Balance</p>
          <p className="text-lg font-semibold text-green-700">
            ₹{wallet.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Pending Online Trip Dues</p>
          <p className="text-lg font-semibold text-orange-700">
            ₹{pendingOnlineDues.toFixed(2)}
          </p>
        </div>
        <div className="sm:text-right">
          <button
            onClick={handleSettleAllOnline}
            className="bg-blue-700 text-white px-4 py-2 rounded text-sm hover:bg-blue-800 disabled:opacity-50"
            disabled={pendingOnlineDues <= 0}
          >
            Settle All Online Dues
          </button>
          <p className="text-xs text-gray-500 mt-1">
            Cash trips are auto-debited from wallet; only online dues settle here.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mt-6 mb-3">
        <input
          className="border rounded px-3 py-2 w-full"
          placeholder="Search by trip, user, pickup, drop..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="All">All Status</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <select
          value={periodFilter}
          onChange={(e) => setPeriodFilter(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="last7">Last 7 Days</option>
          <option value="thisMonth">This Month</option>
          <option value="lastMonth">Last Month</option>
        </select>
      </div>

      {/* Trip Table */}
      <div className="mt-4 bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {[
                "S.No",
                "Trip ID",
                "User",
                "Date",
                "From",
                "To",
                "Payment",
                "Fare",
                "Addon",
                "GST",
                "Tax",
                "Settlement",
                "Commission",
                "Driver Earning",
                "Invoice",
                "Status",
              ].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-gray-600 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y">
            {shown.length === 0 && (
              <tr>
                <td colSpan={16} className="px-4 py-6 text-center text-gray-500">
                  No trips for current filters.
                </td>
              </tr>
            )}

            {shown.map((t, i) => {
              const baseSettle =
                typeof t.originalSettlement === "number"
                  ? t.originalSettlement
                  : (t.Settlement || 0);

              const driverEarn =
                t.fare + t.addon - t.gst - t.tax - t.commission - baseSettle;
              const isCash = t.mode === "Cash";
              const isCompleted = t.status === "Completed";
              const pendingOnline = !isCash && (t.Settlement || 0) > 0;

              let settlementLabel = "";
              let settlementClass = "";

              if (isCash) {
                if (baseSettle > 0) {
                  settlementLabel = `Settled via Wallet – ₹${baseSettle}`;
                  settlementClass = "bg-green-100 text-green-700";
                } else {
                  settlementLabel = "No Cash Dues";
                  settlementClass = "bg-gray-100 text-gray-700";
                }
              } else {
                if (pendingOnline) {
                  settlementLabel = `Online Due – ₹${t.Settlement}`;
                  settlementClass = "bg-orange-100 text-orange-700";
                } else {
                  settlementLabel = "Settled";
                  settlementClass = "bg-green-100 text-green-700";
                }
              }

              return (
                <tr key={t.id}>
                  <td className="px-4 py-3">{(page - 1) * limit + i + 1}</td>
                  <td className="px-4 py-3 font-mono text-xs">{t.id}</td>
                  <td className="px-4 py-3">{t.user}</td>
                  <td className="px-4 py-3">{t.date}</td>
                  <td className="px-4 py-3">{t.from}</td>
                  <td className="px-4 py-3">{t.to}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        isCash
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {t.mode}
                    </span>
                  </td>
                  <td className="px-4 py-3">₹{t.fare}</td>
                  <td className="px-4 py-3">₹{t.addon}</td>
                  <td className="px-4 py-3">₹{t.gst}</td>
                  <td className="px-4 py-3">₹{t.tax}</td>

                  {/* Settlement Column */}
                  <td className="px-4 py-3">
                    <span className={`${settlementClass} px-2 py-1 rounded text-xs font-medium`}>
                      {settlementLabel}
                    </span>
                  </td>

                  <td className="px-4 py-3">₹{t.commission}</td>
                  <td className="px-4 py-3">₹{driverEarn}</td>

                  {/* Invoice Download */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => downloadInvoice(t)}
                      className="text-indigo-600 underline hover:text-indigo-800 text-xs sm:text-sm"
                    >
                      {t.invoice}
                    </button>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        isCompleted
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-40"
        >
          Prev
        </button>
        <span className="px-4 py-2 text-sm text-gray-700">
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default DriverHistory;
