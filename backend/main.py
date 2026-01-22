import os
import io
import pypdf
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import spacy
from groq import Groq 

# --- CONFIGURAÇÃO ---
MINHA_CHAVE = os.getenv("GROQ_API_KEY", "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")
client = Groq(api_key=MINHA_CHAVE)

app = FastAPI()

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
except:
    os.system("python -m spacy download pt_core_news_md")
    nlp = spacy.load("pt_core_news_md")

# --- LEITURA DE PDF ---
async def ler_pdf(arquivo: UploadFile):
    try:
        content = await arquivo.read()
        pdf_reader = pypdf.PdfReader(io.BytesIO(content))
        texto = ""
        for page in pdf_reader.pages:
            texto += page.extract_text() or ""
        return texto
    except Exception as e:
        print(f"Erro PDF: {e}")
        return ""

@app.post("/analisar")
async def analisar(
    file: UploadFile = File(...),
    jobDescription: str = Form(None),
    jobFile: UploadFile = File(None)
):
    # 1. Ler Currículo
    texto_curriculo = await ler_pdf(file)
    if not texto_curriculo:
        return {"nota": 0, "feedback": "Erro ao ler currículo."}

    # 2. Ler Vaga
    texto_vaga = ""
    if jobFile:
        texto_vaga = await ler_pdf(jobFile)
    elif jobDescription:
        texto_vaga = jobDescription
    
    if not texto_vaga:
        return {"nota": 0, "feedback": "Erro: Envie a descrição da vaga."}

    # 3. Nota Matemática
    doc1 = nlp(texto_curriculo[:100000])
    doc2 = nlp(texto_vaga[:100000])
    nota = round(doc1.similarity(doc2) * 100, 2)

    # 4. Análise IA (FOCADA SÓ EM HARD SKILLS)
    feedback_texto = "Sem feedback."
    try:
        chat_completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile", 
            messages=[
                {
                    "role": "system",
                    "content": """
                    Você é um Especialista Técnico de TI focado estritamente em Hard Skills.
                    
                    OBJETIVO:
                    Mapear quais tecnologias o candidato domina e quais faltam para a vaga.
                    NÃO analise perfil comportamental. NÃO faça perguntas de entrevista.
                    
                    TEMPLATE DE RESPOSTA (Siga estritamente):
                    
                    ## 📋 Resumo Técnico
                    [Resumo de 2 linhas sobre a capacidade técnica do candidato]
                    
                    ## 🛠️ Análise de Hard Skills
                    * ✅ **Domina:** [Liste as tecnologias da vaga que ele TEM]
                    * ❌ **Falta (Gaps):** [Liste as tecnologias da vaga que ele NÃO TEM]
                    
                    ## 💡 Veredito Técnico
                    [Aprovado tecnicamente ou Reprovado? Justifique em 1 frase]
                    """
                },
                {
                    "role": "user",
                    "content": f"CV: {texto_curriculo[:6000]} \n VAGA: {texto_vaga[:3000]}"
                }
            ],
            temperature=0.2, # Mais preciso e menos criativo
            max_tokens=400
        )
        feedback_texto = chat_completion.choices[0].message.content

    except Exception:
        feedback_texto = "Erro na IA."

    return {
        "nota": nota,
        "feedback": feedback_texto
    }