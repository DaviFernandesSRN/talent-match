import os
import io
import pypdf
import spacy
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq

# 1. INSTANCIAR O APP PRIMEIRO (CORREÇÃO PARA O RENDER)
app = FastAPI()

# 2. CONFIGURAR MIDDLEWARE
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. CONFIGURAÇÕES
MINHA_CHAVE = os.getenv("GROQ_API_KEY")
client = Groq(api_key=MINHA_CHAVE)

try:
    nlp = spacy.load("pt_core_news_md")
except:
    os.system("python -m spacy download pt_core_news_md")
    nlp = spacy.load("pt_core_news_md")

# 4. FUNÇÕES E ROTAS
async def ler_pdf(arquivo: UploadFile):
    try:
        content = await arquivo.read()
        pdf_reader = pypdf.PdfReader(io.BytesIO(content))
        texto = "".join([page.extract_text() or "" for page in pdf_reader.pages])
        return texto
    except:
        return ""

@app.post("/analisar")
async def analisar(file: UploadFile = File(...), jobDescription: str = Form(None), jobFile: UploadFile = File(None)):
    texto_curriculo = await ler_pdf(file)
    texto_vaga = await ler_pdf(jobFile) if jobFile else jobDescription
    
    if not texto_curriculo or not texto_vaga:
        return {"nota": 0, "feedback": "Erro nos dados enviados."}

    doc1 = nlp(texto_curriculo[:50000])
    doc2 = nlp(texto_vaga[:50000])
    nota = round(doc1.similarity(doc2) * 100, 2)

    chat_completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile", 
        messages=[
            {"role": "system", "content": "Auditor Técnico TalentMatch. Gere o relatório com Resumo, Gaps e O PULO DO GATO."},
            {"role": "user", "content": f"CV: {texto_curriculo[:6000]} \nVAGA: {texto_vaga[:3000]}"}
        ],
        temperature=0.1
    )
    return {"nota": nota, "feedback": chat_completion.choices[0].message.content}