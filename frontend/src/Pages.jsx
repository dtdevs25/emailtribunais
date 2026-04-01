import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, Gavel, Mail, Calendar, Paperclip, 
    History, TrendingUp, CheckCircle, Clock, AlertCircle, X, Plus, UploadCloud, Pencil
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
            <div className="page-header">
                <div>
                    <h1 className="page-title">Painel de Controle</h1>
                    <p className="page-subtitle">Acompanhe seus disparos e resultados em tempo real.</p>
                </div>
            </div>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="card stat-card">
                    <div className="stat-icon-box" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>
                        <Mail size={24} />
                    </div>
                    <div>
                        <div className="stat-label">Total Enviado</div>
                        <div className="stat-value">{stats.totalEnvios}</div>
                    </div>
                </div>
                
                <div className="card stat-card">
                    <div className="stat-icon-box" style={{ background: 'rgba(14, 165, 233, 0.1)', color: 'var(--secondary)' }}>
                        <Gavel size={24} />
                    </div>
                    <div>
                        <div className="stat-label">Tribunais Cadastrados</div>
                        <div className="stat-value">{stats.totalTribunais}</div>
                    </div>
                </div>

                <div className="card stat-card">
                    <div className="stat-icon-box" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <div className="stat-label">Campanhas Ativas</div>
                        <div className="stat-value">{stats.totalCampanhas}</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                <div className="card" style={{ padding: '2.5rem', minHeight: 450, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ marginBottom: '2rem', fontSize: '1.1rem', fontWeight: 600 }}>Eficiência de Entrega</h3>
                    <div style={{ flex: 1, minHeight: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    innerRadius={75}
                                    outerRadius={100}
                                    paddingAngle={10}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <div style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--success)', letterSpacing: '-1px' }}>{sRate}%</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Taxa de Sucesso Total</div>
                    </div>
                </div>

                <div className="card" style={{ padding: '2.5rem', minHeight: 450, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ marginBottom: '2rem', fontSize: '1.1rem', fontWeight: 600 }}>Volume por Campanha</h3>
                    <div style={{ flex: 1, minHeight: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.historico.slice(0, 10).reverse()}>
                                <XAxis dataKey="campanha" hide />
                                <YAxis hide />
                                <Tooltip 
                                    cursor={{fill: 'var(--bg-muted)', opacity: 0.4}} 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="id" fill="var(--primary)" radius={[6, 6, 0, 0]} name="Volume" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <p style={{ textAlign: 'center', color: 'var(--text-light)', fontSize: '0.85rem', marginTop: '1.5rem' }}>
                        Dados extraídos dos seus disparos mais recentes.
                    </p>
                </div>
            </div>
            <div className="card" style={{ marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>Envios Recentes / Acompanhamento</h3>
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
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(h.enviado_em).toLocaleString()}</td>
                                    <td style={{ fontWeight: 500 }}>{h.tribunal || 'Desconhecido'}</td>
                                    <td>{h.campanha || h.assunto}</td>
                                    <td>
                                        {h.status === 'enviado' ? 
                                            <span className="badge badge-success" style={{display:'flex', alignItems:'center', gap:4, width:'fit-content'}}><CheckCircle size={14}/> SUCESSO</span> :
                                            <span className="badge badge-error" style={{display:'flex', alignItems:'center', gap:4, width:'fit-content'}}><X size={14}/> FALHA</span>
                                        }
                                    </td>
                                    <td style={{color: 'var(--text-light)', fontSize: '0.8rem'}}>Aguardando IMAP</td>
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

    const handleDelete = async (id) => {
        if (!confirm('Deseja realmente remover este registro?')) return;
        try {
            await api.delete(`/tribunais/${id}`);
            toast.success('Tribunal removido com sucesso!');
            loadData();
        } catch (err) {
            toast.error('Erro ao remover tribunal');
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
                                        <div style={{display:'flex', gap:'0.5rem', justifyContent:'center'}}>
                                            <button className="btn-icon btn-edit" onClick={() => setEditTribunal(t)}>
                                                <Pencil size={16}/>
                                            </button>
                                            <button className="btn-icon btn-delete" onClick={() => handleDelete(t.id)}>
                                                <X size={16}/>
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

            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content animate-fade" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2 style={{fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                                    <UploadCloud size={20} color="var(--primary)" /> Subir em Massa
                                </h2>
                                <p style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem'}}>
                                    Cole seus contatos copiados do Excel ou Planilha.
                                </p>
                            </div>
                            <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{background: 'var(--bg-muted)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem'}}>
                            <p style={{fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 500, marginBottom: '0.5rem'}}>Formato esperado (1 registro por linha):</p>
                            <code style={{fontSize: '0.8rem', color: 'var(--secondary)'}}>Nome do Tribunal ; email_contato@tj.jus.br ; SP</code>
                        </div>

                        <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label className="form-label" style={{fontSize: '0.9rem', color: 'var(--primary)'}}>Opção 1: Selecionar arquivo (.csv ou .txt)</label>
                            <input type="file" accept=".csv,.txt" className="form-input" onChange={handleFileUpload} />
                        </div>

                        <label className="form-label" style={{fontSize: '0.9rem'}}>Opção 2: Ou cole os textos diretamente aqui abaixo</label>
                        <textarea 
                            className="form-input" 
                            style={{ height: '220px', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.85rem' }}
                            value={bulkText}
                            onChange={e => setBulkText(e.target.value)}
                            placeholder={"1ª Vara Cível de São Paulo; vara1@tjsp.jus.br; SP\n2ª Vara do Trabalho; vt2@trt2.jus.br; SP"}
                        ></textarea>

                        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem'}}>
                            <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleBulkInsert} disabled={loading || !bulkText.trim()}>
                                {loading ? 'Validando e Importando...' : 'Iniciar Importação'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Tribunal Modal */}
            {editTribunal && (
                <div className="modal-overlay" onClick={() => setEditTribunal(null)}>
                    <div className="modal-content animate-fade" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 style={{fontSize:'1.15rem', display:'flex', alignItems:'center', gap:'0.5rem'}}>
                                <Pencil size={20} color="var(--primary)"/> Editar Tribunal
                            </h2>
                            <button className="modal-close" onClick={() => setEditTribunal(null)}><X size={20}/></button>
                        </div>
                        <form onSubmit={handleUpdate}>
                            <div className="form-group">
                                <label className="form-label">Nome do Tribunal / Vara</label>
                                <input className="form-input" required value={editTribunal.nome} onChange={e=>setEditTribunal({...editTribunal, nome: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">E-mail de Contato</label>
                                <input className="form-input" type="email" required value={editTribunal.email} onChange={e=>setEditTribunal({...editTribunal, email: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Estado (UF)</label>
                                <input className="form-input" maxLength="2" required value={editTribunal.estado} onChange={e=>setEditTribunal({...editTribunal, estado: e.target.value.toUpperCase()})} />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{width:'100%', padding:'1rem', marginTop:'0.5rem'}} disabled={loading}>
                                {loading ? 'Salvando...' : '💾 Salvar Alterações'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>

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

    const handleDelete = async (id) => {
        if (!window.confirm('Remover esta campanha permanentemente?')) return;
        try {
            await api.delete(`/campanhas/${id}`);
            toast.success('Campanha removida.');
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
                                            <button className="btn-icon btn-delete" title="Excluir Campanha" onClick={() => handleDelete(c.id)}>
                                                <X size={16}/>
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

            {/* Preview Modal */}
            {previewCampanha && (
                <div className="modal-overlay" onClick={() => setPreviewCampanha(null)}>
                    <div className="modal-content animate-fade" style={{maxWidth: 750, width: '95vw'}} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2 style={{fontSize: '1.15rem', display:'flex', alignItems:'center', gap:'0.5rem'}}>
                                    <Mail size={20} color="var(--primary)" /> Preview: {previewCampanha.nome}
                                </h2>
                                <p style={{fontSize:'0.82rem', color:'var(--text-muted)', marginTop:'0.2rem'}}>
                                    As variáveis <strong style={{color:'var(--primary)'}}>{'{{nome_tribunal}}'}</strong> são substituídas por exemplo abaixo.
                                </p>
                            </div>
                            <button className="modal-close" onClick={() => setPreviewCampanha(null)}><X size={20}/></button>
                        </div>

                        {/* Email Header Preview */}
                        <div style={{background:'var(--bg-muted)', borderRadius:'var(--radius-md)', padding:'1rem', marginBottom:'1rem', fontSize:'0.85rem'}}>
                            <div><strong>De:</strong> Daniel Pereira dos Santos - Perito Judicial &lt;{process.env.SMTP_USER || 'contato@ehspro.com.br'}&gt;</div>
                            <div><strong>Para:</strong> secretaria@vara-do-trabalho-de-teste.jus.br</div>
                            <div><strong>Assunto:</strong> {previewCampanha.assunto}</div>
                            {previewCampanha.anexos && previewCampanha.anexos.filter(a=>a).length > 0 && (
                                <div style={{marginTop:'0.5rem', color:'var(--secondary)'}}>
                                    <Paperclip size={13} style={{verticalAlign:'middle'}}/> <strong>Anexos:</strong> {previewCampanha.anexos.filter(a=>a).map(a=>a.nome).join(', ')}
                                </div>
                            )}
                        </div>

                        {/* Email Body Preview */}
                        <div style={{
                            border: '1px solid var(--border-light)', borderRadius:'var(--radius-md)',
                            padding: '1.5rem', background: '#fff', maxHeight: 380, overflowY: 'auto',
                            fontSize: '0.9rem'
                        }}
                            dangerouslySetInnerHTML={{ __html: getPreviewHtml(previewCampanha) }}
                        />

                        {/* Test Email */}
                        <div style={{marginTop:'1.5rem', padding:'1rem', background:'#fffbeb', borderRadius:'var(--radius-md)', border:'1px solid #fcd34d'}}>
                            <p style={{fontWeight:600, marginBottom:'0.75rem', color:'#92400e', fontSize:'0.9rem'}}>
                                📧 Enviar E-mail de Teste (sem enviar aos tribunais)
                            </p>
                            <div style={{display:'flex', gap:'0.75rem', alignItems:'center', flexWrap:'wrap'}}>
                                <input
                                    type="email"
                                    className="form-input"
                                    style={{flex:1, minWidth:220}}
                                    value={emailTeste}
                                    onChange={e => setEmailTeste(e.target.value)}
                                    placeholder="seu-email@exemplo.com"
                                />
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSendTest}
                                    disabled={sendingTest || !emailTeste}
                                    style={{whiteSpace:'nowrap'}}
                                >
                                    {sendingTest ? 'Enviando...' : '🚀 Enviar Teste'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Form Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal-content animate-fade" style={{maxWidth: 700, width: '95vw'}} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 style={{fontSize:'1.15rem', display:'flex', alignItems:'center', gap:'0.5rem'}}>
                                <Plus size={20} color="var(--primary)"/> Nova Campanha
                            </h2>
                            <button className="modal-close" onClick={() => setShowForm(false)}><X size={20}/></button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div className="form-group">
                                <label className="form-label">Título da Campanha (Interno)</label>
                                <input className="form-input" required value={novaCampanha.nome} onChange={e=>setNovaCampanha({...novaCampanha, nome: e.target.value})} placeholder="Ex: Disparo Geral - Varas SP" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Assunto do E-mail</label>
                                <input className="form-input" required value={novaCampanha.assunto} onChange={e=>setNovaCampanha({...novaCampanha, assunto: e.target.value})} placeholder="Apresentação de Serviços - Perito Judicial - Daniel Santos" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Conteúdo HTML do E-mail</label>
                                <textarea className="form-input" style={{height:'200px', fontFamily:'monospace', fontSize:'0.82rem'}} required value={novaCampanha.corpo_html} onChange={e=>setNovaCampanha({...novaCampanha, corpo_html: e.target.value})} placeholder={`<p>Prezados da <strong>{{nome_tribunal}}</strong>,</p>`}></textarea>
                                <small style={{color:'var(--primary)', fontWeight:500}}>Use {'{{nome_tribunal}}'} para personalizar automaticamente!</small>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Anexar Documentos (.pdf, .doc)</label>
                                <input type="file" multiple className="form-input" onChange={(e) => setFilesToUpload(Array.from(e.target.files))} />
                            </div>
                            <div style={{display:'flex', gap:'1rem'}}>
                                <div className="form-group" style={{flex:1}}>
                                    <label className="form-label">Data de Início</label>
                                    <input type="date" className="form-input" required value={novaCampanha.data_inicio} onChange={e=>setNovaCampanha({...novaCampanha, data_inicio: e.target.value})} />
                                </div>
                                <div className="form-group" style={{flex:1}}>
                                    <label className="form-label">Horário (BRT)</label>
                                    <input type="time" className="form-input" required value={novaCampanha.hora_inicio} onChange={e=>setNovaCampanha({...novaCampanha, hora_inicio: e.target.value})} />
                                </div>
                                <div className="form-group" style={{flex:1}}>
                                    <label className="form-label">Repetir a cada (dias)</label>
                                    <input type="number" className="form-input" min="1" value={novaCampanha.intervalo_dias} onChange={e=>setNovaCampanha({...novaCampanha, intervalo_dias: e.target.value})} />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{width:'100%', padding:'1rem', marginTop:'0.5rem'}} disabled={loading}>
                                {loading ? 'Processando...' : '🚀 Salvar e Ativar Campanha'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editCampanha && (
                <div className="modal-overlay" onClick={() => setEditCampanha(null)}>
                    <div className="modal-content animate-fade" style={{maxWidth: 700, width: '95vw'}} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 style={{fontSize:'1.15rem', display:'flex', alignItems:'center', gap:'0.5rem'}}>
                                <Pencil size={20} color="var(--primary)"/> Editar Campanha
                            </h2>
                            <button className="modal-close" onClick={() => setEditCampanha(null)}><X size={20}/></button>
                        </div>
                        <form onSubmit={handleEdit}>
                            <div className="form-group">
                                <label className="form-label">Título da Campanha</label>
                                <input className="form-input" required value={editCampanha.nome} onChange={e=>setEditCampanha({...editCampanha, nome: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Assunto do E-mail</label>
                                <input className="form-input" required value={editCampanha.assunto} onChange={e=>setEditCampanha({...editCampanha, assunto: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Conteúdo HTML do E-mail</label>
                                <textarea className="form-input" style={{height:'220px', fontFamily:'monospace', fontSize:'0.82rem'}} required value={editCampanha.corpo_html} onChange={e=>setEditCampanha({...editCampanha, corpo_html: e.target.value})}></textarea>
                                <small style={{color:'var(--primary)', fontWeight:500}}>Use {'{{nome_tribunal}}'} para personalizar por juízo!</small>
                            </div>
                            <div style={{display:'flex', gap:'1rem'}}>
                                <div className="form-group" style={{flex:1}}>
                                    <label className="form-label">Data de Início</label>
                                    <input type="date" className="form-input" value={editCampanha.data_inicio} onChange={e=>setEditCampanha({...editCampanha, data_inicio: e.target.value})} />
                                </div>
                                <div className="form-group" style={{flex:1}}>
                                    <label className="form-label">Horário (BRT)</label>
                                    <input type="time" className="form-input" value={editCampanha.hora_inicio} onChange={e=>setEditCampanha({...editCampanha, hora_inicio: e.target.value})} />
                                </div>
                                <div className="form-group" style={{flex:1}}>
                                    <label className="form-label">Repetir a cada (dias)</label>
                                    <input type="number" className="form-input" min="1" value={editCampanha.intervalo_dias} onChange={e=>setEditCampanha({...editCampanha, intervalo_dias: e.target.value})} />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{width:'100%', padding:'1rem', marginTop:'0.5rem'}}>
                                💾 Salvar Alterações
                            </button>
                        </form>
                    </div>
                </div>
            )}
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
