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
    Loader2
} from 'lucide-react';
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
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    const renderOverview = () => (
        <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, i) => (
                    <div key={i} className="card p-6 border border-slate-200">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-slate-50 rounded-lg">
                                <stat.icon className="w-5 h-5 text-indigo-600" />
                            </div>
                        </div>
                        <h3 className="text-slate-500 text-sm font-medium">{stat.label}</h3>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Chart/Table Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-semibold text-lg text-slate-800">Últimas Campanhas</h2>
                        <button onClick={() => setActiveTab('campaigns')} className="text-indigo-600 text-sm font-medium hover:underline">Ver todas</button>
                    </div>
                    <div className="space-y-4">
                        {campaigns.length > 0 ? campaigns.slice(0, 5).map((campaign) => (
                            <div key={campaign.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                                        <Send className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-slate-900">{campaign.name}</h4>
                                        <p className="text-xs text-slate-500 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {campaign.sent_at ? new Date(campaign.sent_at).toLocaleDateString() : 'Aguardando'} • <CheckCircle2 className="w-3 h-3" /> {campaign.total_recipients || 0} destinatários
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-slate-900">
                                        {campaign.total_recipients > 0
                                            ? ((campaign.opened_count / campaign.total_recipients) * 100).toFixed(1)
                                            : '0'}% Abertura
                                    </p>
                                    <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full"
                                            style={{ width: `${campaign.total_recipients > 0 ? (campaign.opened_count / campaign.total_recipients) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-8 text-slate-500 text-sm">
                                Nenhuma campanha enviada recentemente.
                            </div>
                        )}
                    </div>
                </div>

                <div className="card bg-indigo-600 text-white border-0">
                    <h2 className="font-semibold text-lg mb-4">Configuração SES</h2>
                    <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                        Sua conta está conectada à região <strong>{sesRegion}</strong>.
                        Mantenha suas credenciais seguras para garantir o disparo.
                    </p>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center bg-indigo-700/50 p-3 rounded-lg text-xs">
                            <span>SES Status</span>
                            <span className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div> Ativo
                            </span>
                        </div>
                        <div className="flex justify-between items-center bg-indigo-700/50 p-3 rounded-lg text-xs">
                            <span>Reputação</span>
                            <span className="font-bold">99.8%</span>
                        </div>
                    </div>
                    <button onClick={() => setActiveTab('settings')} className="w-full btn bg-white text-indigo-600 mt-8 py-2.5 font-bold hover:bg-indigo-50">
                        Acessar Configurações
                    </button>
                </div>
            </div>
        </>
    );

    const renderLeads = () => (
        <div className="card">
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-semibold text-lg text-slate-800">Seus Leads</h2>
                <div className="flex gap-2">
                    <button className="btn btn-secondary text-sm">Importar</button>
                    <button className="btn btn-primary text-sm flex gap-1"><Plus className="w-4 h-4" /> Novo Lead</button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-100 text-slate-500">
                        <tr>
                            <th className="pb-3 font-medium">Nome</th>
                            <th className="pb-3 font-medium">Email</th>
                            <th className="pb-3 font-medium">Status</th>
                            <th className="pb-3 font-medium text-right">Criado em</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {leads.length > 0 ? leads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-4 font-medium text-slate-900">{lead.name || 'Sem nome'}</td>
                                <td className="py-4 text-slate-600">{lead.email}</td>
                                <td className="py-4">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${lead.status === 'active' ? 'bg-emerald-50 text-emerald-600' :
                                        lead.status === 'bounced' ? 'bg-rose-50 text-rose-600' :
                                            'bg-slate-100 text-slate-600'
                                        }`}>
                                        {lead.status}
                                    </span>
                                </td>
                                <td className="py-4 text-right text-slate-500">{new Date(lead.created_at).toLocaleDateString()}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="py-8 text-center text-slate-500">Nenhum lead encontrado.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderCampaigns = () => (
        <div className="card">
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-semibold text-lg text-slate-800">Campanhas</h2>
                <button className="btn btn-primary text-sm flex gap-1"><Plus className="w-4 h-4" /> Nova Campanha</button>
            </div>
            <div className="space-y-4">
                {campaigns.length > 0 ? campaigns.map((campaign) => (
                    <div key={campaign.id} className="p-4 rounded-xl border border-slate-100 hover:border-indigo-200 transition-all flex justify-between items-center">
                        <div className="flex gap-4 items-center">
                            <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                                <Send className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">{campaign.name}</h3>
                                <div className="flex gap-3 text-xs text-slate-500 mt-1">
                                    <span>Sent: {campaign.total_recipients || 0}</span>
                                    <span>Opened: {campaign.opened_count || 0}</span>
                                    <span>Bounced: {campaign.bounced_count || 0}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <div className="text-sm font-bold text-slate-900">{campaign.delivered_count || 0}</div>
                                <div className="text-[10px] uppercase text-slate-400 font-bold">Entregues</div>
                            </div>
                            <div className="bg-slate-100 h-8 w-[1px]"></div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${campaign.status === 'completed' ? 'bg-indigo-50 text-indigo-600' :
                                campaign.status === 'sending' ? 'bg-amber-50 text-amber-600' :
                                    'bg-slate-100 text-slate-600'
                                }`}>
                                {campaign.status}
                            </span>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-8 text-slate-500">Nenhuma campanha encontrada.</div>
                )}
            </div>
        </div>
    );

    const renderTemplates = () => (
        <div className="card">
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-semibold text-lg text-slate-800">Seus Templates</h2>
                <button className="btn btn-primary text-sm flex gap-1"><Plus className="w-4 h-4" /> Criar Template</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.length > 0 ? templates.map((template) => (
                    <div key={template.id} className="group relative border border-slate-100 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-indigo-500/10 transition-all">
                        <div className="h-40 bg-slate-50 flex items-center justify-center border-b border-slate-50 group-hover:bg-indigo-50/50 transition-colors">
                            <Layout className="w-12 h-12 text-slate-200 group-hover:text-indigo-200 transition-colors" />
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-slate-900">{template.name}</h3>
                            <p className="text-xs text-slate-500 mt-1 truncate">{template.subject}</p>
                            <div className="mt-4 flex gap-2">
                                <button className="flex-1 py-2 rounded-lg bg-slate-50 text-xs font-bold text-slate-600 hover:bg-slate-100">Editar</button>
                                <button className="px-3 py-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors">
                                    <ArrowUpRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full text-center py-8 text-slate-500">Nenhum template encontrado.</div>
                )}
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#f8fafc]">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-[#e2e8f0] p-6 hidden md:block">
                <div className="flex items-center gap-2 mb-10 px-2 cursor-pointer" onClick={() => setActiveTab('overview')}>
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <Mail className="text-white w-5 h-5" />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-indigo-900">SES Flow</span>
                </div>

                <nav className="space-y-1">
                    <NavItem icon={BarChart3} label="Dashboard" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                    <NavItem icon={Mail} label="Campanhas" active={activeTab === 'campaigns'} onClick={() => setActiveTab('campaigns')} />
                    <NavItem icon={Users} label="Líderes & Listas" active={activeTab === 'leads'} onClick={() => setActiveTab('leads')} />
                    <NavItem icon={Layout} label="Templates" active={activeTab === 'templates'} onClick={() => setActiveTab('templates')} />
                    <div className="pt-4 mt-4 border-t border-[#f1f5f9]">
                        <NavItem icon={Settings} label="Configurações" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <div className="animate-in slide-in-from-left duration-500">
                        <h1 className="text-2xl font-bold text-slate-900">
                            {activeTab === 'overview' ? `Bem-vindo, ${studio?.name || 'Especialista'}!` :
                                activeTab === 'campaigns' ? 'Campanhas de Marketing' :
                                    activeTab === 'leads' ? 'Gerenciamento de Leads' :
                                        activeTab === 'templates' ? 'Templates de Email' :
                                            'Configurações SES'}
                        </h1>
                        <p className="text-slate-500">
                            {activeTab === 'overview' ? 'Aqui está o desempenho das suas campanhas hoje.' : 'Gerencie seu sistema de comunicação com precisão.'}
                        </p>
                    </div>
                    {activeTab === 'overview' && (
                        <button className="btn btn-primary gap-2 flex" onClick={() => setActiveTab('campaigns')}>
                            <Plus className="w-4 h-4" />
                            Nova Campanha
                        </button>
                    )}
                </header>

                <div className="animate-in fade-in duration-700">
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'leads' && renderLeads()}
                    {activeTab === 'campaigns' && renderCampaigns()}
                    {activeTab === 'templates' && renderTemplates()}
                    {activeTab === 'settings' && (
                        <div className="card max-w-2xl">
                            <h2 className="font-semibold text-lg text-slate-800 mb-6">Configurações da AWS SES</h2>
                            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                                Insira suas credenciais da Amazon SES para que o sistema possa enviar emails em seu nome.
                                Recomendamos usar um usuário IAM com permissões apenas para SES.
                            </p>
                            <form className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">AWS Region</label>
                                        <input type="text" className="input w-full" defaultValue={sesRegion} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">From Email</label>
                                        <input type="email" className="input w-full" placeholder="contato@empresa.com" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">AWS Access Key ID</label>
                                    <input type="password" title="AWS Access Key ID" className="input w-full" placeholder="AKI..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">AWS Secret Access Key</label>
                                    <input type="password" title="AWS Secret Access Key" className="input w-full" placeholder="••••••••••••••••" />
                                </div>
                                <div className="pt-4">
                                    <button type="button" className="btn btn-primary w-full">Salvar Configurações</button>
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
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${active
            ? 'bg-indigo-50 text-indigo-600 font-medium'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
    >
        <Icon className={`w-5 h-5 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
        <span className="text-sm">{label}</span>
    </button>
);

export default Dashboard;
