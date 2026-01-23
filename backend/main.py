import os
import io
import pypdf
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq

# 1. INSTANCIAR O APP (ORDEM CORRETA)
app = FastAPI()

# 2. CONFIGURAR MIDDLEWARE
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. CONFIGURAÇÃO IA
MINHA_CHAVE = os.getenv("GROQ_API_KEY", "SUA_CHAVE_AQUI")
client = Groq(api_key=MINHA_CHAVE)

async def ler_pdf(arquivo: UploadFile):
    try:
        content = await arquivo.read()
        pdf_reader = pypdf.PdfReader(io.BytesIO(content))
        return "".join([page.extract_text() or "" for page in pdf_reader.pages])
    except:
        return ""

# 4. ROTA DE ANÁLISE ULTRA-LEVE
@app.post("/analisar")
async def analisar(file: UploadFile = File(...), jobDescription: str = Form(None), jobFile: UploadFile = File(None)):
    texto_curriculo = await ler_pdf(file)
    texto_vaga = await ler_pdf(jobFile) if jobFile else jobDescription
    
    if not texto_curriculo or not texto_vaga:
        return {"nota": 0, "feedback": "Erro nos arquivos."}

    # IA realiza 100% da auditoria técnica
    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "Você é o Auditor TalentMatch. Analise o CV e a Vaga. Retorne no formato: NOTA: [valor de 0 a 100] seguida do relatório com Resumo, Gaps e Pulo do Gato."},
            {"role": "user", "content": f"CV: {texto_curriculo[:8000]}\nVAGA: {texto_vaga[:4000]}"}
        ]
    )
    
    resposta = completion.choices[0].message.content
    
    # Extrai a nota do texto (ex: "NOTA: 85") ou define padrão 70 se não encontrar
    try:
        nota_str = resposta.split("NOTA:")[1].split()[0].replace("%", "")
        nota = float(nota_str)
    except:
        nota = 70 

    return {"nota": nota, "feedback": resposta}