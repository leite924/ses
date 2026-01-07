import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Mail,
    ShieldCheck,
    User,
    Loader2
} from 'lucide-react';

const SelectionButton: React.FC<{
    active: boolean;
    onClick: () => void;
    icon: any;
    label: string;
    description: string;
}> = ({ active, onClick, icon: Icon, label, description }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center p-6 rounded-[32px] border-2 transition-all transform active:scale-[0.98] group ${active
                ? 'border-indigo-600 bg-indigo-50/50'
                : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
            }`}
    >
        <div className={`p-4 rounded-2xl mr-5 transition-colors ${active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white'
            }`}>
            <Icon className="w-7 h-7" />
        </div>
        <div className="text-left">
            <h4 className={`text-lg font-black tracking-tight transition-colors ${active ? 'text-indigo-900' : 'text-slate-800'}`}>{label}</h4>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{description}</p>
        </div>
        {active && (
            <div className="ml-auto w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/30">
                <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
        )}
    </button>
);

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 lg:p-0 font-outfit">
            <div className="max-w-6xl w-full bg-white rounded-[48px] shadow-2xl shadow-indigo-900/10 overflow-hidden grid lg:grid-cols-2 min-h-[700px]">

                {/* Left Side: Visual/Welcome */}
                <div className="hidden lg:flex flex-col justify-between p-16 bg-slate-900 text-white relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Mail className="w-64 h-64 -rotate-12" />
                    </div>

                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 bg-indigo-600 rounded-[18px] flex items-center justify-center shadow-xl shadow-indigo-600/40 transform -rotate-2">
                            <Mail className="text-white w-6 h-6" />
                        </div>
                        <span className="font-black text-3xl tracking-tighter">SES Flow</span>
                    </div>

                    <div className="relative z-10">
                        <h1 className="text-7xl font-black leading-[0.85] mb-8 tracking-tighter">
                            Domine sua <br />
                            <span className="text-indigo-500">comunicação.</span>
                        </h1>
                        <p className="text-slate-400 text-xl leading-relaxed font-bold italic opacity-80 max-w-sm">
                            Marketing por email de alta performance utilizando a infraestrutura global da Amazon SES.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 relative z-10">
                        <span>SaaS Infrastructure</span>
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
                        <span>v1.0.2</span>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="p-12 lg:p-24 flex flex-col justify-center bg-white relative">
                    <div className="mb-14 text-center lg:text-left animate-in fade-in slide-in-from-top-4 duration-700">
                        <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter leading-none">Acesse o sistema.</h2>
                        <p className="text-slate-400 text-sm font-bold italic tracking-wide">Selecione seu portal de acesso para continuar.</p>
                    </div>

                    <div className="space-y-5 mb-2">
                        <SelectionButton
                            active={false}
                            onClick={() => {
                                setLoading(true);
                                setTimeout(() => navigate('/dashboard'), 1000);
                            }}
                            icon={User}
                            label="Portal do Cliente"
                            description="Gestão de estúdio & leads"
                        />
                        <SelectionButton
                            active={false}
                            onClick={() => {
                                setLoading(true);
                                setTimeout(() => navigate('/admin'), 1000);
                            }}
                            icon={ShieldCheck}
                            label="Administrador SaaS"
                            description="Monitoramento global SES"
                        />
                    </div>

                    {loading && (
                        <div className="mt-14 flex flex-col items-center gap-4 animate-in fade-in duration-500">
                            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 animate-pulse">Sincronizando Sessão Segura...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
