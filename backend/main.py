import os
import io
import pypdf
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import spacy
from groq import Groq 

# --- CONFIGURAÇÃO DA CHAVE ---
MINHA_CHAVE = os.getenv("GROQ_API_KEY", "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")
client = Groq(api_key=MINHA_CHAVE)

app = FastAPI()

# --- LIBERAR O ACESSO (CORS) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SPACY ---
try:
    nlp = spacy.load("pt_core_news_md")
    print("✅ Spacy carregado!")
except:
    print("⚠️ Baixando Spacy...")
    os.system("python -m spacy download pt_core_news_md")
    nlp = spacy.load("pt_core_news_md")

@app.post("/analisar")
async def analisar(file: UploadFile = File(...), jobDescription: str = Form(...)):
    print(f"📩 Recebendo arquivo: {file.filename}")

    # 1. Ler o PDF (Extrair texto)
    try:
        content = await file.read()
        pdf_reader = pypdf.PdfReader(io.BytesIO(content))
        texto_curriculo = ""
        for page in pdf_reader.pages:
            texto_curriculo += page.extract_text() or ""
            
        print(f"📄 Texto extraído (primeiros 50 chars): {texto_curriculo[:50]}...")
    except Exception as e:
        return {"nota": 0, "feedback": f"Erro ao ler PDF: {str(e)}"}

    # 2. Calcular Nota (Similaridade)
    doc1 = nlp(texto_curriculo)
    doc2 = nlp(jobDescription)
    nota = round(doc1.similarity(doc2) * 100, 2)

    # 3. Gerar Feedback com IA
    feedback_texto = "Sem feedback."
    try:
        chat_completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile", 
            messages=[
                {
                    "role": "system",
                    "content": "Você é um recrutador Tech Sênior. Responda em Português do Brasil."
                },
                {
                    "role": "user",
                    "content": f"""
                    Analise este Candidato para esta Vaga.
                    Seja curto e direto (máximo 3 linhas).
                    Dê 1 ponto forte e 1 ponto de melhoria (gap).

                    CANDIDATO (Texto do PDF): {texto_curriculo[:3000]}
                    VAGA: {jobDescription[:2000]}
                    """
                }
            ],
        )
        feedback_texto = chat_completion.choices[0].message.content
        print("✅ Sucesso! Groq respondeu.")

    except Exception as e:
        print(f"❌ Erro Groq: {e}")
        feedback_texto = "Erro ao conectar com a IA."

    return {
        "nota": nota,
        "mensagem": "Sucesso",
        "feedback": feedback_texto
    }