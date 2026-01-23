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
MINHA_CHAVE = os.getenv("GROQ_API_KEY", "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")
client = Groq(api_key=MINHA_CHAVE)

try:
    nlp = spacy.load("pt_core_news_md")
except:
    os.system("python -m spacy download pt_core_news_md")
    nlp = spacy.load("pt_core_news_md")

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

# --- 4. ROTAS ---
@app.post("/analisar")
async def analisar(
    file: UploadFile = File(...),
    jobDescription: str = Form(None),
    jobFile: UploadFile = File(None)
):
    texto_curriculo = await ler_pdf(file)
    texto_vaga = ""
    if jobFile:
        texto_vaga = await ler_pdf(jobFile)
    elif jobDescription:
        texto_vaga = jobDescription
    
    if not texto_curriculo or not texto_vaga:
        return {"nota": 0, "feedback": "Erro: Dados incompletos."}

    doc1 = nlp(texto_curriculo[:50000])
    doc2 = nlp(texto_vaga[:50000])
    nota = round(doc1.similarity(doc2) * 100, 2)

    try:
        chat_completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile", 
            messages=[
                {
                    "role": "system",
                    "content": """Você é um Auditor Técnico. Gere o relatório rigorosamente neste padrão:
                    ## 🧭 Resumo da Trajetória
                    ## ⚖️ Análise de Gaps
                    ## 🎯 PONTOS DE INVESTIGAÇÃO (O PULO DO GATO)
                    (Siga exatamente a formatação do PDF Auditoria_36.6)"""
                },
                {
                    "role": "user",
                    "content": f"CV: {texto_curriculo[:6000]} \n VAGA: {texto_vaga[:3000]}"
                }
            ],
            temperature=0.1
        )
        feedback = chat_completion.choices[0].message.content
    except:
        feedback = "Erro ao gerar análise."

    return {"nota": nota, "feedback": feedback}