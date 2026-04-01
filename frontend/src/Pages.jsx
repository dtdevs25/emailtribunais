import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, Gavel, Mail, Calendar, Paperclip, 
    History, TrendingUp, CheckCircle, Clock, AlertCircle, X, Plus, UploadCloud
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
                <div>
                    <h1 className="page-title">Central de Controle</h1>
                    <p className="page-subtitle">Visão geral do sistema de nomeações.</p>
                </div>
            </div>

            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                <div className="card stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
                    <div className="stat-icon-box" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <div className="stat-label">Total Enviados</div>
                        <div className="stat-value">{stats.totalEnvios}</div>
                    </div>
                </div>
                
                <div className="card stat-card" style={{ borderLeft: '4px solid var(--secondary)' }}>
                    <div className="stat-icon-box" style={{ background: 'rgba(14, 165, 233, 0.1)', color: 'var(--secondary)' }}>
                        <Gavel size={24} />
                    </div>
                    <div>
                        <div className="stat-label">VTs Cadastradas</div>
                        <div className="stat-value">{stats.totalTribunais}</div>
                    </div>
                </div>

                <div className="card stat-card" style={{ borderLeft: '4px solid var(--success)' }}>
                    <div className="stat-icon-box" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <div className="stat-label">Taxa de Sucesso</div>
                        <div className="stat-value">{sRate}%</div>
                    </div>
                </div>
            </div>
            <div style={{ marginBottom: '2rem' }}>
                <div className="card stat-card" style={{ borderLeft: '4px solid var(--warning)', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <div className="stat-icon-box" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
                        <Calendar size={24} />
                    </div>
                    <div>
                        <div className="stat-label">Campanhas Ativas</div>
                        <div className="stat-value">{stats.totalCampanhas}</div>
                    </div>
                </div>
            </div>

            <div className="card">
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
                                            <span className="badge badge-success"><CheckCircle size={14}/> SUCESSO</span> :
                                            <span className="badge badge-error"><X size={14}/> FALHA</span>
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

    const loadData = () => {
        api.get('/tribunais').then(res => setTribunais(res.data)).catch(() => toast.error('Erro ao listar tribunais'));
    }

    useEffect(() => loadData(), []);

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
            toast.error('Falha ao inserir em massa. Verifique o formato do texto.');
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
                            </tr>
                        </thead>
                        <tbody>
                            {tribunais.map(t => (
                                <tr key={t.id}>
                                    <td style={{fontWeight:500, color: 'var(--text-main)'}}>{t.nome}</td>
                                    <td style={{color: 'var(--text-muted)'}}>{t.email}</td>
                                    <td><span className="badge badge-warning">{t.estado}</span></td>
                                </tr>
                            ))}
                            {tribunais.length === 0 && (
                                <tr>
                                    <td colSpan="3" style={{textAlign:'center', padding: '3rem', color: 'var(--text-light)'}}>
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
        </div>
    );
};

export const Campanhas = () => {
    const [campanhas, setCampanhas] = useState([]);
    const [novaCampanha, setNovaCampanha] = useState({nome: '', assunto: '', corpo_html: '', intervalo_dias: 15});
    const [filesToUpload, setFilesToUpload] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadData = () => {
        api.get('/campanhas').then(res => setCampanhas(res.data)).catch(() => toast.error('Erro ao listar'));
    };
    useEffect(() => loadData(), []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const anexo_ids = [];
            // Handle Anexos (file uploads) before creating campaign
            if (filesToUpload.length > 0) {
                toast.success(`Fazendo upload de ${filesToUpload.length} anexos...`);
                for(const file of filesToUpload) {
                    const formData = new FormData();
                    formData.append('file', file);
                    const fileRes = await api.post('/anexos/upload', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    anexo_ids.push(fileRes.data.id);
                }
            }

            // Create Campaign
            await api.post('/campanhas', { ...novaCampanha, anexo_ids });
            toast.success('Regra e Campanha programada com sucesso!');
            setNovaCampanha({nome: '', assunto: '', corpo_html: '', intervalo_dias: 15});
            setFilesToUpload([]);
            loadData();
        } catch(err) {
            toast.error('Erro ao programar campanha e anexos.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Disparos e Mensagens</h1>
                    <p className="page-subtitle">Configure o modelo de e-mail e ative automações.</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div className="card" style={{ flex: '2 1 450px' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>Nova Campanha de Apresentação</h3>
                    <form onSubmit={handleCreate}>
                        <div className="form-group">
                            <label className="form-label">Título da Campanha (Interno)</label>
                            <input className="form-input" required value={novaCampanha.nome} onChange={e=>setNovaCampanha({...novaCampanha, nome: e.target.value})} placeholder="Ex: Disparo Geral - Varas do RJ" />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Assunto do E-mail</label>
                            <input className="form-input" required value={novaCampanha.assunto} onChange={e=>setNovaCampanha({...novaCampanha, assunto: e.target.value})} placeholder="Apresentação de Serviços (Perícia Contábil) - Dr. Nome" />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Conteúdo Dinâmico (HTML ACEITO)</label>
                            <textarea 
                                className="form-input" 
                                style={{ height: '220px', fontFamily: 'monospace', fontSize: '0.85rem' }} 
                                required 
                                value={novaCampanha.corpo_html} 
                                onChange={e=>setNovaCampanha({...novaCampanha, corpo_html: e.target.value})}
                                placeholder="<p>Prezado Excelentíssimo Senhor Juiz da {{nome_tribunal}},</p><p>Gostaria de me colocar à disposição para nomeações.</p>"
                            ></textarea>
                            <small style={{color:'var(--text-muted)'}}>Variáveis Mágicas: Digite <strong style={{color:'var(--primary)'}}>{`{{nome_tribunal}}`}</strong> no texto para citar o nome dinamicamente para cada juízo!</small>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Anexar Documentos/Currículos (.pdf, .doc)</label>
                            <input 
                                type="file" 
                                multiple 
                                className="form-input" 
                                onChange={(e) => setFilesToUpload(Array.from(e.target.files))}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Repetição Automática (Dias para cobrar/reenviar)</label>
                            <input type="number" className="form-input" min="1" value={novaCampanha.intervalo_dias} onChange={e=>setNovaCampanha({...novaCampanha, intervalo_dias: e.target.value})} />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{width:'100%', marginTop: '1rem', padding: '1rem'}} disabled={loading}>
                            {loading? 'Processando...' : 'Salvar Regra e Ativar Servidor de Disparos'}
                        </button>
                    </form>
                </div>

                <div className="card" style={{ flex: '1 1 300px', alignSelf: 'flex-start' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>Campanhas Ativas</h3>
                    {campanhas.length === 0 && <p style={{color:'var(--text-light)', fontSize: '0.9rem'}}>Nenhuma campanha vinculada.</p>}
                    <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
                        {campanhas.map(c => (
                            <div key={c.id} style={{padding:'1.25rem', background:'var(--bg-main)', borderRadius:'var(--radius-md)', border:'1px solid var(--border-light)'}}>
                                <strong style={{color: 'var(--text-main)', display:'block', marginBottom: '0.25rem'}}>{c.nome}</strong>
                                <div style={{fontSize:'0.85rem', color:'var(--text-muted)'}}>{c.assunto}</div>
                                
                                {c.anexos && c.anexos[0] && c.anexos[0].nome !== null && (
                                    <div style={{marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--secondary)'}}>
                                        <Paperclip size={14} style={{verticalAlign: 'middle', marginRight: '4px'}}/>
                                        {c.anexos.map(a => a.nome).join(', ')}
                                    </div>
                                )}
                                
                                <div style={{marginTop:'1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <span className="badge badge-success">Em Operação</span>
                                    <span style={{fontSize: '0.75rem', color: 'var(--text-light)'}}>Ciclo: a cada {c.intervalo_dias} dias</span>
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
