import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { FileDown, Loader2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0] });
  const [stats, setStats] = useState(null);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats', { params: dateRange });
      setStats(res.data);
    } catch (e) {
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{ fetchReport(); }, []);

  const exportExcel = () => {
    if (!stats) return;
    const headers = ['Crop','Purchased','Sold','Revenue','Cost','Profit'];
    const rows = (stats.cropStats||[]).map(c=>[
      c.cropName,
      c.totalPurchased,
      c.totalSold,
      c.totalRevenue||0,
      c.totalCost||0,
      c.profit||0
    ]);
    const csv = [headers, ...rows].map(r=>r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">Generate summary reports and export</p>
        </div>
        <button onClick={exportExcel} className="btn-primary flex items-center"><FileDown className="h-5 w-5 mr-2"/>Export CSV</button>
      </div>

      {/* Date Range */}
      <div className="card">
        <div className="flex items-center gap-4">
          <Calendar className="h-5 w-5 text-gray-400"/>
          <input type="date" value={dateRange.startDate} onChange={e=>setDateRange({...dateRange,startDate:e.target.value})} className="input-field"/>
          <span className="text-gray-500">to</span>
          <input type="date" value={dateRange.endDate} onChange={e=>setDateRange({...dateRange,endDate:e.target.value})} className="input-field"/>
          <button onClick={fetchReport} className="btn-secondary">Apply</button>
        </div>
      </div>

      {/* Overview */}
      {loading ? (
        <div className="flex items-center justify-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary-600"/></div>
      ) : stats ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-semibold">₹{(stats.overview.totalRevenue||0).toLocaleString()}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Total Cost</p>
              <p className="text-2xl font-semibold">₹{(stats.overview.totalCost||0).toLocaleString()}</p>
            </div>
            <div className="card">
              <p className={`text-sm text-gray-600`}>Net Profit</p>
              <p className={`text-2xl font-semibold ${stats.overview.netProfit>=0?'text-green-600':'text-red-600'}`}>₹{(stats.overview.netProfit||0).toLocaleString()}</p>
            </div>
          </div>

          <div className="card overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Crop</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Purchased</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Sold</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cost</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Profit</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(stats.cropStats||[]).map(c => (
                  <tr key={c._id}>
                    <td className="table-cell">{c.cropName}</td>
                    <td className="table-cell text-right">{c.totalPurchased}</td>
                    <td className="table-cell text-right">{c.totalSold}</td>
                    <td className="table-cell text-right">₹{(c.totalRevenue||0).toLocaleString()}</td>
                    <td className="table-cell text-right">₹{(c.totalCost||0).toLocaleString()}</td>
                    <td className={`table-cell text-right ${c.profit>=0?'text-green-600':'text-red-600'}`}>₹{(c.profit||0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-gray-500">No data</div>
      )}
    </div>
  );
};

export default Reports;


