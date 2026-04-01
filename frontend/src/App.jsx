import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, Gavel, Mail, Calendar, 
    Paperclip, History, Settings, ExternalLink, 
    Menu, X, Search, Bell, User, LogOut, ChevronRight,
    TrendingUp, CheckCircle, Clock, AlertCircle, Eye, EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';

// --- COMPONENTS ---

const Dashboard = () => (
    <div className="animate-fade">
        <div className="page-header">
            <h1 className="page-title">Central de Controle</h1>
            <p className="page-subtitle">Olá, Dr. Daniel. Veja o status das suas campanhas de nomeação hoje.</p>
        </div>

        <div className="stats-grid">
            <div className="card stat-card">
                <div className="stat-icon-box" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                    <TrendingUp size={24} />
                </div>
                <div className="stat-value">124</div>
                <div className="stat-label">Envios este mês</div>
                <div style={{ color: 'var(--success)', fontSize: '0.8rem', fontWeight: 600 }}>+12.5% em relação ao período anterior</div>
            </div>
            
            <div className="card stat-card">
                <div className="stat-icon-box" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
                    <Calendar size={24} />
                </div>
                <div className="stat-value">15 Abr</div>
                <div className="stat-label">Próximo Agendamento</div>
                <div style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600 }}>TJ/SP - Solicitação de Nomeação</div>
            </div>

            <div className="card stat-card">
                <div className="stat-icon-box" style={{ background: 'rgba(34, 211, 238, 0.1)', color: 'var(--accent)' }}>
                    <CheckCircle size={24} />
                </div>
                <div className="stat-value">98.2%</div>
                <div className="stat-label">Taxa de Sucesso</div>
                <div style={{ color: 'var(--success)', fontSize: '0.8rem', fontWeight: 600 }}>SMTP Saudável & Ativo</div>
            </div>

            <div className="card stat-card">
                <div className="stat-icon-box" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}>
                    <AlertCircle size={24} />
                </div>
                <div className="stat-value">2</div>
                <div className="stat-label">Falhas de Envio</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Pendentes de reprocessamento</div>
            </div>
        </div>

        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem' }}>Histórico de Atividade Recente</h3>
                <button className="btn-login" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', marginTop: 0 }}>Ver Tudo</button>
            </div>
            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Data/Hora</th>
                            <th>Tribunal</th>
                            <th>Campanha Ativa</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ color: 'var(--text-muted)' }}>Hoje, 11:24</td>
                            <td style={{ fontWeight: 500 }}>TJ/SP - 2ª Vara Cível</td>
                            <td>Apresentação Perito</td>
                            <td><span className="badge badge-success"><CheckCircle size={14}/> ENVIADO</span></td>
                        </tr>
                        <tr>
                            <td style={{ color: 'var(--text-muted)' }}>Ontem, 21:00</td>
                            <td style={{ fontWeight: 500 }}>TRF-3 São Paulo</td>
                            <td>Atualização Cadastral</td>
                            <td><span className="badge badge-success"><CheckCircle size={14}/> ENVIADO</span></td>
                        </tr>
                        <tr>
                            <td style={{ color: 'var(--text-muted)' }}>30/03, 14:30</td>
                            <td style={{ fontWeight: 500 }}>TJ/RJ - 5ª Vara Cível</td>
                            <td>Proposta de Honorários</td>
                            <td><span className="badge badge-success"><CheckCircle size={14}/> ENVIADO</span></td>
                        </tr>
                        <tr>
                            <td style={{ color: 'var(--text-muted)' }}>28/03, 09:15</td>
                            <td style={{ fontWeight: 500 }}>TJ/MG - 1ª Vara Cível</td>
                            <td>Apresentação Perito</td>
                            <td><span className="badge badge-error"><X size={14}/> ERRO SMTP</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

const EmptyState = ({ title, icon: Icon }) => (
    <div className="animate-fade">
        <div className="page-header">
            <h1 className="page-title">{title}</h1>
            <p className="page-subtitle">Configure e gerencie seus {title.toLowerCase()} para automação.</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '6rem 2rem', background: 'rgba(30, 41, 59, 0.4)' }}>
            <div style={{ width: 100, height: 100, background: 'rgba(255,255,255,0.03)', borderRadius: '50%', display: 'grid', placeItems: 'center', margin: '0 auto 2rem' }}>
                <Icon size={48} style={{ opacity: 0.2 }} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Módulo em Desenvolvimento</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>
                Estamos polindo esta funcionalidade para que sua gestão de perícias seja 100% automatizada e profissional.
            </p>
        </div>
    </div>
);

const LoginPage = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate login
        setTimeout(() => {
            if (email === 'daniel-ehs@outlook.com' && password === 'nova@2026') {
                onLogin();
                toast.success('Bem-vindo ao EmailPericia!');
            } else {
                toast.error('Credenciais inválidas.');
            }
            setIsLoading(false);
        }, 800);
    };

    return (
        <div className="login-page">
            <div className="login-bg-blob" style={{ top: '-10%', left: '-10%' }}></div>
            <div className="login-bg-blob" style={{ bottom: '-10%', right: '-10%', background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)', opacity: 0.2 }}></div>
            
            <motion.div 
                className="login-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="login-header">
                    <div className="login-logo">
                        <Mail color="white" size={28} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Login</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Acesse sua conta profissional.</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Usuário</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            placeholder="daniel-ehs@outlook.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Senha</label>
                        <div className="password-input-wrapper">
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                className="form-input" 
                                placeholder="••••••••" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ paddingRight: '3rem' }}
                                required
                            />
                            <button 
                                type="button" 
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <button type="submit" className="btn-login" disabled={isLoading}>
                        {isLoading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Esqueceu sua senha? <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Clique aqui</a>
                </div>
            </motion.div>
        </div>
    );
};

// --- MAIN LAYOUT ---

const Sidebar = ({ collapsed }) => {
    return (
        <motion.div 
            className={`sidebar ${collapsed ? 'collapsed' : ''}`}
            initial={false}
            animate={{ width: collapsed ? 80 : 280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            <div className="logo-container">
                <div className="logo-icon">
                    <Mail color="white" size={24} />
                </div>
                <span className="logo-text">EmailPericia</span>
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <LayoutDashboard className="link-icon" size={20} />
                    <span className="nav-text">Dashboard</span>
                </NavLink>
                <NavLink to="/tribunais" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <Gavel className="link-icon" size={20} />
                    <span className="nav-text">Tribunais</span>
                </NavLink>
                <NavLink to="/templates" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <Mail className="link-icon" size={20} />
                    <span className="nav-text">Templates</span>
                </NavLink>
                <NavLink to="/campanhas" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <Calendar className="link-icon" size={20} />
                    <span className="nav-text">Campanhas</span>
                </NavLink>
                <NavLink to="/anexos" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <Paperclip className="link-icon" size={20} />
                    <span className="nav-text">Anexos</span>
                </NavLink>
                <NavLink to="/historico" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <History className="link-icon" size={20} />
                    <span className="nav-text">Histórico de Envios</span>
                </NavLink>
                <NavLink to="/configuracoes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <Settings className="link-icon" size={20} />
                    <span className="nav-text">Configurações</span>
                </NavLink>
            </nav>

            <div style={{ marginTop: 'auto', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
                <a href="https://vps.perito.com" className="nav-link" target="_blank" rel="noreferrer">
                    <ExternalLink className="link-icon" size={18} />
                    <span className="nav-text">Status VPS</span>
                </a>
            </div>
        </motion.div>
    );
};

const Header = ({ collapsed, setCollapsed, onLogout }) => {
    return (
        <header className="header">
            <div className="header-left">
                <button className="menu-toggle" onClick={() => setCollapsed(!collapsed)}>
                    {collapsed ? <Menu size={20} /> : <X size={20} />}
                </button>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={18} style={{ position: 'absolute', left: 12, color: 'var(--text-muted)' }} />
                    <input 
                        type="text" 
                        placeholder="Pesquisar..." 
                        style={{ 
                            background: 'rgba(255,255,255,0.03)', 
                            border: '1px solid var(--glass-border)', 
                            borderRadius: '10px',
                            padding: '0.6rem 1rem 0.6rem 2.5rem',
                            color: 'white',
                            fontSize: '0.9rem',
                            width: '300px'
                        }}
                    />
                </div>
            </div>

            <div className="header-right">
                <button className="menu-toggle" style={{ position: 'relative' }}>
                    <Bell size={20} />
                    <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, background: 'var(--error)', borderRadius: '50%', border: '2px solid var(--bg-dark)' }}></span>
                </button>
                
                <div className="user-profile">
                    <div className="avatar">D</div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Daniel</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Administrador</span>
                    </div>
                </div>

                <button 
                    onClick={onLogout}
                    className="menu-toggle" 
                    title="Sair do sistema"
                    style={{ color: 'var(--error)' }}
                >
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    );
};

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        return localStorage.getItem('isLoggedIn') === 'true';
    });
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const handleLogin = () => {
        setIsLoggedIn(true);
        localStorage.setItem('isLoggedIn', 'true');
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        localStorage.removeItem('isLoggedIn');
        toast.success('Sessão encerrada.');
    };

    if (!isLoggedIn) {
        return (
            <>
                <Toaster position="top-right" />
                <LoginPage onLogin={handleLogin} />
            </>
        );
    }

    return (
        <Router>
            <div className="app-container">
                <Sidebar collapsed={sidebarCollapsed} />
                
                <div className={`main-wrapper ${sidebarCollapsed ? 'collapsed' : ''}`}>
                    <Header 
                        collapsed={sidebarCollapsed} 
                        setCollapsed={setSidebarCollapsed} 
                        onLogout={handleLogout}
                    />
                    
                    <main className="content-area">
                        <Toaster position="top-right" />
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/tribunais" element={<EmptyState title="Tribunais" icon={Gavel} />} />
                            <Route path="/templates" element={<EmptyState title="Templates" icon={Mail} />} />
                            <Route path="/campanhas" element={<EmptyState title="Campanhas" icon={Calendar} />} />
                            <Route path="/anexos" element={<EmptyState title="Anexos" icon={Paperclip} />} />
                            <Route path="/historico" element={<EmptyState title="Histórico" icon={History} />} />
                            <Route path="/configuracoes" element={<EmptyState title="Configurações" icon={Settings} />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </main>
                </div>
            </div>
        </Router>
    );
};

export default App;
