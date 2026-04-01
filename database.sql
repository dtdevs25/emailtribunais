-- Create extension for UUIDs if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Schema for EmailPericia
CREATE SCHEMA IF NOT EXISTS emailpericia;

-- Set search path to simplify queries
SET search_path TO emailpericia, public;

-- Table: Tribunais (Courts)
CREATE TABLE IF NOT EXISTS tribunais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    estado VARCHAR(2) NOT NULL, -- e.g., SP, RJ
    cidade VARCHAR(100),
    email VARCHAR(255) NOT NULL,
    email_secundario VARCHAR(255),
    tipo VARCHAR(50) DEFAULT 'TJ', -- TJ, TRF, TRT, etc.
    ativo BOOLEAN DEFAULT TRUE,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: Templates (Email Content)
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    assunto VARCHAR(255) NOT NULL,
    corpo_html TEXT NOT NULL,
    corpo_texto TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: Campanhas (Automation Settings)
CREATE TABLE IF NOT EXISTS campanhas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
    intervalo_dias INTEGER DEFAULT 15,
    ativa BOOLEAN DEFAULT TRUE,
    proxima_execucao TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: Anexos (Stored in MinIO)
CREATE TABLE IF NOT EXISTS anexos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    minio_path VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100),
    tamanho_bytes BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: CampanhaAnexos (Linkage between campaigns and files)
CREATE TABLE IF NOT EXISTS campanha_anexos (
    campanha_id UUID REFERENCES campanhas(id) ON DELETE CASCADE,
    anexo_id UUID REFERENCES anexos(id) ON DELETE CASCADE,
    PRIMARY KEY (campanha_id, anexo_id)
);

-- Table: Envios (Logs of sent emails)
CREATE TABLE IF NOT EXISTS envios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campanha_id UUID REFERENCES campanhas(id) ON DELETE SET NULL,
    tribunal_id UUID REFERENCES tribunais(id) ON DELETE SET NULL,
    assunto VARCHAR(255),
    corpo_usado TEXT,
    status VARCHAR(20) DEFAULT 'enviado', -- enviado, erro
    erro_mensagem TEXT,
    enviado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: Configuracoes
CREATE TABLE IF NOT EXISTS configuracoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Initial settings seed
INSERT INTO configuracoes (chave, valor) VALUES 
('SMTP_HOST', ''),
('SMTP_PORT', '587'),
('SMTP_USER', ''),
('SMTP_PASS', ''),
('SMTP_FROM_NAME', 'Perito Judicial'),
('SMTP_FROM_EMAIL', ''),
('MINIO_ENDPOINT', ''),
('MINIO_PORT', '9000'),
('MINIO_ACCESS_KEY', ''),
('MINIO_SECRET_KEY', ''),
('MINIO_BUCKET', 'emailpericia'),
('APP_USER', 'admin'),
('APP_PASS', '$2b$10$wJ2vN96Z2m0l.wNfXgYkH.fK0pUyIu3kI9S2W6p7Lq8.r/Y3kY4K') -- admin123 (bcrypt)
ON CONFLICT DO NOTHING;
