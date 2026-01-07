import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    Mail,
    Users,
    Layout,
    Settings,
    Send,
    Plus,
    ArrowUpRight,
    Clock,
    CheckCircle2,
    Loader2,
    LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase, isMockMode } from '../lib/supabase';

const MOCK_DATA = {
    studio: { name: 'Estúdio de Demonstração' },
    leads: [
        { id: '1', name: 'Ana Silva', email: 'ana@exemplo.com', status: 'active', created_at: new Date().toISOString() },
        { id: '2', name: 'Bruno Costa', email: 'bruno@exemplo.com', status: 'bounced', created_at: new Date().toISOString() },
        { id: '3', name: 'Carla Dias', email: 'carla@exemplo.com', status: 'active', created_at: new Date().toISOString() },
    ],
    campaigns: [
        { id: '1', name: 'Promoção de Verão', total_recipients: 1540, opened_count: 852, delivered_count: 1538, bounced_count: 2, status: 'completed', sent_at: new Date().toISOString() },
        { id: '2', name: 'Newsletter Mensal', total_recipients: 2100, opened_count: 1050, delivered_count: 2095, bounced_count: 5, status: 'sending', sent_at: new Date().toISOString() },
    ],
    templates: [
        { id: '1', name: 'Boas-vindas', subject: 'Seja bem-vindo ao nosso serviço!' },
        { id: '2', name: 'Recuperação de Carrinho', subject: 'Você esqueceu algo?' },
        { id: '3', name: 'Informativo Semanal', subject: 'As novidades da semana' },
    ]
};

const Dashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [studio, setStudio] = useState<any>(null);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [stats, setStats] = useState([
        { label: 'Total Leads', value: '0', change: '', icon: Users },
        { label: 'Emails Enviados', value: '0', change: '', icon: Mail },
        { label: 'Taxa de Abertura', value: '0%', change: '', icon: BarChart3 },
        { label: 'Templates Ativos', value: '0', icon: Layout },
    ]);
    const [sesRegion, setSesRegion] = useState('us-east-1');
    const [leads, setLeads] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            if (isMockMode) {
                setStudio(MOCK_DATA.studio);
                setCampaigns(MOCK_DATA.campaigns);
                setLeads(MOCK_DATA.leads);
                setTemplates(MOCK_DATA.templates);

                const totalSent = MOCK_DATA.campaigns.reduce((acc, curr) => acc + curr.total_recipients, 0);
                const totalOpened = MOCK_DATA.campaigns.reduce((acc, curr) => acc + curr.opened_count, 0);
                const openRate = ((totalOpened / totalSent) * 100).toFixed(1);

                setStats([
                    { label: 'Total Leads', value: MOCK_DATA.leads.length.toLocaleString(), change: '', icon: Users },
                    { label: 'Emails Enviados', value: totalSent.toLocaleString(), change: '', icon: Mail },
                    { label: 'Taxa de Abertura', value: `${openRate}%`, change: '', icon: BarChart3 },
                    { label: 'Templates Ativos', value: MOCK_DATA.templates.length.toString(), icon: Layout },
                ]);
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: studioUser, error: studioError } = await supabase
                .from('studio_users')
                .select('studio_id, studios(id, name)')
                .eq('user_id', user.id)
                .limit(1)
                .single();

            if (studioError || !studioUser) return;

            const studioInfo = (studioUser as any).studios;
            setStudio(studioInfo);
            const studioId = studioUser.studio_id;

            const [leadsData, campaignsData, templatesData, settingsData] = await Promise.all([
                supabase.from('marketing_leads').select('*').eq('studio_id', studioId).order('created_at', { ascending: false }),
                supabase.from('marketing_campaigns').select('*').eq('studio_id', studioId).order('created_at', { ascending: false }),
                supabase.from('marketing_templates').select('*').eq('studio_id', studioId).order('created_at', { ascending: false }),
                supabase.from('marketing_settings').select('key, value').eq('studio_id', studioId).eq('key', 'aws_region').maybeSingle()
            ]);

            const totalSent = campaignsData.data?.reduce((acc, curr) => acc + (curr.total_recipients || 0), 0) || 0;
            const totalOpened = campaignsData.data?.reduce((acc, curr) => acc + (curr.opened_count || 0), 0) || 0;
            const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0';

            setStats([
                { label: 'Total Leads', value: leadsData.data?.length.toLocaleString() || '0', change: '', icon: Users },
                { label: 'Emails Enviados', value: totalSent.toLocaleString() || '0', change: '', icon: Mail },
                { label: 'Taxa de Abertura', value: `${openRate}%`, change: '', icon: BarChart3 },
                { label: 'Templates Ativos', value: templatesData.data?.length.toString() || '0', icon: Layout },
            ]);

            setLeads(leadsData.data || []);
            setCampaigns(campaignsData.data || []);
            setTemplates(templatesData.data || []);
            if (settingsData.data) setSesRegion(settingsData.data.value);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#f8fafc]">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            </div>
        );
    }

    const renderOverview = () => (
        <div className="animate-in fade-in duration-500">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {stats.map((stat, i) => (
                    <div key={i} className="card p-8 border-0 shadow-xl shadow-slate-200/50 hover:shadow-indigo-500/10 transform hover:-translate-y-1 transition-all group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 bg-indigo-50 rounded-2xl group-hover:bg-indigo-600 transition-colors">
                                <stat.icon className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" />
                            </div>
                        </div>
                        <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest">{stat.label}</h3>
                        <p className="text-4xl font-black text-slate-900 mt-2 tracking-tighter leading-none">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Chart/Table Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 card border-0 shadow-xl shadow-slate-200/50">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="font-black text-2xl text-slate-900 tracking-tight">Últimas Campanhas</h2>
                        <button onClick={() => setActiveTab('campaigns')} className="text-indigo-600 text-sm font-black uppercase tracking-widest hover:underline px-4 py-2 hover:bg-indigo-50 rounded-xl transition-all">Ver todas</button>
                    </div>
                    <div className="space-y-4">
                        {campaigns.length > 0 ? campaigns.slice(0, 5).map((campaign) => (
                            <div key={campaign.id} className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/10 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                                        <Send className="w-6 h-6 text-indigo-600 group-hover:text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-extrabold text-slate-900 text-lg leading-tight">{campaign.name}</h4>
                                        <div className="text-xs text-slate-500 font-bold mt-1 flex items-center gap-2 opacity-60">
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-indigo-500" /> {campaign.sent_at ? new Date(campaign.sent_at).toLocaleDateString() : 'Aguardando'}</span>
                                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> {campaign.total_recipients || 0} destinatários</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-slate-900 mb-1">
                                        {campaign.total_recipients > 0
                                            ? ((campaign.opened_count / campaign.total_recipients) * 100).toFixed(1)
                                            : '0'}% Abertura
                                    </p>
                                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                        <div
                                            className="h-full bg-indigo-600 rounded-full shadow-lg shadow-indigo-500/50 transition-all duration-1000"
                                            style={{ width: `${campaign.total_recipients > 0 ? (campaign.opened_count / campaign.total_recipients) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-12 text-slate-400 font-medium italic">
                                Nenhuma campanha enviada recentemente.
                            </div>
                        )}
                    </div>
                </div>

                <div className="card bg-slate-900 text-white border-0 shadow-2xl shadow-indigo-900/10 overflow-hidden relative">
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-[80px]"></div>
                    <div className="relative z-10 font-outfit">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-600/50">
                            <Settings className="w-6 h-6" />
                        </div>
                        <h2 className="font-black text-2xl mb-2 tracking-tight">Infraestrutura SES</h2>
                        <p className="text-slate-400 text-sm mb-8 leading-relaxed font-medium">
                            Conectado: <strong className="text-white">{sesRegion}</strong>.
                            Métricas globais de integridade e envio.
                        </p>
                        <div className="space-y-4 mb-10">
                            <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5 group hover:bg-white/10 transition-colors">
                                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-none">Status</span>
                                <span className="flex items-center gap-2 text-xs font-black uppercase text-emerald-400">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)] animate-pulse"></div> Ativo
                                </span>
                            </div>
                            <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5 group hover:bg-white/10 transition-colors">
                                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-none">Reputação</span>
                                <span className="text-xs font-black text-indigo-400 uppercase">99.8%</span>
                            </div>
                        </div>
                        <button onClick={() => setActiveTab('settings')} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-indigo-600/30 active:scale-[0.98]">
                            Gerenciar SES
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderLeads = () => (
        <div className="card border-0 shadow-xl shadow-slate-200/50 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="font-black text-3xl text-slate-900 tracking-tight">Público & Leads</h2>
                    <p className="text-slate-500 font-medium">Gerencie sua base de contatos com inteligência.</p>
                </div>
                <div className="flex gap-3">
                    <button className="btn btn-secondary px-6 font-bold text-xs uppercase tracking-widest transform hover:scale-105 transition-all">Importar</button>
                    <button className="btn btn-primary px-6 font-bold text-xs uppercase tracking-widest flex gap-2 shadow-indigo-600/30 transform hover:scale-105 transition-all">
                        <Plus className="w-4 h-4" /> Novo Lead
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                        <tr>
                            <th className="pb-4 font-black">Nome Completo</th>
                            <th className="pb-4 font-black">Email Corporativo</th>
                            <th className="pb-4 font-black">Status</th>
                            <th className="pb-4 font-black text-right">Inscrição</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {leads.length > 0 ? leads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-black text-xs group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                            {lead.name?.charAt(0) || 'U'}
                                        </div>
                                        <span className="font-extrabold text-slate-800">{lead.name || 'Sem nome'}</span>
                                    </div>
                                </td>
                                <td className="py-5 text-slate-600 font-medium">{lead.email}</td>
                                <td className="py-5">
                                    <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${lead.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                        lead.status === 'bounced' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                            'bg-slate-100 text-slate-600'
                                        }`}>
                                        {lead.status}
                                    </span>
                                </td>
                                <td className="py-5 text-right text-slate-500 font-bold text-xs opacity-60">{new Date(lead.created_at).toLocaleDateString()}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="py-12 text-center text-slate-400 font-medium italic">Nenhum lead encontrado na base.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderCampaigns = () => (
        <div className="card animate-in slide-in-from-bottom-4 duration-500 border-0 shadow-xl shadow-slate-200/50">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="font-black text-3xl text-slate-900 tracking-tight">Campanhas</h2>
                    <p className="text-slate-500 font-medium italic">Acompanhe o disparo em tempo real.</p>
                </div>
                <button className="btn btn-primary px-8 py-3 font-black text-xs uppercase tracking-widest flex gap-2 shadow-indigo-600/40">
                    <Plus className="w-4 h-4" /> Nova Campanha
                </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
                {campaigns.length > 0 ? campaigns.map((campaign) => (
                    <div key={campaign.id} className="p-6 rounded-3xl border border-slate-50 hover:border-indigo-100 hover:bg-indigo-50/10 transition-all flex justify-between items-center group">
                        <div className="flex gap-5 items-center">
                            <div className="w-14 h-14 bg-indigo-50 rounded-[22px] flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:-rotate-3">
                                <Send className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-xl text-slate-900 mb-1">{campaign.name}</h3>
                                <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div> Sent: {campaign.total_recipients || 0}</span>
                                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div> Opened: {campaign.opened_count || 0}</span>
                                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-rose-400 rounded-full"></div> Bounced: {campaign.bounced_count || 0}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-10">
                            <div className="text-center">
                                <div className="text-lg font-black text-slate-900">{campaign.delivered_count || 0}</div>
                                <div className="text-[9px] uppercase text-slate-400 font-black tracking-widest">Entregues</div>
                            </div>
                            <div className="bg-slate-100 h-10 w-[2px] rounded-full"></div>
                            <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-tighter ${campaign.status === 'completed' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' :
                                campaign.status === 'sending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                    'bg-slate-100 text-slate-600'
                                }`}>
                                {campaign.status}
                            </span>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-20 text-slate-400 font-medium animate-pulse">Nenhuma campanha registrada.</div>
                )}
            </div>
        </div>
    );

    const renderTemplates = () => (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="font-black text-3xl text-slate-900 tracking-tight leading-none mb-2">Email Design</h2>
                    <p className="text-slate-500 font-medium italic">Seus templates otimizados para conversão.</p>
                </div>
                <button className="btn btn-primary px-8 h-12 font-black text-xs uppercase tracking-widest flex gap-2">
                    <Plus className="w-4 h-4" /> Criar Template
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {templates.length > 0 ? templates.map((template) => (
                    <div key={template.id} className="group relative border-0 card p-0 bg-white rounded-[32px] overflow-hidden shadow-xl shadow-slate-200/50 hover:shadow-indigo-500/20 transform hover:-translate-y-2 transition-all">
                        <div className="h-48 bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 transition-all duration-500">
                            <Layout className="w-16 h-16 text-slate-200 group-hover:text-white/30 transition-all duration-500 group-hover:scale-110" />
                        </div>
                        <div className="p-8">
                            <h3 className="font-black text-xl text-slate-900">{template.name}</h3>
                            <p className="text-sm font-medium text-slate-400 mt-2 truncate italic opacity-80">{template.subject}</p>
                            <div className="mt-8 flex gap-3">
                                <button className="flex-1 py-3 rounded-2xl bg-slate-100 text-[10px] font-black text-slate-600 hover:bg-slate-200 uppercase tracking-widest transition-all">Configurar</button>
                                <button className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all active:scale-95">
                                    <ArrowUpRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full card text-center py-20 text-slate-400 font-medium italic opacity-50 border-dashed border-2">
                        Base de templates vazia. Clique em Criar Template para começar.
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#f8fafc] font-outfit">
            {/* Sidebar 固定 */}
            <aside className="w-72 bg-white border-r border-slate-100 p-8 fixed inset-y-0 left-0 z-50">
                <div className="flex items-center gap-3 mb-14 px-2 cursor-pointer group" onClick={() => setActiveTab('overview')}>
                    <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/40 transform -rotate-2 group-hover:rotate-0 transition-transform">
                        <Mail className="text-white w-6 h-6" />
                    </div>
                    <span className="font-black text-2xl tracking-tighter text-slate-900">SES Flow</span>
                </div>

                <nav className="space-y-2">
                    <NavItem icon={BarChart3} label="Visão Geral" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                    <NavItem icon={Mail} label="Campanhas" active={activeTab === 'campaigns'} onClick={() => setActiveTab('campaigns')} />
                    <NavItem icon={Users} label="Gestão de Leads" active={activeTab === 'leads'} onClick={() => setActiveTab('leads')} />
                    <NavItem icon={Layout} label="Templates" active={activeTab === 'templates'} onClick={() => setActiveTab('templates')} />
                    <div className="pt-8 mt-8 border-t border-slate-100">
                        <NavItem icon={Settings} label="Autenticação SES" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full flex items-center gap-3 px-4 py-4 mt-2 rounded-[22px] font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all"
                        >
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                    </div>
                </nav>

                <div className="absolute bottom-8 left-8 right-8">
                    <div className="p-5 bg-indigo-50 rounded-[28px] border border-indigo-100 group hover:bg-indigo-600 transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-indigo-600 text-sm shadow-sm group-hover:bg-indigo-500 group-hover:text-white">HP</div>
                            <div>
                                <p className="text-xs font-black text-indigo-900 leading-tight group-hover:text-white">Henrique P.</p>
                                <p className="text-[10px] font-bold text-indigo-400 group-hover:text-indigo-200">Plano Pro</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-72 p-10 min-h-screen">
                <header className="flex justify-between items-center mb-12">
                    <div className="animate-in slide-in-from-left duration-700">
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">
                            {activeTab === 'overview' ? `👋 Olá, ${studio?.name || 'User'}!` :
                                activeTab === 'campaigns' ? 'Marketing Insights' :
                                    activeTab === 'leads' ? 'Base de Contatos' :
                                        activeTab === 'templates' ? 'Design Studio' :
                                            'Configurações SES'}
                        </h1>
                        <p className="text-slate-400 font-bold italic tracking-wide text-sm">
                            {activeTab === 'overview' ? 'Sincronizado com AWS SES • Tempo real' : 'Infraestrutura SaaS SES Flow v1.0.2'}
                        </p>
                    </div>
                    {activeTab === 'overview' && (
                        <button className="btn btn-primary px-8 h-12 font-black text-xs uppercase tracking-widest gap-3 flex shadow-indigo-600/40 transform hover:scale-105 transition-all" onClick={() => setActiveTab('campaigns')}>
                            <Plus className="w-4 h-4" />
                            Lançar Campanha
                        </button>
                    )}
                </header>

                <div>
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'leads' && renderLeads()}
                    {activeTab === 'campaigns' && renderCampaigns()}
                    {activeTab === 'templates' && renderTemplates()}
                    {activeTab === 'settings' && (
                        <div className="card max-w-2xl border-0 shadow-2xl shadow-slate-200/50 p-10 rounded-[40px] animate-in slide-in-from-bottom-6 duration-500">
                            <div className="w-16 h-16 bg-slate-100 rounded-[24px] flex items-center justify-center mb-8">
                                <Lock className="w-8 h-8 text-slate-400" />
                            </div>
                            <h2 className="font-black text-3xl text-slate-900 tracking-tight mb-4 leading-none">Credenciais AWS SES</h2>
                            <p className="text-sm text-slate-400 mb-10 leading-relaxed font-bold italic">
                                Insira as chaves de acesso para habilitar o disparo de emails.
                            </p>
                            <form className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Região AWS</label>
                                        <input type="text" className="input bg-slate-50 border-slate-100" defaultValue={sesRegion} />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail de Origem</label>
                                        <input type="email" className="input bg-slate-50 border-slate-100" placeholder="contato@empresa.com" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Key ID</label>
                                    <input type="password" title="Access Key ID" className="input bg-slate-50 border-slate-100" placeholder="AKI..." />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secret Access Key</label>
                                    <input type="password" title="Secret Access Key" className="input bg-slate-50 border-slate-100" placeholder="••••••••••••••••" />
                                </div>
                                <div className="pt-8">
                                    <button type="button" className="w-full h-14 bg-slate-900 hover:bg-indigo-600 text-white rounded-[22px] font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-slate-900/10 active:scale-95">
                                        Vincular Conta AWS
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

interface NavItemProps {
    icon: any;
    label: string;
    active?: boolean;
    onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-4 rounded-[22px] transition-all transform hover:scale-[1.02] active:scale-[0.98] ${active
            ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/20 ring-1 ring-white/10'
            : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
            }`}
    >
        <Icon className={`w-5 h-5 ${active ? 'text-indigo-400' : 'text-slate-400'}`} />
        <span className={`text-xs uppercase tracking-widest ${active ? 'font-black' : 'font-bold'}`}>{label}</span>
        {active && (
            <div className="ml-auto w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
        )}
    </button>
);

export default Dashboard;
