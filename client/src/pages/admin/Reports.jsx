import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../../services/api';

const tabs = [
  { key: 'admissions', label: 'Admission' },
  { key: 'payments', label: 'Payment' },
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState('admissions');
  const [range, setRange] = useState('monthly');

  const { data: admissions } = useQuery({
    queryKey: ['reports-admissions', range],
    queryFn: () => api.get('/reports/admissions', { params: { range } }).then(r => r.data.data || r.data),
    enabled: activeTab === 'admissions',
  });

  const { data: payments } = useQuery({
    queryKey: ['reports-payments', range],
    queryFn: () => api.get('/reports/payments', { params: { range } }).then(r => r.data.data || r.data),
    enabled: activeTab === 'payments',
  });

  const admissionReport = admissions?.report || [];
  const courseWise = admissions?.courseWise || [];
  const paymentReport = payments?.report || [];
  const methodWise = payments?.methodWise || [];

  const handleExport = (type) => {
    window.open(`/api/reports/export?type=${type}&report=${activeTab}`, '_blank');
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-headline-xl text-on-surface">Reports & Analytics</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Data-driven insights into admissions, payments, and student metrics.</p>
        </div>
        <div className="flex gap-3 items-center">
          <select value={range} onChange={(e) => setRange(e.target.value)} className="h-10 px-3 border border-outline-variant rounded-lg text-body-sm bg-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none">
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
          </select>
          <button onClick={() => handleExport('pdf')} className="h-10 px-4 bg-surface border border-outline-variant text-on-surface rounded-lg text-label-md hover:bg-surface-variant transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span> PDF
          </button>
          <button onClick={() => handleExport('excel')} className="h-10 px-4 bg-primary text-on-primary rounded-lg text-label-md hover:bg-primary-container transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">table_chart</span> Excel
          </button>
        </div>
      </header>

      <div className="flex gap-1 bg-surface-container-low rounded-lg p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-label-md transition-colors ${
              activeTab === tab.key ? 'bg-surface text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'admissions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-surface border border-outline-variant rounded-xl p-6 shadow-sm">
            <h3 className="text-headline-md text-on-surface mb-4">Admission Trends</h3>
            {admissionReport.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={admissionReport}>
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="applicants" fill="#00355f" radius={[4, 4, 0, 0]} name="Applicants" />
                    <Bar dataKey="admitted" fill="#003b35" radius={[4, 4, 0, 0]} name="Admitted" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-on-surface-variant">No admission data</div>
            )}
          </div>
          <div className="lg:col-span-4 bg-surface border border-outline-variant rounded-xl p-6 shadow-sm">
            <h3 className="text-headline-md text-on-surface mb-4">Course-wise Distribution</h3>
            {courseWise.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={courseWise} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="count" nameKey="name" paddingAngle={2}>
                      {courseWise.map((entry, i) => (
                        <Cell key={i} fill={['#00355f', '#855300', '#003b35', '#d3e4fe', '#0f4c81'][i % 5]} />
                      ))}
                    </Pie>
                    <Legend iconType="circle" iconSize={10} formatter={(value) => <span style={{ fontSize: 12, color: '#42474f' }}>{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-on-surface-variant">No course data</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-surface border border-outline-variant rounded-xl p-6 shadow-sm">
            <h3 className="text-headline-md text-on-surface mb-4">Payment Trends</h3>
            {paymentReport.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={paymentReport}>
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v) => `৳${v.toLocaleString()}`} />
                    <Bar dataKey="amount" fill="#855300" radius={[4, 4, 0, 0]} name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-on-surface-variant">No payment data</div>
            )}
          </div>
          <div className="lg:col-span-4 bg-surface border border-outline-variant rounded-xl p-6 shadow-sm">
            <h3 className="text-headline-md text-on-surface mb-4">Payment Methods</h3>
            {methodWise.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={methodWise} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="count" nameKey="method" paddingAngle={2}>
                      {methodWise.map((entry, i) => (
                        <Cell key={i} fill={['#00355f', '#855300', '#003b35', '#d3e4fe'][i % 4]} />
                      ))}
                    </Pie>
                    <Legend iconType="circle" iconSize={10} formatter={(value) => <span style={{ fontSize: 12, color: '#42474f' }}>{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-on-surface-variant">No method data</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
