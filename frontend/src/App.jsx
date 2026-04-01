import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, Gavel, Mail, Calendar, Paperclip, History, Settings, ExternalLink } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

// Placeholder components (will implement full features in next steps)
const Dashboard = () => (
    <div className="main-content">
        <h1 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <LayoutDashboard className="text-primary" size={32} /> Central de Controle
        </h1>
        <div className="stats-grid">
            <div className="card">
                <h4 style={{ color: 'var(--text-muted)' }}>Média por Mês</h4>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>124 Envios</div>
                <div style={{ color: 'var(--success)', fontSize: '0.875rem' }}>+12% vs mês anterior</div>
            </div>
            <div className="card">
                <h4 style={{ color: 'var(--text-muted)' }}>Próximo Agendamento</h4>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>15 Abr</div>
                <div style={{ color: 'var(--accent)', fontSize: '0.875rem' }}>TJ/SP - Solicitação de Nomeação</div>
            </div>
            <div className="card">
                <h4 style={{ color: 'var(--text-muted)' }}>Taxa de Sucesso</h4>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>98.2%</div>
                <div style={{ color: 'var(--success)', fontSize: '0.875rem' }}>SMTP Saudável</div>
            </div>
        </div>

        <div className="card">
            <h3>Atividade Recente</h3>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Tribunal</th>
                            <th>Campanha</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>31/03 21:00</td>
                            <td>TJ/SP - 2ª Vara Cível</td>
                            <td>Apresentação Perito</td>
                            <td><span className="status-enviado">ENVIADO</span></td>
                        </tr>
                        <tr>
                            <td>30/03 14:30</td>
                            <td>TRF-3 - São Paulo</td>
                            <td>Atualização de Currículo</td>
                            <td><span className="status-enviado">ENVIADO</span></td>
                        </tr>
                        <tr>
                            <td>28/03 09:15</td>
                            <td>TJ/RJ - 5ª Vara Cível</td>
                            <td>Apresentação Perito</td>
                            <td><span className="status-enviado">ENVIADO</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

const EmptyState = ({ title, icon: Icon }) => (
    <div className="main-content">
        <h1><Icon size={32} style={{ marginRight: '1rem' }} /> {title}</h1>
        <div className="card" style={{ marginTop: '2rem', textAlign: 'center', padding: '5rem 2rem' }}>
            <Icon size={80} style={{ opacity: 0.1, marginBottom: '2rem' }} />
            <h3>Em desenvolvimento...</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Esta funcionalidade está sendo preparada para automatizar sua nomeação judicial.</p>
        </div>
    </div>
);

const App = () => {
    return (
        <Router>
            <div className="dashboard-layout">
                <div className="sidebar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem', paddingLeft: '1rem' }}>
                        <div style={{ background: 'var(--primary)', width: 40, height: 40, borderRadius: 8, display: 'grid', placeItems: 'center' }}>
                            <Mail color="white" size={24} />
                        </div>
                        <h2 style={{ fontSize: '1.25rem' }}>EmailPericia</h2>
                    </div>

                    <nav style={{ flex: 1 }}>
                        <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                            <LayoutDashboard size={20} /> Dashboard
                        </NavLink>
                        <NavLink to="/tribunais" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                            <Gavel size={20} /> Tribunais
                        </NavLink>
                        <NavLink to="/templates" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                            <Mail size={20} /> Templates
                        </NavLink>
                        <NavLink to="/campanhas" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                            <Calendar size={20} /> Campanhas
                        </NavLink>
                        <NavLink to="/anexos" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                            <Paperclip size={20} /> Anexos
                        </NavLink>
                        <NavLink to="/historico" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                            <History size={20} /> Histórico
                        </NavLink>
                        <NavLink to="/configuracoes" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                            <Settings size={20} /> Configurações
                        </NavLink>
                    </nav>

                    <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '2rem', opacity: 0.8 }}>
                        <a href="https://vps.perito.com" className="sidebar-link" target="_blank" rel="noreferrer">
                            <ExternalLink size={18} /> VPS Dashboard
                        </a>
                    </div>
                </div>

                <div style={{ flex: 1 }}>
                    <Toaster position="top-right" reverseOrder={false} />
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/tribunais" element={<EmptyState title="Tribunais" icon={Gavel} />} />
                        <Route path="/templates" element={<EmptyState title="Templates" icon={Mail} />} />
                        <Route path="/campanhas" element={<EmptyState title="Campanhas" icon={Calendar} />} />
                        <Route path="/anexos" element={<EmptyState title="Anexos" icon={Paperclip} />} />
                        <Route path="/historico" element={<EmptyState title="Histórico" icon={History} />} />
                        <Route path="/configuracoes" element={<EmptyState title="Configurações" icon={Settings} />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

export default App;
