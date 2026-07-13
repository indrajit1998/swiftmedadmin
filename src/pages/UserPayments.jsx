import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const UserPayments = () => {
  const { user } = useAuth(); // logged-in admin
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // 🔹 Convert Backend Booking to UI Format
  const mapBackendPayments = backendPayments => {
    return backendPayments.map(b => {
      const addOnTotal = (b.addOns || []).reduce((sum, a) => sum + a.price * (a.qty || 1), 0);

      return {
        id: b._id,
        user: b.user?.name || 'Unknown User',
        phone: b.user?.phone || 'XXXXXXXXXX',
        from: b.pickup,
        to: b.destination,
        addonFees: `₹${addOnTotal}`,
        amount: `₹${b.fare}`,
        date: new Date(b.createdAt).toLocaleDateString(),
        time: new Date(b.createdAt).toLocaleTimeString(),
        status:
          b.status === 'completed' ? 'Success' : b.status === 'cancelled' ? 'Cancelled' : b.status,
      };
    });
  };

  // 🔥 Fetch payment history from backend
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get('/admin/dashboard/users/payments');

        console.log('RAW USER PAYMENTS:', res.data);

        const mapped = mapBackendPayments(res.data.payments);
        setPayments(mapped);
      } catch (err) {
        console.error('❌ Payment fetch error:', err);
      }
    };

    fetchPayments();
  }, []);

  // 📌 Parse currency
  const parseCurrency = s =>
    isFinite(parseFloat(String(s).replace(/[^0-9.-]+/g, '')))
      ? parseFloat(String(s).replace(/[^0-9.-]+/g, ''))
      : 0;

  // 📄 Invoice PDF
  const generateInvoice = payment => {
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      doc.setFontSize(18).setFont(undefined, 'bold').text('SwiftMed', 40, 40);

      doc.setFontSize(11).text('Bengaluru, India', 40, 58);
      doc.text('support@swiftmed.example', 40, 72);

      const invoiceNo = `INV-${payment.id}`;
      doc.text(`Invoice No: ${invoiceNo}`, 420, 40);
      doc.text(`Date: ${payment.date}`, 420, 58);
      doc.text(`Transaction ID: ${payment.id}`, 420, 72);

      const base = parseCurrency(payment.amount);
      const addon = parseCurrency(payment.addonFees);
      const baseFare = +(base - addon).toFixed(2);
      const taxRate = 0.05;

      const lineItems = [
        {
          desc: 'Base Fare',
          qty: 1,
          unit: baseFare,
          tax: +(baseFare * taxRate).toFixed(2),
          amount: +(baseFare + baseFare * taxRate).toFixed(2),
        },
      ];

      if (addon > 0) {
        lineItems.push({
          desc: 'Addon Fees',
          qty: 1,
          unit: addon,
          tax: 0,
          amount: addon,
        });
      }

      autoTable(doc, {
        startY: 110,
        head: [['S.No', 'Description', 'Qty', 'Unit (₹)', 'Tax (₹)', 'Amount (₹)']],
        body: lineItems.map((it, i) => [
          i + 1,
          it.desc,
          it.qty,
          it.unit.toFixed(2),
          it.tax.toFixed(2),
          it.amount.toFixed(2),
        ]),
        theme: 'grid',
        styles: { fontSize: 10 },
      });

      const afterY = doc.lastAutoTable?.finalY || 240;
      autoTable(doc, {
        startY: afterY + 10,
        theme: 'plain',
        body: [
          ['Subtotal', `₹${baseFare.toFixed(2)}`],
          ['Tax', `₹${(baseFare * taxRate).toFixed(2)}`],
          ['Grand Total', `₹${base.toFixed(2)}`],
        ],
        styles: { fontSize: 10 },
        columnStyles: {
          0: { halign: 'right', cellWidth: 300 },
          1: { halign: 'right', cellWidth: 120 },
        },
      });

      doc.setFontSize(9);
      doc.text(
        'Thank you for choosing SwiftMed. This is a computer-generated invoice.',
        40,
        doc.internal.pageSize.height - 40,
      );
      doc.save(`${invoiceNo}.pdf`);
    } catch {
      alert('Failed to generate invoice PDF.');
    }
  };

  // 🧮 Counts
  const counts = useMemo(() => {
    return {
      total: payments.length,
      success: payments.filter(p => p.status === 'Success').length,
      refunded: payments.filter(p => p.status === 'Refunded').length,
      cancelled: payments.filter(p => p.status === 'Cancelled').length,
    };
  }, [payments]);

  // 🔍 Filter search + status
  const filteredPayments = useMemo(() => {
    const q = search.trim().toLowerCase();
    return payments.filter(p => {
      if (statusFilter !== 'All' && p.status !== statusFilter) return false;
      if (!q) return true;
      return p.user.toLowerCase().includes(q) || String(p.id).toLowerCase().includes(q);
    });
  }, [payments, search, statusFilter]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Payments</h1>
          <p className="text-gray-600 mt-1">Live history of real transactions made by users.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or transaction..."
            className="w-full sm:w-72 border border-gray-300 rounded-md px-3 py-2"
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full sm:w-44 border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="All">All Payments</option>
            <option value="Success">Success</option>
            <option value="Refunded">Refunded</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Status Counts */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
        {[
          { label: 'Total Payments', value: counts.total, color: 'text-gray-900' },
          { label: 'Success', value: counts.success, color: 'text-green-700' },
          { label: 'Refunded', value: counts.refunded, color: 'text-gray-700' },
          { label: 'Cancelled', value: counts.cancelled, color: 'text-yellow-700' },
        ].map((c, i) => (
          <div key={i} className="bg-white shadow p-4 rounded-lg">
            <div className="text-sm text-gray-500">{c.label}</div>
            <div className={`text-2xl font-semibold mt-1 ${c.color}`}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Payments Table */}
      <div className="mt-8 overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {[
                'S.No',
                'Transaction ID',
                'Name',
                'Phone',
                'From',
                'To',
                'Addon Fees',
                'Time',
                'Date',
                'Amount',
                'Status',
                'PDF',
              ].map((h, idx) => (
                <th key={idx} className="px-3 py-3 text-left font-semibold text-gray-900">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredPayments.map((p, i) => (
              <tr key={p.id}>
                <td className="px-3 py-3">{i + 1}</td>
                <td className="px-3 py-3">{p.id}</td>
                <td className="px-3 py-3">{p.user}</td>
                <td className="px-3 py-3">{p.phone}</td>
                <td className="px-3 py-3">{p.from}</td>
                <td className="px-3 py-3">{p.to}</td>
                <td className="px-3 py-3">{p.addonFees}</td>
                <td className="px-3 py-3">{p.time}</td>
                <td className="px-3 py-3">{p.date}</td>
                <td className="px-3 py-3">{p.amount}</td>
                <td className="px-3 py-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-semibold ${
                      p.status === 'Success'
                        ? 'bg-green-100 text-green-700'
                        : p.status === 'Cancelled'
                        ? 'bg-yellow-100 text-yellow-700'
                        : p.status === 'Refunded'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <button
                    onClick={() => generateInvoice(p)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-xs"
                  >
                    PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserPayments;
