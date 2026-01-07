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
    Lock,
    ChevronRight,
    SearchCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const navigate = useNavigate();

    const renderOverview = () => (
        <div className="animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <AdminStatCard label="Total de Estúdios" value="84" icon={Building2} color="indigo" />
                <AdminStatCard label="Envios Mensais" value="1.2M" icon={TrendingUp} color="emerald" />
                <AdminStatCard label="Uptime API" value="99.99%" icon={Activity} color="amber" />
            </div>

            <div className="card">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-extrabold text-2xl text-slate-900 tracking-tight">Estúdios Recentemente Ativos</h3>
                    <button onClick={() => setActiveTab('studios')} className="text-indigo-600 font-bold text-sm hover:underline">Ver todos</button>
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
        </div>
    );

    const renderStudios = () => (
        <div className="card animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="font-extrabold text-2xl text-slate-900 tracking-tight">Gestão de Clientes</h3>
                    <p className="text-slate-500 text-sm">Gerencie todos os estúdios conectados ao SES Flow.</p>
                </div>
                <button className="btn btn-primary gap-2">
                    <Building2 className="w-4 h-4" />
                    Novo Estúdio
                </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
                {['Creative Pro', 'Marketing Box', 'Digital Hub', 'Web Flow Agency', 'Studio X', 'Pixel Art'].map((studio) => (
                    <div key={studio} className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/10 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-bold text-slate-400 uppercase">
                                {studio.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-lg">{studio}</h4>
                                <p className="text-xs text-slate-500">Criado em: 12/12/2025 • ID: studio_9283</p>
                            </div>
                        </div>
                        <button className="p-2 hover:bg-indigo-50 rounded-xl transition-colors">
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderLogs = () => (
        <div className="card animate-in slide-in-from-bottom-4 duration-500">
            <h3 className="font-extrabold text-2xl text-slate-900 tracking-tight mb-6 flex items-center gap-2">
                <Activity className="w-6 h-6 text-amber-500" />
                Logs do Sistema
            </h3>
            <div className="space-y-4 font-mono text-xs">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="p-3 bg-slate-50 rounded-lg border-l-4 border-emerald-500">
                        <span className="text-slate-400 mr-2">[2024-01-07 17:50:42]</span>
                        <span className="text-emerald-600 font-bold mr-2">INFO:</span>
                        <span className="text-slate-700">Webhook processado com sucesso para Studio ID: 0921-X</span>
                    </div>
                ))}
                <div className="p-3 bg-slate-50 rounded-lg border-l-4 border-indigo-500">
                    <span className="text-slate-400 mr-2">[2024-01-07 17:48:12]</span>
                    <span className="text-indigo-600 font-bold mr-2">SES:</span>
                    <span className="text-slate-700">Email enviado via send-email function (Region: us-east-1)</span>
                </div>
            </div>
        </div>
    );

    const renderAPI = () => (
        <div className="card animate-in slide-in-from-bottom-4 duration-500">
            <h3 className="font-extrabold text-2xl text-slate-900 tracking-tight mb-4">API & Webhooks</h3>
            <div className="p-6 bg-slate-900 rounded-3xl text-slate-300 relative overflow-hidden mb-6">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Globe className="w-32 h-32" />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">Endpoint Webhook Principal</p>
                <code className="text-lg font-mono text-white">https://api.sesflow.com/v1/webhook</code>
                <div className="mt-4 flex gap-2">
                    <button className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs transition-colors">Copiar URL</button>
                    <button className="px-3 py-1 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-xs text-white transition-colors">Testar Conexão</button>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div>
                        <p className="font-bold text-slate-900">Assinatura SNS (AWS)</p>
                        <p className="text-xs text-slate-500">Status: Verificado</p>
                    </div>
                    <div className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-bold uppercase">Online</div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-slate-50 font-outfit">
            {/* Admin Sidebar */}
            <aside className="w-72 bg-slate-900 text-slate-300 p-6 flex flex-col fixed inset-y-0 left-0">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center transform -rotate-3">
                        <Lock className="text-white w-6 h-6" />
                    </div>
                    <span className="font-black text-2xl text-white tracking-tighter">SaaS Admin</span>
                </div>

                <nav className="flex-1 space-y-2">
                    <AdminNavItem icon={LayoutGrid} label="Geral" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                    <AdminNavItem icon={Building2} label="Estúdios/Clientes" active={activeTab === 'studios'} onClick={() => setActiveTab('studios')} />
                    <AdminNavItem icon={Activity} label="Logs do Sistema" active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} />
                    <AdminNavItem icon={Globe} label="API & Webhooks" active={activeTab === 'api'} onClick={() => setActiveTab('api')} />
                    <AdminNavItem icon={Settings} label="Configurações" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                </nav>

                <div className="pt-6 border-t border-slate-800">
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all text-sm font-bold"
                    >
                        <LogOut className="w-5 h-5" />
                        Sair do Sistema
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 pl-72 p-10 min-h-screen">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">
                            {activeTab === 'overview' ? 'Painel Administrativo' :
                                activeTab === 'studios' ? 'Estúdios' :
                                    activeTab === 'logs' ? 'Logs' :
                                        activeTab === 'api' ? 'Infraestrutura' : 'Configurações'}
                        </h1>
                        <p className="text-slate-500 font-medium italic">Monitorando infraestrutura SES Flow em tempo real.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Buscar no sistema..."
                                className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all w-64 shadow-sm"
                            />
                        </div>
                        <button className="relative p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all hover:scale-105 shadow-sm">
                            <Bell className="w-5 h-5 text-slate-600" />
                            <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>
                        </button>
                    </div>
                </header>

                <div>
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'studios' && renderStudios()}
                    {activeTab === 'logs' && renderLogs()}
                    {activeTab === 'api' && renderAPI()}
                    {activeTab === 'settings' && (
                        <div className="card animate-in slide-in-from-bottom-4 duration-500 max-w-2xl">
                            <h3 className="font-extrabold text-2xl text-slate-900 tracking-tight mb-6">Configurações SaaS</h3>
                            <div className="space-y-6">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-sm font-bold text-slate-900 mb-1">Manutenção do Sistema</p>
                                    <p className="text-xs text-slate-500">Ative para bloquear acesso de novos usuários durante upgrades.</p>
                                    <button className="mt-3 px-4 py-2 bg-slate-200 text-slate-600 rounded-xl text-xs font-bold uppercase transition-all">Desativado</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

const AdminNavItem: React.FC<{ icon: any, label: string, active: boolean, onClick: () => void }> = ({ icon: Icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all font-bold text-sm transform hover:scale-[1.02] active:scale-[0.98] ${active
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/30 ring-1 ring-white/10'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
    >
        <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-500'}`} />
        {label}
    </button>
);

const AdminStatCard: React.FC<{ label: string, value: string, icon: any, color: string }> = ({ label, value, icon: Icon, color }) => (
    <div className="card border-0 shadow-xl shadow-slate-200/50 hover:shadow-indigo-500/10 transition-all transform hover:-translate-y-1">
        <div className="flex items-center gap-5">
            <div className={`p-4 rounded-[20px] bg-${color}-50 text-${color}-600`}>
                <Icon className="w-8 h-8" />
            </div>
            <div>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">{label}</p>
                <h4 className="text-4xl font-black text-slate-900 tracking-tighter">{value}</h4>
            </div>
        </div>
    </div>
);

const StudioRow: React.FC<{ name: string, plan: string, volume: string, status: string }> = ({ name, plan, volume, status }) => (
    <tr className="group hover:bg-slate-50 transition-colors">
        <td className="py-6">
            <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-6">
                    {name.charAt(0)}
                </div>
                <span className="font-extrabold text-slate-800 text-lg">{name}</span>
            </div>
        </td>
        <td className="py-6">
            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${plan === 'Enterprise' ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-slate-100 text-slate-600'
                }`}>{plan}</span>
        </td>
        <td className="py-6 font-bold text-slate-600 text-base">{volume}</td>
        <td className="py-6">
            <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ring-4 ${status === 'active' ? 'bg-emerald-500 ring-emerald-50' : 'bg-amber-500 ring-amber-50'}`}></div>
                <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{status}</span>
            </div>
        </td>
        <td className="py-6 text-right">
            <button className="text-indigo-600 font-extrabold text-xs uppercase tracking-widest hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all border border-transparent hover:border-indigo-100">Gerenciar</button>
        </td>
    </tr>
);

export default AdminDashboard;
