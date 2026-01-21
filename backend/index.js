require('dotenv').config();
const express = require('express');
const multer = require('multer');
const pdf = require('pdf-extraction'); // <--- Mudamos aqui para a nova lib
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

const PORT = process.env.PORT || 3000;
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://127.0.0.1:8000/analisar';

app.post('/api/analyze', upload.single('file'), async (req, res) => {
    try {
        // 1. Validação Básica
        if (!req.file || !req.body.jobDescription) {
            // Compatibilidade com frontend antigo (caso envie como 'vaga')
            const vagaTexto = req.body.jobDescription || req.body.vaga;
            if (!req.file || !vagaTexto) {
                return res.status(400).json({ error: "Faltou o arquivo PDF ou a descrição da vaga." });
            }
            req.body.jobDescription = vagaTexto;
        }

        console.log("📄 Recebi um PDF! Lendo com pdf-extraction...");

        // 2. Ler o PDF (Usando a nova biblioteca)
        const bufferDoArquivo = req.file.buffer;
        
        let textoDoCurriculo = "";
        try {
            const data = await pdf(bufferDoArquivo);
            textoDoCurriculo = data.text;
            
            // Verificação extra: se o PDF for imagem puras, o texto vem vazio
            if (!textoDoCurriculo || textoDoCurriculo.trim().length === 0) {
                throw new Error("O PDF está vazio ou é uma imagem escaneada (sem texto selecionável).");
            }
            
        } catch (pdfError) {
            console.error("❌ Erro ao ler PDF:", pdfError);
            return res.status(500).json({ 
                error: "Não consegui ler o texto do PDF. Certifique-se que não é uma imagem escaneada." 
            });
        }

        console.log("🤖 Enviando texto extraído para IA...");

        // 3. Enviar para o Python
        const respostaPython = await axios.post(PYTHON_API_URL, {
            curriculo: textoDoCurriculo,
            vaga: req.body.jobDescription
        });

        console.log("✅ Sucesso! Nota:", respostaPython.data.nota);
        res.json(respostaPython.data);

    } catch (error) {
        console.error("❌ Erro no Servidor:", error.message);
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({ error: "O serviço de IA (Python) parece desligado." });
        }
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 API Gateway rodando na porta ${PORT}`);
});