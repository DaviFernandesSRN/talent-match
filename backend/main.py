import os
import io
import pypdf
import spacy
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq

# --- 1. CONFIGURAÇÃO DE AMBIENTE E IA ---

# Força o download do modelo SpaCy se ele não estiver presente no servidor
try:
    nlp = spacy.load("pt_core_news_md")
except:
    os.system("python -m spacy download pt_core_news_md")
    nlp = spacy.load("pt_core_news_md")

# Configuração da API Groq (Llama 3.3)
# No Render, lembre-se de configurar a variável de ambiente GROQ_API_KEY
MINHA_CHAVE = os.getenv("GROQ_API_KEY", "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")
client = Groq(api_key=MINHA_CHAVE)

# --- 2. INSTÂNCIA DO APP (ORDEM CORRETA PARA O RENDER) ---
app = FastAPI()

# --- 3. CONFIGURAÇÃO DE CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 4. FUNÇÕES AUXILIARES ---

async def ler_pdf(arquivo: UploadFile):
    """Lê o conteúdo de um arquivo PDF e extrai o texto."""
    try:
        content = await arquivo.read()
        pdf_reader = pypdf.PdfReader(io.BytesIO(content))
        texto = ""
        for page in pdf_reader.pages:
            texto += page.extract_text() or ""
        return texto
    except Exception as e:
        print(f"Erro ao ler PDF: {e}")
        return ""

# --- 5. ROTAS ---

@app.post("/analisar")
async def analisar(
    file: UploadFile = File(...),
    jobDescription: str = Form(None),
    jobFile: UploadFile = File(None)
):
    # Extração de texto do currículo e da vaga
    texto_curriculo = await ler_pdf(file)
    texto_vaga = await ler_pdf(jobFile) if jobFile else jobDescription
    
    if not texto_curriculo or not texto_vaga:
        return {"nota": 0, "feedback": "Erro: Dados incompletos. Por favor, anexe o PDF e a descrição da vaga."}

    # Cálculo de similaridade técnica básica usando NLP
    doc1 = nlp(texto_curriculo[:50000])
    doc2 = nlp(texto_vaga[:50000])
    nota_similaridade = round(doc1.similarity(doc2) * 100, 2)

    # Auditoria detalhada via Inteligência Artificial (Groq/Llama)
    try:
        chat_completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile", 
            messages=[
                {
                    "role": "system", 
                    "content": "Você é o Auditor Técnico da TalentMatch. Gere o relatório com: Resumo da Trajetória, Análise de Gaps e PONTOS DE INVESTIGAÇÃO (O PULO DO GATO)."
                },
                {
                    "role": "user", 
                    "content": f"CURRÍCULO: {texto_curriculo[:6000]} \nVAGA: {texto_vaga[:3000]}"
                }
            ],
            temperature=0.1
        )
        feedback_ia = chat_completion.choices[0].message.content
    except Exception as e:
        feedback_ia = f"Erro ao processar análise avançada: {str(e)}"

    return {
        "nota": nota_similaridade,
        "feedback": feedback_ia
    }

@app.get("/")
def home():
    return {"status": "Servidor TalentMatch Online"}