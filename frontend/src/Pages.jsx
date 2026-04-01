import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, Gavel, Mail, Calendar, 
    Paperclip, History, Settings, ExternalLink, 
    Menu, X, Search, Bell, User, LogOut, ChevronRight,
    TrendingUp, CheckCircle, Clock, AlertCircle, Eye, EyeOff, Plus
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from './api';

export const Dashboard = () => {
    const [stats, setStats] = useState({ totalEnvios: 0, enviosSucesso: 0, totalCampanhas: 0, totalTribunais: 0, historico: [] });
    
    useEffect(() => {
        api.get('/dashboard/stats').then(res => setStats(res.data)).catch(err => toast.error('Erro ao carregar dashboard'));
    }, []);

    const sRate = stats.totalEnvios > 0 ? ((stats.enviosSucesso / stats.totalEnvios) * 100).toFixed(1) : 0;

    return (
        <div className="animate-fade">
            <div className="page-header">
                <h1 className="page-title">Central de Controle</h1>
                <p className="page-subtitle">Visão geral do sistema de nomeações.</p>
            </div>

            <div className="stats-grid">
                <div className="card stat-card">
                    <div className="stat-icon-box" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-value">{stats.totalEnvios}</div>
                    <div className="stat-label">Total Enviados</div>
                </div>
                
                <div className="card stat-card">
                    <div className="stat-icon-box" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
                        <Gavel size={24} />
                    </div>
                    <div className="stat-value">{stats.totalTribunais}</div>
                    <div className="stat-label">VTs Cadastradas</div>
                </div>

                <div className="card stat-card">
                    <div className="stat-icon-box" style={{ background: 'rgba(34, 211, 238, 0.1)', color: 'var(--accent)' }}>
                        <CheckCircle size={24} />
                    </div>
                    <div className="stat-value">{sRate}%</div>
                    <div className="stat-label">Taxa de Sucesso</div>
                </div>

                <div className="card stat-card">
                    <div className="stat-icon-box" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}>
                        <Calendar size={24} />
                    </div>
                    <div className="stat-value">{stats.totalCampanhas}</div>
                    <div className="stat-label">Campanhas Ativas</div>
                </div>
            </div>

            <div className="card">
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Envios Recentes / Acompanhamento</h3>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Data/Hora</th>
                                <th>Tribunal</th>
                                <th>Campanha</th>
                                <th>Status</th>
                                <th>Resposta</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.historico.length === 0 && <tr><td colSpan="5" style={{textAlign:'center', color:'var(--text-muted)'}}>Nenhum envio recente.</td></tr>}
                            {stats.historico.map((h, i) => (
                                <tr key={i}>
                                    <td style={{ color: 'var(--text-muted)' }}>{new Date(h.enviado_em).toLocaleString()}</td>
                                    <td style={{ fontWeight: 500 }}>{h.tribunal || 'Desconhecido'}</td>
                                    <td>{h.campanha || h.assunto}</td>
                                    <td>
                                        {h.status === 'enviado' ? 
                                            <span className="badge badge-success"><CheckCircle size={14}/> ENVIADO</span> :
                                            <span className="badge badge-error"><X size={14}/> ERRO: {h.erro_mensagem}</span>
                                        }
                                    </td>
                                    <td style={{color: 'var(--text-muted)', fontSize: '0.8rem'}}>Aguardando (IMAP em Breve)</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export const Tribunais = () => {
    const [tribunais, setTribunais] = useState([]);
    const [bulkText, setBulkText] = useState('');
    const [loading, setLoading] = useState(false);

    const loadData = () => {
        api.get('/tribunais').then(res => setTribunais(res.data)).catch(() => toast.error('Erro ao listar tribunais'));
    }

    useEffect(() => loadData(), []);

    const handleBulkInsert = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const lines = bulkText.split('\n').filter(l => l.trim().length > 0);
            const records = lines.map(line => {
                const parts = line.split(/[;,|/t]/);
                return {
                    nome: parts[0]?.trim(),
                    email: parts[1]?.trim() || 'sem-email@teste.com',
                    estado: parts[2]?.trim() || 'SP'
                };
            });
            
            const res = await api.post('/tribunais/bulk', records);
            toast.success(`${res.data.count} tribunais cadastrados!`);
            setBulkText('');
            loadData();
        } catch(err) {
            toast.error('Falha ao inserir em massa. Formato: Nome; email@trt.jus.br; SP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade">
            <div className="page-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                    <h1 className="page-title">Tribunais e Varas</h1>
                    <p className="page-subtitle">Gerencie ou importe sua base de contatos.</p>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total: {tribunais.length}</div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div className="card" style={{ flex: '1 1 300px' }}>
                    <h3 style={{ marginBottom: '1rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                        <Plus size={18} color="var(--primary)" /> Subir em Massa
                    </h3>
                    <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom:'1rem'}}>
                        Cole os dados copiados do Excel/CSV. Formato esperado por linha:<br/>
                        <b>Nome do Tribunal ; email@contato ; SP</b>
                    </p>
                    <textarea 
                        className="form-input" 
                        style={{ height: '200px', resize: 'vertical' }}
                        value={bulkText}
                        onChange={e => setBulkText(e.target.value)}
                        placeholder={"1ª Vara Cível de São Paulo; vara1@tjsp.jus.br; SP\n2ª Vara do Trabalho; vt2@trt2.jus.br; SP"}
                    ></textarea>
                    <button className="btn-login" style={{width: '100%'}} onClick={handleBulkInsert} disabled={loading || !bulkText}>
                        {loading ? 'Processando...' : 'Importar Dados Colados'}
                    </button>
                </div>

                <div className="card" style={{ flex: '2 1 500px', maxHeight: '600px', overflowY: 'auto' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Base Cadastrada</h3>
                    <table style={{width: '100%'}}>
                        <thead>
                            <tr>
                                <th>Tribunal</th>
                                <th>Email</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tribunais.map(t => (
                                <tr key={t.id}>
                                    <td style={{fontWeight:500}}>{t.nome}</td>
                                    <td style={{color:'var(--accent)'}}>{t.email}</td>
                                    <td><span className="badge badge-warning">{t.estado}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export const Campanhas = () => {
    const [campanhas, setCampanhas] = useState([]);
    const [novaCampanha, setNovaCampanha] = useState({nome: '', assunto: '', corpo_html: '', intervalo_dias: 15});
    const [loading, setLoading] = useState(false);

    const loadData = () => {
        api.get('/campanhas').then(res => setCampanhas(res.data)).catch(() => toast.error('Erro ao listar'));
    };
    useEffect(() => loadData(), []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/campanhas', novaCampanha);
            toast.success('Campanha programada com sucesso!');
            setNovaCampanha({nome: '', assunto: '', corpo_html: '', intervalo_dias: 15});
            loadData();
        } catch(err) {
            toast.error('Erro ao programar campanha.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade">
            <div className="page-header">
                <h1 className="page-title">Criar Campanha e Mensagem</h1>
                <p className="page-subtitle">Crie o e-mail de apresentação e agende o disparo.</p>
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <form className="card" style={{ flex: '2 1 500px' }} onSubmit={handleCreate}>
                    <div className="form-group" style={{marginBottom: '1rem'}}>
                        <label className="form-label">Nome da Campanha (Uso Interno)</label>
                        <input className="form-input" required value={novaCampanha.nome} onChange={e=>setNovaCampanha({...novaCampanha, nome: e.target.value})} placeholder="Ex: Apresentação TRT SP" />
                    </div>
                    
                    <div className="form-group" style={{marginBottom: '1rem'}}>
                        <label className="form-label">Assunto do E-mail</label>
                        <input className="form-input" required value={novaCampanha.assunto} onChange={e=>setNovaCampanha({...novaCampanha, assunto: e.target.value})} placeholder="Apresentação de Perito Judicial - Dr. Daniel" />
                    </div>

                    <div className="form-group" style={{marginBottom: '1rem'}}>
                        <label className="form-label">Corpo do E-mail (HTML ACEITO)</label>
                        <textarea 
                            className="form-input" 
                            style={{ height: '250px' }} 
                            required 
                            value={novaCampanha.corpo_html} 
                            onChange={e=>setNovaCampanha({...novaCampanha, corpo_html: e.target.value})}
                            placeholder="<p>Prezado Juiz da {{nome_tribunal}},</p><p>Gostaria de me colocar a disposição.</p>"
                        ></textarea>
                        <small style={{color:'var(--text-muted)'}}>Variáveis: {`{{nome_tribunal}}`}, {`{{estado}}`}, {`{{cidade}}`}</small>
                    </div>

                    <div className="form-group" style={{marginBottom: '1rem'}}>
                        <label className="form-label">Re-tentativas em Disparos Repetidos (Dias)</label>
                        <input type="number" className="form-input" min="1" value={novaCampanha.intervalo_dias} onChange={e=>setNovaCampanha({...novaCampanha, intervalo_dias: e.target.value})} />
                    </div>

                    <button type="submit" className="btn-login" style={{width:'100%'}} disabled={loading}>
                        {loading? 'Salvando...' : 'Salvar e Agendar Disparos'}
                    </button>
                    <p style={{fontSize: '0.8rem', color:'var(--success)', marginTop: '1rem'}}>
                        <CheckCircle size={14} style={{display:'inline', verticalAlign:'middle'}}/> O servidor verificará envios automaticamente em background.
                    </p>
                </form>

                <div className="card" style={{ flex: '1 1 300px' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Campanhas Cadastradas</h3>
                    {campanhas.length === 0 && <p style={{color:'var(--text-muted)'}}>Nenhuma campanha.</p>}
                    <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
                        {campanhas.map(c => (
                            <div key={c.id} style={{padding:'1rem', background:'rgba(255,255,255,0.03)', borderRadius:'12px', border:'1px solid var(--glass-border)'}}>
                                <strong>{c.nome}</strong>
                                <div style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>Assunto: {c.assunto}</div>
                                <div style={{marginTop:'0.5rem'}}>
                                    <span className="badge badge-success">Ativa</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const Historico = () => {
    const [envios, setEnvios] = useState([]);

    useEffect(() => {
        api.get('/envios').then(res => setEnvios(res.data)).catch(() => toast.error('Erro ao buscar histórico'));
    }, []);

    return (
        <div className="animate-fade">
            <div className="page-header">
                <h1 className="page-title">Histórico Geral de Envios</h1>
                <p className="page-subtitle">Verifique quem recebeu os e-mails ("se deu bom ou ruim").</p>
            </div>
            <div className="card">
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Data/Hora</th>
                                <th>Destinatário (Tribunal)</th>
                                <th>Assunto Enviado</th>
                                <th>Status</th>
                                <th>Resposta (IMAP)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {envios.map(h => (
                                <tr key={h.id}>
                                    <td style={{ color: 'var(--text-muted)' }}>{new Date(h.enviado_em).toLocaleString()}</td>
                                    <td style={{ fontWeight: 500 }}>{h.tribunal || 'N/A'}</td>
                                    <td>{h.assunto}</td>
                                    <td>
                                        {h.status === 'enviado' ? 
                                            <span className="badge badge-success"><CheckCircle size={14}/> SUCESSO</span> :
                                            <span className="badge badge-error" title={h.erro_mensagem}><X size={14}/> ERRO DE REDE/SMTP</span>
                                        }
                                    </td>
                                    <td style={{color: 'var(--text-muted)', fontSize: '0.8rem'}}>Não detectada</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
