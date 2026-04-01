import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, Gavel, Mail, Calendar, Paperclip, 
    History, TrendingUp, CheckCircle, Clock, AlertCircle, X, Plus, UploadCloud, Pencil, Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from './api';
import { 
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

export const Dashboard = () => {
    const [stats, setStats] = useState({ totalEnvios: 0, enviosSucesso: 0, totalCampanhas: 0, totalTribunais: 0, historico: [] });
    
    useEffect(() => {
        api.get('/dashboard/stats').then(res => setStats(res.data)).catch(err => toast.error('Erro ao carregar dashboard'));
    }, []);

    const sRate = stats.totalEnvios > 0 ? ((stats.enviosSucesso / stats.totalEnvios) * 100).toFixed(1) : 0;
    const failures = stats.totalEnvios - stats.enviosSucesso;

    const pieData = [
        { name: 'Sucesso', value: stats.enviosSucesso },
        { name: 'Falhas', value: failures > 0 ? failures : 0 }
    ];

    const COLORS = ['#10b981', '#ef4444'];

    return (
        <div className="animate-fade">
            <div className="page-header" style={{ marginBottom: '2.5rem' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: '2rem', background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.25rem' }}>Visão Geral</h1>
                    <p className="page-subtitle" style={{ fontSize: '1rem' }}>Métricas de desempenho e entregabilidade em tempo real.</p>
                </div>
            </div>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div className="card stat-card" style={{ background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="stat-label">Total de Disparos</div>
                            <div className="stat-value">{stats.totalEnvios}</div>
                        </div>
                        <div className="stat-icon-box" style={{ background: 'var(--primary-glow)', color: 'var(--primary)', boxShadow: '0 4px 15px rgba(79, 70, 229, 0.2)' }}>
                            <Mail size={24} />
                        </div>
                    </div>
                    <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 500 }}>
                        <TrendingUp size={14} /> Atualizado agora
                    </div>
                </div>
                
                <div className="card stat-card" style={{ background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="stat-label">Base de Tribunais</div>
                            <div className="stat-value">{stats.totalTribunais}</div>
                        </div>
                        <div className="stat-icon-box" style={{ background: 'rgba(14, 165, 233, 0.1)', color: 'var(--secondary)', boxShadow: '0 4px 15px rgba(14, 165, 233, 0.2)' }}>
                            <Gavel size={24} />
                        </div>
                    </div>
                    <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 500 }}>Contatos ativos na base</div>
                </div>

                <div className="card stat-card" style={{ background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="stat-label">Campanhas Ativas</div>
                            <div className="stat-value">{stats.totalCampanhas}</div>
                        </div>
                        <div className="stat-icon-box" style={{ background: 'var(--warning-bg)', color: 'var(--warning)', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.2)' }}>
                            <Calendar size={24} />
                        </div>
                    </div>
                    <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 500 }}>Em andamento</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
                <div className="card" style={{ padding: '2rem', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>Taxa de Eficiência</h3>
                    <div style={{ flex: 1, minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-1px' }}>{sRate}%</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Entregas</div>
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <defs>
                                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feDropShadow dx="0" dy="5" stdDeviation="8" floodOpacity="0.15" />
                                    </filter>
                                </defs>
                                <Pie
                                    data={pieData}
                                    innerRadius={75}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                    filter="url(#shadow)"
                                    cornerRadius={12}
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '1rem', fontWeight: 500 }}
                                    itemStyle={{ color: 'var(--text-main)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card" style={{ padding: '2rem', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>Volume Recente Transmitido</h3>
                    <div style={{ flex: 1, minHeight: 280 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.historico.slice(0, 10).reverse()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <XAxis dataKey="campanha" hide />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-light)' }} />
                                <Tooltip 
                                    cursor={{fill: 'var(--bg-muted)', opacity: 0.5}} 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '1rem' }}
                                />
                                <Bar dataKey="id" fill="var(--primary)" radius={[8, 8, 8, 8]} name="Disparos" maxBarSize={40}>
                                    {stats.historico.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === stats.historico.length - 1 ? 'var(--primary)' : 'var(--primary-glow)'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            
            <div className="card" style={{ border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>Recentes & Ocorrencias</h3>
                <div className="table-wrapper">
                    <table style={{ background: 'transparent' }}>
                        <thead>
                            <tr>
                                <th style={{ background: 'transparent', borderBottom: '1px solid var(--border-light)' }}>Destino / Vara</th>
                                <th style={{ background: 'transparent', borderBottom: '1px solid var(--border-light)' }}>Campanha Executada</th>
                                <th style={{ background: 'transparent', borderBottom: '1px solid var(--border-light)' }}>Horário</th>
                                <th style={{ background: 'transparent', borderBottom: '1px solid var(--border-light)' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.historico.length === 0 && <tr><td colSpan="4" style={{textAlign:'center', color:'var(--text-light)', padding: '3rem'}}>Monitoramento ocioso. Nenhum envio recente.</td></tr>}
                            {stats.historico.map((h, i) => (
                                <tr key={i} style={{ transition: 'background 0.2s', cursor: 'default' }}>
                                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{h.tribunal || 'Não Identificado'}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{h.campanha || h.assunto}</td>
                                    <td style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>{new Date(h.enviado_em).toLocaleString([], {hour: '2-digit', minute:'2-digit', day:'2-digit', month:'2-digit'})}</td>
                                    <td>
                                        {h.status === 'enviado' ? 
                                            <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)' }}><CheckCircle size={14}/> Entregue</span> :
                                            <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: '1px solid rgba(239, 68, 68, 0.2)' }}><X size={14}/> Falha</span>
                                        }
                                    </td>
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editTribunal, setEditTribunal] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const loadData = () => {
        api.get('/tribunais').then(res => setTribunais(res.data)).catch(() => toast.error('Erro ao listar tribunais'));
    }

    useEffect(() => loadData(), []);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            setBulkText(evt.target.result);
            toast.success("Massa de dados carregada do arquivo!");
        };
        reader.readAsText(file);
    };

    const handleDelete = async (t) => {
        setLoading(true);
        try {
            await api.delete(`/tribunais/${t.id}`);
            toast.success('Tribunal removido permanentemente!');
            setDeleteConfirm(null);
            loadData();
        } catch (err) {
            toast.error('Erro ao remover tribunal');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.patch(`/tribunais/${editTribunal.id}`, editTribunal);
            toast.success('Informações atualizadas!');
            setEditTribunal(null);
            loadData();
        } catch (err) {
            toast.error('Erro ao atualizar');
        } finally {
            setLoading(false);
        }
    };

    const handleBulkInsert = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const lines = bulkText.split('\n')
                .map(l => l.trim())
                .filter(l => l.length > 0 && !l.startsWith('--') && l.match(/[;,|\t]/));
            
            const records = lines.map(line => {
                const parts = line.split(/[;,|\t]/);
                return {
                    nome: parts[0]?.trim(),
                    email: parts[1]?.trim() || 'sem-email@teste.com',
                    estado: parts[2]?.trim() || 'SP'
                };
            });
            
            const res = await api.post('/tribunais/bulk', records);
            toast.success(`${res.data.count} tribunais cadastrados com sucesso!`);
            setBulkText('');
            setIsModalOpen(false);
            loadData();
        } catch(err) {
            const serverMsg = err.response?.data?.error || err.message;
            toast.error(`Falha: ${serverMsg}`, { duration: 6000 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
        <div className="animate-fade">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Tribunais e Varas</h1>
                    <p className="page-subtitle">Gerencie sua base de contatos judiciais. ({tribunais.length} registros)</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} /> Adicionar Tribunais
                </button>
            </div>

            <div className="card">
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Nome do Tribunal / Vara</th>
                                <th>Email de Contato</th>
                                <th>Estado (UF)</th>
                                <th style={{textAlign:'center'}}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tribunais.map(t => (
                                <tr key={t.id}>
                                    <td style={{fontWeight:500, color: 'var(--text-main)'}}>{t.nome}</td>
                                    <td style={{color: 'var(--text-muted)'}}>{t.email}</td>
                                    <td><span className="badge badge-warning">{t.estado}</span></td>
                                    <td>
                                        <div style={{display:'flex', gap:'1rem', justifyContent:'center'}}>
                                            <button className="btn-icon btn-edit" title="Editar informações" onClick={() => setEditTribunal(t)}>
                                                <Pencil size={18}/>
                                            </button>
                                            <button className="btn-icon btn-delete" title="Excluir tribunal" onClick={() => setDeleteConfirm(t)}>
                                                <Trash2 size={18}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {tribunais.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{textAlign:'center', padding: '3rem', color: 'var(--text-light)'}}>
                                        Nenhum tribunal cadastrado. Adicione seus contatos para iniciar.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

            {/* Confirmation Delete Modal */}
            {deleteConfirm && (
                <div className="modal-overlay" onClick={() => setDeleteConfirm(null)} style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)' }}>
                    <div className="modal-content animate-fade" style={{ maxWidth: 420, border: '1px solid rgba(239, 68, 68, 0.2)', padding: '2.5rem', borderRadius: '1.25rem', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ width: 64, height: 64, background: 'var(--error-bg)', color: 'var(--error)', borderRadius: '50%', display: 'grid', placeItems: 'center', margin: '0 auto 1.5rem', boxShadow: '0 0 40px rgba(239, 68, 68, 0.15)' }}>
                                <Trash2 size={32} />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem', fontFamily: 'Outfit' }}>Excluir Registro?</h2>
                            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                                Você removerá definitivamente o tribunal <strong>{deleteConfirm.nome}</strong> desta base.
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '2rem' }}>
                            <button className="btn btn-primary" style={{ background: 'var(--error)', borderColor: 'var(--error)', padding: '1rem', width: '100%', fontSize: '1rem' }} onClick={() => handleDelete(deleteConfirm)} disabled={loading}>
                                {loading ? 'Removendo...' : 'Sim, Excluir Agora'}
                            </button>
                            <button className="btn btn-outline" style={{ padding: '1rem', width: '100%', border: 'none', background: 'var(--bg-muted)' }} onClick={() => setDeleteConfirm(null)}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content animate-fade" style={{ maxWidth: 500, padding: '2.5rem', borderRadius: '1.25rem', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header" style={{ marginBottom: '1.5rem', paddingBottom: '1rem' }}>
                            <div>
                                <h2 style={{fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)'}}>
                                    <UploadCloud size={20} color="var(--primary)" /> Inserir Contatos
                                </h2>
                            </div>
                            <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ marginBottom: '1.25rem' }}>
                            <label className="form-label" style={{fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600}}>1. Qual arquivo base? (.csv, .txt)</label>
                            <input type="file" accept=".csv,.txt" className="form-input" style={{ padding: '0.75rem', fontSize: '0.85rem', marginTop: '0.5rem' }} onChange={handleFileUpload} />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label className="form-label" style={{fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600}}>
                                2. Ou cole no formato: <span style={{ color: 'var(--primary)', fontWeight: 400 }}>Nome; Email; UF</span>
                            </label>
                            <textarea 
                                className="form-input" 
                                style={{ height: '140px', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.85rem', marginTop: '0.5rem', background: 'var(--bg-main)' }}
                                value={bulkText}
                                onChange={e => setBulkText(e.target.value)}
                                placeholder="Tribunal de Justiça de SP; vara1@tjsp.jus.br; SP"
                            ></textarea>
                        </div>

                        <button className="btn btn-primary" style={{ width: '100%', padding: '1rem' }} onClick={handleBulkInsert} disabled={loading || !bulkText.trim()}>
                            {loading ? 'Sincronizando...' : 'Iniciar Importação'}
                        </button>
                    </div>
                </div>
            )}

            {/* Edit Tribunal Modal */}
            {editTribunal && (
                <div className="modal-overlay" onClick={() => setEditTribunal(null)} style={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(20px)' }}>
                    <div className="modal-content animate-fade" style={{ maxWidth: 450, padding: '2.5rem', boxShadow: '0 40px 100px rgba(0,0,0,0.1)', borderRadius: '1.25rem', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: 48, height: 48, background: 'var(--primary-glow)', color: 'var(--primary)', borderRadius: '12px', display: 'grid', placeItems: 'center' }}>
                                    <Pencil size={24} />
                                </div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>Editar Contato</h2>
                            </div>
                            <button className="modal-close" onClick={() => setEditTribunal(null)}><X size={20}/></button>
                        </div>
                        
                        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Nome ou Variável de Tratamento</label>
                                <input className="form-input" style={{ padding: '1rem' }} required value={editTribunal.nome} onChange={e=>setEditTribunal({...editTribunal, nome: e.target.value})} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Endereço de E-mail</label>
                                <input className="form-input" style={{ padding: '1rem' }} type="email" required value={editTribunal.email} onChange={e=>setEditTribunal({...editTribunal, email: e.target.value})} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>UF</label>
                                <input className="form-input" style={{ padding: '1rem' }} maxLength="2" required value={editTribunal.estado} onChange={e=>setEditTribunal({...editTribunal, estado: e.target.value.toUpperCase()})} />
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ padding: '1rem', marginTop: '1rem', width: '100%', fontSize: '1rem' }} disabled={loading}>
                                {loading ? 'Atualizando...' : 'Concluir Edição'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export const Campanhas = () => {
    const [campanhas, setCampanhas] = useState([]);
    const [novaCampanha, setNovaCampanha] = useState({
        nome: '', assunto: '', corpo_html: '', intervalo_dias: 15,
        data_inicio: new Date().toISOString().split('T')[0], hora_inicio: '08:00'
    });
    const [filesToUpload, setFilesToUpload] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [previewCampanha, setPreviewCampanha] = useState(null);
    const [editCampanha, setEditCampanha] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [sendingTest, setSendingTest] = useState(false);
    const [emailTeste, setEmailTeste] = useState('daniel-ehs@outlook.com');

    const loadData = () => {
        api.get('/campanhas').then(res => setCampanhas(res.data)).catch(() => toast.error('Erro ao listar'));
    };
    useEffect(() => loadData(), []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const anexo_ids = [];
            if (filesToUpload.length > 0) {
                toast.loading(`Fazendo upload de ${filesToUpload.length} anexo(s)...`);
                for(const file of filesToUpload) {
                    const formData = new FormData();
                    formData.append('file', file);
                    const fileRes = await api.post('/anexos/upload', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    anexo_ids.push(fileRes.data.id);
                }
                toast.dismiss();
            }
            await api.post('/campanhas', { ...novaCampanha, anexo_ids });
            toast.success('Campanha criada com sucesso!');
            setNovaCampanha({nome: '', assunto: '', corpo_html: '', intervalo_dias: 15, data_inicio: new Date().toISOString().split('T')[0], hora_inicio: '08:00'});
            setFilesToUpload([]);
            setShowForm(false);
            loadData();
        } catch(err) {
            const serverMsg = err.response?.data?.error || err.message;
            toast.error(`Erro: ${serverMsg}`, { duration: 6000 });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`/campanhas/${editCampanha.id}`, editCampanha);
            toast.success('Campanha atualizada!');
            setEditCampanha(null);
            loadData();
        } catch(err) {
            toast.error('Erro ao atualizar: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleToggle = async (campanha) => {
        try {
            const res = await api.patch(`/campanhas/${campanha.id}/toggle`);
            const status = res.data.ativa ? 'ativada' : 'pausada';
            toast.success(`Campanha "${campanha.nome}" ${status}!`);
            loadData();
        } catch(err) {
            toast.error('Erro ao alterar status da campanha.');
        }
    };

    const handleDelete = async (campanha) => {
        try {
            await api.delete(`/campanhas/${campanha.id}`);
            toast.success('Campanha removida.');
            setDeleteConfirm(null);
            loadData();
        } catch(err) {
            toast.error('Erro ao remover campanha.');
        }
    };

    const handleSendTest = async () => {
        if (!previewCampanha) return;
        setSendingTest(true);
        try {
            await api.post(`/campanhas/${previewCampanha.id}/test-email`, { email_teste: emailTeste });
            toast.success(`E-mail teste enviado para ${emailTeste}! Verifique sua caixa de entrada.`);
        } catch(err) {
            const msg = err.response?.data?.error || err.message;
            toast.error(`Falha no envio teste: ${msg}`, { duration: 8000 });
        } finally {
            setSendingTest(false);
        }
    };

    const getPreviewHtml = (campanha) => {
        return (campanha.corpo_html || '')
            .replace(/\{\{nome_tribunal\}\}/g, '<strong>[VARA DO TRABALHO DE TESTE]</strong>')
            .replace(/\{\{estado\}\}/g, 'SP')
            .replace(/\{\{cidade\}\}/g, 'São Paulo');
    };

    return (
        <>
        <div className="animate-fade">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Campanhas</h1>
                    <p className="page-subtitle">Gerencie e acompanhe seus disparos automáticos.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                    <Plus size={18} /> Nova Campanha
                </button>
            </div>

            {/* Campaign Table */}
            <div className="card">
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Status</th>
                                <th>Nome da Campanha</th>
                                <th>Assunto</th>
                                <th>Próximo Envio</th>
                                <th>Ciclo</th>
                                <th>Anexos</th>
                                <th style={{textAlign:'center'}}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campanhas.map(c => (
                                <tr key={c.id}>
                                    <td>
                                        <button
                                            onClick={() => handleToggle(c)}
                                            style={{
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                                                color: c.ativa ? 'var(--success)' : 'var(--text-light)',
                                                fontWeight: 600, fontSize: '0.82rem'
                                            }}
                                            title={c.ativa ? 'Clique para pausar' : 'Clique para ativar'}
                                        >
                                            <span style={{
                                                width: 12, height: 12, borderRadius: '50%',
                                                background: c.ativa ? 'var(--success)' : '#ccc',
                                                display: 'inline-block',
                                                boxShadow: c.ativa ? '0 0 0 3px rgba(16,185,129,0.2)' : 'none'
                                            }}></span>
                                            {c.ativa ? 'Ativa' : 'Pausada'}
                                        </button>
                                    </td>
                                    <td style={{fontWeight: 600, color: 'var(--text-main)'}}>{c.nome}</td>
                                    <td style={{color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{c.assunto}</td>
                                    <td style={{color: 'var(--text-muted)', fontSize: '0.85rem'}}>
                                        {c.proxima_execucao ? new Date(c.proxima_execucao).toLocaleString('pt-BR') : '—'}
                                    </td>
                                    <td><span className="badge badge-warning">A cada {c.intervalo_dias}d</span></td>
                                    <td style={{fontSize: '0.82rem', color: 'var(--secondary)'}}>
                                        {c.anexos && c.anexos.filter(a => a).length > 0
                                            ? <span><Paperclip size={13} style={{verticalAlign:'middle', marginRight:4}}/>{c.anexos.filter(a=>a).length} arquivo(s)</span>
                                            : <span style={{color:'var(--text-light)'}}>Nenhum</span>
                                        }
                                    </td>
                                    <td>
                                        <div style={{display:'flex', gap:'0.5rem', justifyContent:'center'}}>
                                            <button className="btn-icon" title="Ver Preview e Enviar Teste" onClick={() => setPreviewCampanha(c)}>
                                                <Mail size={16}/>
                                            </button>
                                            <button className="btn-icon btn-edit" title="Editar Campanha" onClick={() => setEditCampanha({ ...c, assunto: c.assunto || '', corpo_html: c.corpo_html || '', data_inicio: c.proxima_execucao ? new Date(c.proxima_execucao).toISOString().split('T')[0] : new Date().toISOString().split('T')[0], hora_inicio: c.proxima_execucao ? new Date(c.proxima_execucao).toTimeString().slice(0,5) : '08:00' })}>
                                                <Pencil size={16}/>
                                            </button>
                                            <button className="btn-icon btn-delete" title="Excluir Campanha" onClick={() => setDeleteConfirm(c)}>
                                                <Trash2 size={16}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {campanhas.length === 0 && (
                                <tr><td colSpan="7" style={{textAlign:'center', padding:'3rem', color:'var(--text-light)'}}>
                                    Nenhuma campanha cadastrada. Clique em "Nova Campanha" para começar.
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

            {/* Preview Modal */}
            {previewCampanha && (
                <div className="modal-overlay" onClick={() => setPreviewCampanha(null)} style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)' }}>
                    <div className="modal-content animate-fade" style={{ maxWidth: 700, padding: '1.5rem', borderRadius: '1.25rem' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header" style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                            <div>
                                <h2 style={{fontSize: '1.25rem', display:'flex', alignItems:'center', gap:'0.5rem', color: 'var(--text-main)'}}>
                                    <Mail size={20} color="var(--primary)" /> Emulação do Envio ({previewCampanha.nome})
                                </h2>
                            </div>
                            <button className="modal-close" onClick={() => setPreviewCampanha(null)}><X size={20}/></button>
                        </div>

                        {/* Email Header Preview */}
                        <div style={{background:'var(--bg-muted)', borderRadius:'var(--radius-md)', padding:'1rem', marginBottom:'1rem', fontSize:'0.85rem', display: 'grid', gridTemplateColumns: '1fr', gap: '0.25rem'}}>
                            <div><strong style={{color: 'var(--text-main)'}}>Remetente:</strong> Daniel Pereira dos Santos (Perito Judicial)</div>
                            <div><strong style={{color: 'var(--text-main)'}}>Assunto Principal:</strong> {previewCampanha.assunto}</div>
                            {previewCampanha.anexos && previewCampanha.anexos.filter(a=>a).length > 0 && (
                                <div style={{color:'var(--secondary)', fontWeight: 600}}>
                                    <Paperclip size={13} style={{verticalAlign:'middle'}}/> Anexado: {previewCampanha.anexos.filter(a=>a).map(a=>a.nome).join(', ')}
                                </div>
                            )}
                        </div>

                        {/* Email Body Preview */}
                        <div style={{
                            border: '1px solid var(--border-light)', borderRadius:'var(--radius-md)',
                            padding: '1.25rem', background: '#fff', height: 200, overflowY: 'auto',
                            fontSize: '0.9rem', color: '#111'
                        }}
                            dangerouslySetInnerHTML={{ __html: getPreviewHtml(previewCampanha) }}
                        />

                        {/* Test Email */}
                        <div style={{marginTop:'1.25rem', display:'flex', gap:'0.75rem', alignItems:'center'}}>
                            <input
                                type="email"
                                className="form-input"
                                style={{flex:1, padding: '0.85rem'}}
                                value={emailTeste}
                                onChange={e => setEmailTeste(e.target.value)}
                                placeholder="E-mail receptor do teste"
                            />
                            <button className="btn btn-primary" onClick={handleSendTest} disabled={sendingTest || !emailTeste} style={{padding: '0.85rem 1.5rem', whiteSpace:'nowrap'}}>
                                {sendingTest ? 'Disparando...' : '🚀 Testar Fluxo de Envio'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Form Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)} style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)' }}>
                    <div className="modal-content animate-fade" style={{ maxWidth: 750, padding: '1.5rem 2rem', borderRadius: '1.25rem', boxShadow: '0 40px 100px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header" style={{ marginBottom: '1.25rem' }}>
                            <h2 style={{fontSize:'1.25rem', display:'flex', alignItems:'center', gap:'0.5rem', color: 'var(--text-main)'}}>
                                <Plus size={20} color="var(--primary)"/> Cadastro de Campanha
                            </h2>
                            <button className="modal-close" onClick={() => setShowForm(false)}><X size={20}/></button>
                        </div>
                        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" style={{ fontWeight: 600 }}>Identificação (Interno)</label>
                                    <input className="form-input" style={{ padding: '0.65rem' }} required value={novaCampanha.nome} onChange={e=>setNovaCampanha({...novaCampanha, nome: e.target.value})} placeholder="Ex: Contato Varas SP" />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" style={{ fontWeight: 600 }}>Tópico do Correspondente (Assunto)</label>
                                    <input className="form-input" style={{ padding: '0.65rem' }} required value={novaCampanha.assunto} onChange={e=>setNovaCampanha({...novaCampanha, assunto: e.target.value})} placeholder="Apresentação de Serviços" />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label" style={{ fontWeight: 600 }}>Markup de Envio (HTML)</label>
                                <textarea className="form-input" style={{ height:'100px', fontFamily:'monospace', fontSize:'0.82rem', padding: '0.65rem', background: 'var(--bg-main)' }} required value={novaCampanha.corpo_html} onChange={e=>setNovaCampanha({...novaCampanha, corpo_html: e.target.value})} placeholder={`<p>Prezados do <strong>{{nome_tribunal}}</strong>,</p>`}></textarea>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) auto auto 120px', gap: '1rem', alignItems: 'flex-end' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" style={{ fontWeight: 600 }}>Anexo(s) Opcionais</label>
                                    <input type="file" multiple className="form-input" style={{ padding: '0.65rem' }} onChange={(e) => setFilesToUpload(Array.from(e.target.files))} />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" style={{ fontWeight: 600 }}>Data Limite</label>
                                    <input type="date" className="form-input" style={{ padding: '0.65rem' }} required value={novaCampanha.data_inicio} onChange={e=>setNovaCampanha({...novaCampanha, data_inicio: e.target.value})} />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" style={{ fontWeight: 600 }}>Disparo HH:MM</label>
                                    <input type="time" className="form-input" style={{ padding: '0.65rem' }} required value={novaCampanha.hora_inicio} onChange={e=>setNovaCampanha({...novaCampanha, hora_inicio: e.target.value})} />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" style={{ fontWeight: 600 }}>Ciclo (Dias)</label>
                                    <input type="number" className="form-input" style={{ padding: '0.65rem' }} min="1" value={novaCampanha.intervalo_dias} onChange={e=>setNovaCampanha({...novaCampanha, intervalo_dias: e.target.value})} />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem', marginTop: '0.5rem', fontWeight: 600, fontSize: '1rem' }} disabled={loading}>
                                {loading ? 'Carregando Implantação...' : 'Implantar e Ativar Ciclo'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editCampanha && (
                <div className="modal-overlay" onClick={() => setEditCampanha(null)} style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)' }}>
                    <div className="modal-content animate-fade" style={{ maxWidth: 750, padding: '1.5rem 2rem', borderRadius: '1.25rem', boxShadow: '0 40px 100px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header" style={{ marginBottom: '1.25rem' }}>
                            <h2 style={{fontSize:'1.25rem', display:'flex', alignItems:'center', gap:'0.5rem', color: 'var(--text-main)'}}>
                                <Pencil size={20} color="var(--primary)"/> Editar Carga da Campanha
                            </h2>
                            <button className="modal-close" onClick={() => setEditCampanha(null)}><X size={20}/></button>
                        </div>
                        <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" style={{ fontWeight: 600 }}>Identificação</label>
                                    <input className="form-input" style={{ padding: '0.65rem' }} required value={editCampanha.nome} onChange={e=>setEditCampanha({...editCampanha, nome: e.target.value})} />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" style={{ fontWeight: 600 }}>Tópico (Assunto)</label>
                                    <input className="form-input" style={{ padding: '0.65rem' }} required value={editCampanha.assunto} onChange={e=>setEditCampanha({...editCampanha, assunto: e.target.value})} />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label" style={{ fontWeight: 600 }}>Markup (HTML)</label>
                                <textarea className="form-input" style={{ height:'100px', fontFamily:'monospace', fontSize:'0.82rem', padding: '0.65rem', background: 'var(--bg-main)' }} required value={editCampanha.corpo_html} onChange={e=>setEditCampanha({...editCampanha, corpo_html: e.target.value})}></textarea>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) auto auto 120px', gap: '1rem', alignItems: 'flex-end' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    {/* Placeholder column to align the grid 1:1 with form mapping fields naturally */}
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Anexos editados pelo painel backend caso existam previamente.</p>
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" style={{ fontWeight: 600 }}>Nova Data</label>
                                    <input type="date" className="form-input" style={{ padding: '0.65rem' }} value={editCampanha.data_inicio} onChange={e=>setEditCampanha({...editCampanha, data_inicio: e.target.value})} />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" style={{ fontWeight: 600 }}>Enviará HH:MM</label>
                                    <input type="time" className="form-input" style={{ padding: '0.65rem' }} value={editCampanha.hora_inicio} onChange={e=>setEditCampanha({...editCampanha, hora_inicio: e.target.value})} />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" style={{ fontWeight: 600 }}>Ciclo (Dias)</label>
                                    <input type="number" className="form-input" style={{ padding: '0.65rem' }} min="1" value={editCampanha.intervalo_dias} onChange={e=>setEditCampanha({...editCampanha, intervalo_dias: e.target.value})} />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem', marginTop: '0.5rem', fontWeight: 600, fontSize: '1rem' }}>
                                Aplicar Regras da Campanha
                            </button>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Confirmation Delete Modal Campanhas */}
            {deleteConfirm && (
                <div className="modal-overlay" onClick={() => setDeleteConfirm(null)} style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)' }}>
                    <div className="modal-content animate-fade" style={{ maxWidth: 420, border: '1px solid rgba(239, 68, 68, 0.2)', padding: '2.5rem', borderRadius: '1.25rem', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ width: 64, height: 64, background: 'var(--error-bg)', color: 'var(--error)', borderRadius: '50%', display: 'grid', placeItems: 'center', margin: '0 auto 1.5rem', boxShadow: '0 0 40px rgba(239, 68, 68, 0.15)' }}>
                                <Trash2 size={32} />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem', fontFamily: 'Outfit' }}>Apagar Campanha?</h2>
                            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                                Você removerá a campanha <strong>{deleteConfirm.nome}</strong> e pausará o ciclo.
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '2rem' }}>
                            <button className="btn btn-primary" style={{ background: 'var(--error)', borderColor: 'var(--error)', padding: '1rem', width: '100%', fontSize: '1rem' }} onClick={() => handleDelete(deleteConfirm)}>
                                Sim, Excluir Agora
                            </button>
                            <button className="btn btn-outline" style={{ padding: '1rem', width: '100%', border: 'none', background: 'var(--bg-muted)' }} onClick={() => setDeleteConfirm(null)}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
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
                <div>
                    <h1 className="page-title">Histórico Geral e Respostas</h1>
                    <p className="page-subtitle">Acompanhe com quem a aplicação entrou em contato.</p>
                </div>
            </div>
            
            <div className="card">
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Data do Disparo</th>
                                <th>Destinatário</th>
                                <th>Assunto do E-mail</th>
                                <th>Status de Entrega</th>
                                <th>Verificação (Retorno)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {envios.map(h => (
                                <tr key={h.id}>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(h.enviado_em).toLocaleString()}</td>
                                    <td style={{ fontWeight: 500 }}>{h.tribunal || 'N/A'}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{h.assunto}</td>
                                    <td>
                                        {h.status === 'enviado' ? 
                                            <span className="badge badge-success"><CheckCircle size={14}/> SUCESSO</span> :
                                            <span className="badge badge-error" title={h.erro_mensagem}><AlertCircle size={14}/> FALHA SMTP</span>
                                        }
                                    </td>
                                    <td><span className="badge badge-warning">Aguardando IMAP</span></td>
                                </tr>
                            ))}
                            {envios.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{textAlign:'center', padding: '3rem', color: 'var(--text-light)'}}>
                                        Nenhum registro de disparo encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
