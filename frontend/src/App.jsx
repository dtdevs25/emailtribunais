import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, Gavel, Mail, Calendar, 
    Paperclip, History, Menu, X, Search, Bell, LogOut, Eye, EyeOff
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { Dashboard, Tribunais, Campanhas, Historico } from './Pages';

const EmptyState = ({ title, icon: Icon }) => (
    <div className="animate-fade">
        <div className="page-header">
            <h1 className="page-title">{title}</h1>
            <p className="page-subtitle">Página em desenvolvimento.</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '6rem 2rem' }}>
            <div style={{ width: 80, height: 80, background: 'var(--bg-muted)', borderRadius: '50%', display: 'grid', placeItems: 'center', margin: '0 auto 1.5rem' }}>
                <Icon size={40} style={{ color: 'var(--primary)' }} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Disponível em breve</h3>
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
            <motion.div 
                className="login-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="login-logo">
                    <div className="logo-icon" style={{width: 56, height: 56, margin: '0 auto', marginBottom: '1rem', borderRadius: 16}}>
                        <Mail color="white" size={32} />
                    </div>
                </div>
                <h2 style={{fontFamily: 'Outfit', fontWeight: 700}}>Acesso Restrito</h2>
                <p>Gestão de Nomeações e Disparos</p>

                <form onSubmit={handleSubmit} style={{textAlign: 'left'}}>
                    <div className="form-group">
                        <label className="form-label">E-mail</label>
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
                                style={{ paddingRight: '2.5rem' }}
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
                    <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '0.5rem', padding: '1rem'}} disabled={isLoading}>
                        {isLoading ? 'Autenticando...' : 'Entrar no Sistema'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

const Header = ({ collapsed, setCollapsed, onLogout }) => {
    return (
        <header className="header">
            <div className="header-left">
                <a href="/" className="logo-container">
                    <div className="logo-icon">
                        <Mail size={20} />
                    </div>
                    <span className="logo-text">EmailPerícia</span>
                </a>
                
                <button className="menu-toggle" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle menu">
                    <Menu size={20} />
                </button>

                <div className="header-search">
                    <Search size={16} style={{ position: 'absolute', left: 12, color: 'var(--text-light)' }} />
                    <input type="text" placeholder="Buscar tribunais ou campanhas..." />
                </div>
            </div>

            <div className="header-right">
                <button className="menu-toggle" style={{ position: 'relative' }}>
                    <Bell size={20} />
                    <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, background: 'var(--error)', borderRadius: '50%', border: '2px solid var(--bg-card)' }}></span>
                </button>
                
                <div className="user-profile">
                    <div className="avatar">D</div>
                    <div style={{ display: 'none' }} className="user-info">
                        {/* Hidden on small screens, can be styled later */}
                    </div>
                </div>

                <button 
                    onClick={onLogout}
                    className="menu-toggle" 
                    title="Sair do sistema"
                    style={{ color: 'var(--text-muted)' }}
                >
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    );
};

const Sidebar = ({ collapsed }) => {
    return (
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <nav className="sidebar-nav">
                <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <LayoutDashboard size={20} />
                    <span className="nav-text">Dashboard</span>
                </NavLink>
                <NavLink to="/tribunais" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <Gavel size={20} />
                    <span className="nav-text">Tribunais</span>
                </NavLink>
                <NavLink to="/campanhas" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <Calendar size={20} />
                    <span className="nav-text">Campanhas</span>
                </NavLink>
                <NavLink to="/historico" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <History size={20} />
                    <span className="nav-text">Histórico</span>
                </NavLink>
            </nav>
        </aside>
    );
};

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        return localStorage.getItem('isLoggedIn') === 'true';
    });
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Auto-collapse sidebar on mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 1024) {
                setSidebarCollapsed(true);
            } else {
                setSidebarCollapsed(false);
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize(); // Init Check
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
                <Header 
                    collapsed={sidebarCollapsed} 
                    setCollapsed={setSidebarCollapsed} 
                    onLogout={handleLogout}
                />
                
                <div className="main-layout">
                    <Sidebar collapsed={sidebarCollapsed} />
                    
                    <main className={`content-area ${sidebarCollapsed ? 'collapsed' : ''}`}>
                        <Toaster position="top-right" toastOptions={{
                            style: { background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-light)' }
                        }} />
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/tribunais" element={<Tribunais />} />
                            <Route path="/campanhas" element={<Campanhas />} />
                            <Route path="/historico" element={<Historico />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </main>
                </div>
            </div>
        </Router>
    );
};

export default App;
