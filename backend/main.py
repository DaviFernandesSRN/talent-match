import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # <--- IMPORTANTE
from pydantic import BaseModel
import spacy
from groq import Groq 

# --- CONFIGURAÇÃO DA CHAVE ---
# Tenta pegar do ambiente (Render), se não tiver, usa a fixa (para teste local)
MINHA_CHAVE = os.getenv("GROQ_API_KEY", "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")

client = Groq(api_key=MINHA_CHAVE)

app = FastAPI()

# --- LIBERAR O ACESSO (CORS) ---
# Isso permite que a Vercel converse com o Render
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Libera geral (para facilitar). Em produção real, você colocaria só a URL da Vercel.
    allow_credentials=True,
    allow_methods=["*"],  # Libera todos os métodos (POST, GET, etc)
    allow_headers=["*"],  # Libera todos os cabeçalhos
)

# --- SPACY ---
try:
    nlp = spacy.load("pt_core_news_md")
    print("✅ Spacy carregado!")
except:
    print("⚠️ Baixando Spacy...")
    os.system("python -m spacy download pt_core_news_md")
    nlp = spacy.load("pt_core_news_md")

class Dados(BaseModel):
    curriculo: str
    vaga: str

@app.post("/analisar")
def analisar(dados: Dados):
    print("📩 Recebendo pedido...")

    # 1. Nota Numérica
    doc1 = nlp(dados.curriculo)
    doc2 = nlp(dados.vaga)
    nota = round(doc1.similarity(doc2) * 100, 2)

    # 2. Feedback
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
                    Compare este CV e esta Vaga.
                    Seja curto e direto (máximo 3 linhas).
                    Cite 1 ponto forte e 1 ponto de melhoria (gap).

                    CV: {dados.curriculo[:3000]}
                    VAGA: {dados.vaga[:3000]}
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