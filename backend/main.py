import os
import io
import pypdf
import spacy
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq

# --- 1. INSTANCIAR O APP PRIMEIRO (CORREÇÃO DO ERRO NO RENDER) ---
app = FastAPI()

# --- 2. CONFIGURAR MIDDLEWARE ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 3. CONFIGURAÇÕES E IA ---
# A chave é buscada das variáveis de ambiente do Render para maior segurança
MINHA_CHAVE = os.getenv("GROQ_API_KEY", "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")
client = Groq(api_key=MINHA_CHAVE)

# Tenta carregar o modelo de processamento de linguagem
try:
    nlp = spacy.load("pt_core_news_md")
except:
    nlp = None

async def ler_pdf(arquivo: UploadFile):
    try:
        content = await arquivo.read()
        pdf_reader = pypdf.PdfReader(io.BytesIO(content))
        texto = ""
        for page in pdf_reader.pages:
            texto += page.extract_text() or ""
        return texto
    except:
        return ""

# --- 4. ROTAS (AGORA DECLARADAS APÓS O APP EXISTIR) ---
@app.post("/analisar")
async def analisar(
    file: UploadFile = File(...),
    jobDescription: str = Form(None),
    jobFile: UploadFile = File(None)
):
    texto_curriculo = await ler_pdf(file)
    texto_vaga = await ler_pdf(jobFile) if jobFile else jobDescription
    
    if not texto_curriculo or not texto_vaga:
        return {"nota": 0, "feedback": "Erro: Dados incompletos. Verifique os arquivos."}

    # Cálculo de similaridade técnica
    nota = 0
    if nlp:
        doc1 = nlp(texto_curriculo[:50000])
        doc2 = nlp(texto_vaga[:50000])
        nota = round(doc1.similarity(doc2) * 100, 2)

    try:
        chat_completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile", 
            messages=[
                {
                    "role": "system", 
                    "content": "Você é um Auditor Técnico. Gere relatórios com: Resumo da Trajetória, Análise de Gaps e PONTOS DE INVESTIGAÇÃO (O PULO DO GATO)."
                },
                {
                    "role": "user", 
                    "content": f"CV: {texto_curriculo[:6000]} \nVAGA: {texto_vaga[:3000]}"
                }
            ],
            temperature=0.1
        )
        feedback = chat_completion.choices[0].message.content
    except Exception as e:
        feedback = f"Falha na análise da IA: {str(e)}"

    return {"nota": nota, "feedback": feedback}