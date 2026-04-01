const data = `
-- TRT-2 (2ª Região - Grande SP e Baixada Santista) --
Vara do Trabalho de Arujá ; vtaruja01@trtsp.jus.br ; SP
1ª Vara do Trabalho de Barueri ; vtbarueri01@trtsp.jus.br ; SP
-- TRT-15 (15ª Região - Interior SP) --
1ª Vara do Trabalho de Americana ; daapiracicaba.scpiracicaba@trt15.jus.br ; SP
`;

const lines = data.split('\n').filter(l => l.trim().length > 0);
const records = lines.map(line => {
    const parts = line.split(/[;,|\t]/);
    return {
        nome: parts[0]?.trim(),
        email: parts[1]?.trim() || 'sem-email@teste.com',
        estado: parts[2]?.trim() || 'SP'
    };
});

fetch('http://localhost:3000/api/tribunais/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(records)
})
.then(res => res.json().then(j => ({s: res.status, d: j})))
.then(res => console.log(res))
.catch(err => console.error(err));
