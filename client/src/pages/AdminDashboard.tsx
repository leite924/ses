import React, { useState } from 'react';
import {
    LayoutGrid,
    Building2,
    Activity,
    Settings,
    Bell,
    LogOut,
    Search,
    TrendingUp,
    Globe,
    Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen bg-slate-50 font-['Outfit']">
            {/* Admin Sidebar */}
            <aside className="w-64 bg-slate-900 text-slate-300 p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                        <Lock className="text-white w-5 h-5" />
                    </div>
                    <span className="font-bold text-xl text-white">SaaS Admin</span>
                </div>

                <nav className="flex-1 space-y-1">
                    <AdminNavItem icon={LayoutGrid} label="Geral" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                    <AdminNavItem icon={Building2} label="Estúdios/Clientes" active={activeTab === 'studios'} onClick={() => setActiveTab('studios')} />
                    <AdminNavItem icon={Activity} label="Logs do Sistema" active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} />
                    <AdminNavItem icon={Globe} label="API & Webhooks" active={activeTab === 'api'} onClick={() => setActiveTab('api')} />
                    <AdminNavItem icon={Settings} label="Configurações" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                </nav>

                <div className="pt-6 border-t border-slate-800">
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all text-sm font-medium"
                    >
                        <LogOut className="w-5 h-5" />
                        Sair
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Painel Administrativo SaaS</h1>
                        <p className="text-slate-500 mt-1">Gestão global da infraestrutura SES Flow.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="text" placeholder="Buscar estúdio..." className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <button className="relative p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                            <Bell className="w-5 h-5 text-slate-600" />
                            <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white"></div>
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <AdminStatCard label="Total de Estúdios" value="84" icon={Building2} color="indigo" />
                    <AdminStatCard label="Envios Mensais" value="1.2M" icon={TrendingUp} color="emerald" />
                    <AdminStatCard label="Uptime API" value="99.99%" icon={Activity} color="amber" />
                </div>

                {/* Clients Table Placeholder */}
                <div className="card">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-xl text-slate-900">Estúdios Recentemente Ativos</h3>
                        <button className="text-indigo-600 font-bold text-sm hover:underline">Ver todos</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-slate-400 text-xs uppercase tracking-wider font-bold">
                                <tr>
                                    <th className="pb-4">Nome do Estúdio</th>
                                    <th className="pb-4">Plano</th>
                                    <th className="pb-4">Envios (Mes)</th>
                                    <th className="pb-4">Status</th>
                                    <th className="pb-4 text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                <StudioRow name="Creative Pro" plan="Enterprise" volume="450k" status="active" />
                                <StudioRow name="Marketing Box" plan="Business" volume="210k" status="active" />
                                <StudioRow name="Digital Hub" plan="Basic" volume="45k" status="warning" />
                                <StudioRow name="Web Flow Agency" plan="Business" volume="180k" status="active" />
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

const AdminNavItem: React.FC<{ icon: any, label: string, active: boolean, onClick: () => void }> = ({ icon: Icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm ${active
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
    >
        <Icon className="w-5 h-5" />
        {label}
    </button>
);

const AdminStatCard: React.FC<{ label: string, value: string, icon: any, color: string }> = ({ label, value, icon: Icon, color }) => (
    <div className="card border-0 shadow-lg shadow-slate-200">
        <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl bg-${color}-50 text-${color}-600`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-slate-500 text-sm">{label}</p>
                <h4 className="text-3xl font-bold text-slate-900">{value}</h4>
            </div>
        </div>
    </div>
);

const StudioRow: React.FC<{ name: string, plan: string, volume: string, status: string }> = ({ name, plan, volume, status }) => (
    <tr className="group hover:bg-slate-50 transition-colors">
        <td className="py-5">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    {name.charAt(0)}
                </div>
                <span className="font-bold text-slate-800">{name}</span>
            </div>
        </td>
        <td className="py-5">
            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${plan === 'Enterprise' ? 'bg-purple-50 text-purple-600' : 'bg-slate-100 text-slate-600'
                }`}>{plan}</span>
        </td>
        <td className="py-5 font-medium text-slate-600">{volume}</td>
        <td className="py-5">
            <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                <span className="text-xs font-bold text-slate-700 uppercase">{status}</span>
            </div>
        </td>
        <td className="py-5 text-right">
            <button className="text-indigo-600 font-bold text-xs hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">Gerenciar</button>
        </td>
    </tr>
);

export default AdminDashboard;
