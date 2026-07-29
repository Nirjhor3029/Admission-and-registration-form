import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, Area, AreaChart,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import api from '../../services/api';

const funnelData = [
  { name: 'Leads', value: 4209, fill: 'rgba(0, 53, 95, 0.2)' },
  { name: 'Applied', value: 3100, fill: 'rgba(0, 53, 95, 0.4)' },
  { name: 'Interviewed', value: 2400, fill: 'rgba(0, 53, 95, 0.6)' },
  { name: 'Offered', value: 2100, fill: 'rgba(0, 53, 95, 0.8)' },
  { name: 'Admitted', value: 1890, fill: '#00355f' },
];

const revenueData = [
  { name: 'Jan', revenue: 250000 },
  { name: 'Feb', revenue: 320000 },
  { name: 'Mar', revenue: 310000 },
  { name: 'Apr', revenue: 390000 },
  { name: 'May', revenue: 410000 },
  { name: 'Jun', revenue: 452800 },
];

const courseData = [
  { name: 'Comp Sci', value: 45, color: '#00355f' },
  { name: 'Business', value: 25, color: '#855300' },
  { name: 'Engineering', value: 20, color: '#003b35' },
  { name: 'Arts', value: 10, color: '#d3e4fe' },
];

const activities = [
  { time: '10 mins ago', text: 'Payment of $1,200 received from Jane Doe.', tag: 'PAYMENT', tagColor: 'secondary' },
  { time: '45 mins ago', text: 'New application submitted for BSc Computer Science.', person: 'Mark Smith', tag: null },
  { time: '2 hours ago', text: 'Payment failed for invoice #INV-4920.', tag: 'FAILED', tagColor: 'error', link: 'Review details' },
  { time: 'Yesterday, 4:30 PM', text: 'Batch enrollment processed for Fall 2024 semester.', detail: '245 students processed.', tag: null },
];

const formatCurrency = (value) => `৳${(value / 1000).toFixed(1)}k`;

export default function Overview() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats').then(r => r.data.data || r.data),
    refetchInterval: 30000,
  });

  const s = stats || { totalLeads: 4209, pendingPayments: 342, admittedStudents: 1890, revenueThisMonth: 452800 };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-headline-xl text-on-surface">Overview</h2>
          <p className="text-body-md text-on-surface-variant mt-1">Today's snapshot of system metrics.</p>
        </div>
        <div className="hidden md:flex gap-2">
          <button className="bg-surface text-primary border border-outline px-4 py-2 rounded-lg text-label-md hover:bg-surface-variant transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">download</span> Export Report
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface border border-outline-variant rounded-xl p-6 flex flex-col justify-between shadow-[0_4px_10px_rgba(0,53,95,0.05)]">
          <div className="flex justify-between items-start mb-4">
            <p className="text-label-md text-on-surface-variant">Total Leads</p>
            <div className="bg-primary-container/20 p-2 rounded-lg text-primary">
              <span className="material-symbols-outlined">campaign</span>
            </div>
          </div>
          <div>
            <h3 className="text-headline-lg text-on-surface">{s.totalLeads?.toLocaleString()}</h3>
            <p className="text-body-sm text-tertiary flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[16px]">trending_up</span> +12% this week
            </p>
          </div>
        </div>

        <div className="bg-surface border border-outline-variant rounded-xl p-6 flex flex-col justify-between shadow-[0_4px_10px_rgba(0,53,95,0.05)]">
          <div className="flex justify-between items-start mb-4">
            <p className="text-label-md text-on-surface-variant">Pending Payments</p>
            <div className="bg-secondary-container/20 p-2 rounded-lg text-secondary">
              <span className="material-symbols-outlined">pending_actions</span>
            </div>
          </div>
          <div>
            <h3 className="text-headline-lg text-on-surface">{s.pendingPayments?.toLocaleString()}</h3>
            <p className="text-body-sm text-error flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[16px]">priority_high</span> Action required
            </p>
          </div>
        </div>

        <div className="bg-surface border border-outline-variant rounded-xl p-6 flex flex-col justify-between shadow-[0_4px_10px_rgba(0,53,95,0.05)]">
          <div className="flex justify-between items-start mb-4">
            <p className="text-label-md text-on-surface-variant">Admitted Students</p>
            <div className="bg-tertiary-container/20 p-2 rounded-lg text-tertiary">
              <span className="material-symbols-outlined">how_to_reg</span>
            </div>
          </div>
          <div>
            <h3 className="text-headline-lg text-on-surface">{s.admittedStudents?.toLocaleString()}</h3>
            <p className="text-body-sm text-on-surface-variant mt-1">Target: 2,000</p>
            <div className="w-full bg-surface-variant rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-tertiary h-1.5 rounded-full" style={{ width: `${Math.min(100, (s.admittedStudents / 2000) * 100)}%` }} />
            </div>
          </div>
        </div>

        <div className="bg-primary text-on-primary rounded-xl p-6 flex flex-col justify-between relative overflow-hidden shadow-[0_4px_10px_rgba(0,53,95,0.05)]">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <p className="text-label-md text-on-primary/80">Revenue This Month</p>
            <div className="bg-white/20 p-2 rounded-lg text-white">
              <span className="material-symbols-outlined">account_balance</span>
            </div>
          </div>
          <div className="relative z-10">
            <h3 className="text-headline-lg text-white">৳{(s.revenueThisMonth / 1000).toFixed(1)}k</h3>
            <p className="text-body-sm text-[#ffb95f] flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[16px]">trending_up</span> +8.4% vs last month
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-surface border border-outline-variant rounded-xl p-6 shadow-[0_4px_10px_rgba(0,53,95,0.05)]">
            <h3 className="text-headline-md text-on-surface mb-4">Admission Funnel</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical" margin={{ left: 80 }}>
                  <XAxis type="number" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" radius={4} barSize={24}>
                    {funnelData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface border border-outline-variant rounded-xl p-6 shadow-[0_4px_10px_rgba(0,53,95,0.05)]">
              <h3 className="text-headline-md text-on-surface mb-4">Revenue Trend</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#003b35" stopOpacity={0.1} />
                        <stop offset="100%" stopColor="#003b35" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={formatCurrency} />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Area type="monotone" dataKey="revenue" stroke="#003b35" fill="url(#revenueGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-surface border border-outline-variant rounded-xl p-6 shadow-[0_4px_10px_rgba(0,53,95,0.05)]">
              <h3 className="text-headline-md text-on-surface mb-4">Course Breakdown</h3>
              <div className="h-[200px] flex justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={courseData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={2}>
                      {courseData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend
                      verticalAlign="middle"
                      align="right"
                      layout="vertical"
                      iconType="circle"
                      iconSize={10}
                      formatter={(value) => <span style={{ fontSize: 12, color: '#42474f' }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-surface border border-outline-variant rounded-xl p-6 shadow-[0_4px_10px_rgba(0,53,95,0.05)] flex flex-col h-full max-h-[800px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-headline-md text-on-surface">Recent Activity</h3>
            <button className="text-primary hover:text-primary-container text-label-sm">View All</button>
          </div>
          <div className="flex-1 overflow-y-auto pr-2">
            <ul className="relative border-l border-outline-variant ml-3 space-y-6">
              {activities.map((a, i) => (
                <li key={i} className="pl-6 relative">
                  <span className={`absolute -left-2.5 top-1 w-5 h-5 rounded-full bg-surface border-2 flex items-center justify-center ${
                    a.tagColor === 'secondary' ? 'border-secondary' :
                    a.tagColor === 'error' ? 'border-error' :
                    a.tag === null ? 'border-primary' : 'border-tertiary'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      a.tagColor === 'secondary' ? 'bg-secondary' :
                      a.tagColor === 'error' ? 'bg-error' :
                      a.tag === null ? 'bg-primary' : 'bg-tertiary'
                    }`} />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-label-sm text-on-surface-variant">{a.time}</span>
                    <p className="text-body-md text-on-surface mt-1">{a.text}</p>
                    {a.person && <span className="text-label-sm text-on-surface mt-1">{a.person}</span>}
                    {a.detail && <span className="text-body-sm text-on-surface-variant mt-1">{a.detail}</span>}
                    {a.tag && (
                      <span className={`inline-flex mt-2 items-center text-[10px] font-bold px-2 py-0.5 rounded-sm w-fit ${
                        a.tagColor === 'secondary' ? 'bg-secondary-container text-on-secondary-container' :
                        a.tagColor === 'error' ? 'bg-error-container text-on-error-container' :
                        'bg-surface-variant text-on-surface'
                      }`}>{a.tag}</span>
                    )}
                    {a.link && <button className="mt-2 text-primary text-label-sm text-left hover:underline">{a.link}</button>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
