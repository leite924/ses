import React, { useState } from 'react';
import { Mail, ShieldCheck, User, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const [accessType, setAccessType] = useState<'client' | 'admin' | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulating redirect for mock mode
        setTimeout(() => {
            if (accessType === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
            setLoading(false);
        }, 1200);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-['Outfit']">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-200/30 blur-[100px] rounded-full"></div>

            <div className="w-full max-w-[1000px] grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[40px] shadow-2xl shadow-indigo-500/10 overflow-hidden relative z-10 border border-white/50 backdrop-blur-xl">

                {/* Left Side: Visual/Welcome */}
                <div className="hidden lg:flex flex-col justify-between p-12 bg-indigo-600 text-white relative">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10">
                            <Mail className="text-white w-6 h-6" />
                        </div>
                        <span className="font-bold text-2xl tracking-tight">SES Flow</span>
                    </div>

                    <div>
                        <h1 className="text-5xl font-bold leading-tight mb-6">Sua comunicação em outro nível.</h1>
                        <p className="text-indigo-100 text-lg leading-relaxed opacity-80">
                            Marketing por email simplificado, potente e totalmente automatizado via Amazon SES.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-medium text-indigo-300">
                        <span>Multi-tenant SaaS Architecture</span>
                        <div className="w-1 h-1 bg-indigo-400 rounded-full"></div>
                        <span>v1.0.2</span>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="p-8 lg:p-16 flex flex-col justify-center bg-white">
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Seja bem-vindo 👋</h2>
                        <p className="text-slate-500">Selecione seu tipo de acesso para continuar.</p>
                    </div>

                    <div className="space-y-4 mb-2">
                        <SelectionButton
                            active={false}
                            onClick={() => {
                                setLoading(true);
                                setTimeout(() => navigate('/dashboard'), 800);
                            }}
                            icon={User}
                            label="Acesso Cliente"
                            description="Gerenciar campanhas e leads"
                        />
                        <SelectionButton
                            active={false}
                            onClick={() => {
                                setLoading(true);
                                setTimeout(() => navigate('/admin'), 800);
                            }}
                            icon={ShieldCheck}
                            label="Acesso Administrador"
                            description="Gestão global do SaaS"
                        />
                    </div>

                    {loading && (
                        <div className="flex justify-center mt-6 animate-in fade-in duration-300">
                            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const SelectionButton: React.FC<{
    active: boolean,
    onClick: () => void,
    icon: any,
    label: string,
    description: string
}> = ({ active, onClick, icon: Icon, label, description }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center p-5 rounded-3xl border-2 transition-all group ${active
            ? 'border-indigo-600 bg-indigo-50/50'
            : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
            }`}
    >
        <div className={`p-3 rounded-2xl mr-4 transition-colors ${active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600'
            }`}>
            <Icon className="w-6 h-6" />
        </div>
        <div className="text-left">
            <h4 className={`font-bold transition-colors ${active ? 'text-indigo-900' : 'text-slate-700'}`}>{label}</h4>
            <p className="text-xs text-slate-500">{description}</p>
        </div>
        {active && (
            <div className="ml-auto w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
            </div>
        )}
    </button>
);

export default Login;
