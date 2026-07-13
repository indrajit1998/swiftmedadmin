import {
  AdjustmentsHorizontalIcon,
  ArrowDownTrayIcon,
  BanknotesIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useMemo, useState } from 'react';
import StatCard from '../components/StatCard';


const DriverWallet = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all'); // all | positive | zero | negative

  const [walletStats, setWalletStats] = useState({
    totalWalletBalance: 0,
    pendingPayouts: 0,
    driversCount: 0,
    negativesCount: 0,
  });

  const [wallets, setWallets] = useState([]);

  // pagination + server state
  const [page, _setPage] = useState(1);
  const [limit, _setLimit] = useState(25);
  const [_total, _setTotal] = useState(0);

  // Fetch admin wallets from backend
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    const token = localStorage.getItem('token');

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (status && status !== 'all') params.append('status', status);
        params.append('page', String(page));
        params.append('limit', String(limit));

        const url = `http://localhost:9004/api/admin/wallets?${params.toString()}`;
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: controller.signal,
        });

        if (!mounted) return;

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to fetch wallets: ${res.status} ${text}`);
        }

        const body = await res.json();
        const items = body?.data?.items || [];
        const tot = body?.data?.total || 0;

        setWallets(
          items.map((w) => ({
            id: w.id || w.driverId,
            name: w.name || '',
            phone: w.phone || '',
            balance: w.balance ?? 0,
            pending: w.pending ?? 0,
            lastPayoutOn: w.lastPayoutOn || null,
          }))
        );

        // compute stats quickly from returned page (server should return global stats if needed)
        const totals = items.reduce(
          (acc, w) => {
            acc.totalWalletBalance += w.balance || 0;
            acc.pendingPayouts += w.pending || 0;
            if ((w.balance || 0) < 0) acc.negativesCount += 1;
            return acc;
          },
          { totalWalletBalance: 0, pendingPayouts: 0, negativesCount: 0 }
        );

        setWalletStats({
          totalWalletBalance: totals.totalWalletBalance,
          pendingPayouts: totals.pendingPayouts,
          driversCount: tot,
          negativesCount: totals.negativesCount,
        });
        _setTotal(tot);
      } catch (err) {
        if (err.name !== 'AbortError') console.error(err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    // debounce search a bit
    const t = setTimeout(fetchData, 200);
    return () => {
      mounted = false;
      controller.abort();
      clearTimeout(t);
    };
  }, [search, status, page, limit]);

  const filtered = useMemo(() => {
    let rows = wallets;
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) => r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || r.phone.includes(q)
      );
    }
    if (status !== 'all') {
      rows = rows.filter((r) =>
        status === 'positive' ? r.balance > 0 : status === 'zero' ? r.balance === 0 : r.balance < 0
      );
    }
    return rows;
  }, [wallets, search, status]);

  const exportCsv = () => {
    // call backend CSV export endpoint so server returns authoritative data
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status && status !== 'all') params.append('status', status);

    const url = `http://localhost:9004/api/admin/wallets/export?${params.toString()}`;
    fetch(url, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Export failed: ${res.status}`);
        const blob = await res.blob();
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `driver_wallets_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
      })
      .catch((err) => console.error(err));
  };

  const stats = [
    {
      title: 'Total Wallet Balance',
      value: `₹${walletStats.totalWalletBalance.toLocaleString('en-IN')}`,
      icon: <BanknotesIcon className="h-8 w-8" />,
    },
    {
      title: 'Pending Payouts',
      value: `₹${walletStats.pendingPayouts.toLocaleString('en-IN')}`,
      icon: <ArrowDownTrayIcon className="h-8 w-8" />,
    },
    {
      title: 'Drivers',
      value: walletStats.driversCount,
      icon: <AdjustmentsHorizontalIcon className="h-8 w-8" />,
    },
    {
      title: 'Negative Balances',
      value: walletStats.negativesCount,
      icon: <AdjustmentsHorizontalIcon className="h-8 w-8" />,
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Driver Wallet</h2>
        <p className="text-gray-600 mt-1">Track balances, pending payouts, and wallet health.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((s, i) => (
          <StatCard key={i} title={s.title} value={s.value} icon={s.icon} isLoading={isLoading} />
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative w-full lg:w-1/2">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by driver, ID or phone"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Balances</option>
              <option value="positive">Positive</option>
              <option value="zero">Zero</option>
              <option value="negative">Negative</option>
            </select>

            <button
              onClick={exportCsv}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <ArrowDownTrayIcon className="h-5 w-5" /> Export
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver ID</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Payout</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">No results</td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                          {r.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{r.name}</div>
                          <div className="text-xs text-gray-500">{r.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold {r.balance<0?'text-red-600':'text-gray-900'}">
                      ₹{r.balance.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-700">
                      ₹{r.pending.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(r.lastPayoutOn).toLocaleDateString('en-IN')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          r.balance > 0
                            ? 'bg-green-100 text-green-800'
                            : r.balance === 0
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {r.balance > 0 ? 'Positive' : r.balance === 0 ? 'Zero' : 'Negative'}
                      </span>
                    </td>
                    
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DriverWallet;
