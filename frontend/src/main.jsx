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
    print("✅ Spacy carregado!")
except:
    print("⚠️ Baixando Spacy...")
    os.system("python -m spacy download pt_core_news_md")
    nlp = spacy.load("pt_core_news_md")

# --- FUNÇÃO AJUDANTE PARA LER PDF ---
async def ler_pdf(arquivo: UploadFile):
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

@app.post("/analisar")
async def analisar(
    file: UploadFile = File(...),              # Currículo (Obrigatório)
    jobDescription: str = Form(None),          # Texto da Vaga (Opcional)
    jobFile: UploadFile = File(None)           # PDF da Vaga (Opcional)
):
    print(f"📩 Recebendo análise...")

    # 1. Ler o Currículo (Candidato)
    texto_curriculo = await ler_pdf(file)
    if not texto_curriculo:
        return {"nota": 0, "feedback": "Erro: Não foi possível ler o PDF do currículo."}

    # 2. Ler a Vaga (Prioridade: PDF > Texto)
    texto_vaga = ""
    
    if jobFile:
        print("📂 Lendo PDF da vaga...")
        texto_vaga = await ler_pdf(jobFile)
    elif jobDescription:
        print("📝 Lendo texto da vaga...")
        texto_vaga = jobDescription
    
    # Se não tiver nem texto nem PDF da vaga, cancela
    if not texto_vaga:
        return {"nota": 0, "feedback": "Erro: Você precisa enviar a Vaga (Texto ou PDF)."}

    print(f"✅ Textos extraídos. Comparando...")

    # 3. Calcular Nota
    doc1 = nlp(texto_curriculo)
    doc2 = nlp(texto_vaga)
    nota = round(doc1.similarity(doc2) * 100, 2)

    # 4. Feedback IA
    feedback_texto = "Sem feedback."
    try:
        chat_completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile", 
            messages=[
                {
                    "role": "system",
                    "content": """
                    Você é um Recrutador Tech Sênior rigoroso e objetivo.
                    
                    SUA REGRA DE OURO: Você deve responder SEMPRE seguindo estritamente o template visual abaixo. 
                    Não adicione introduções. Vá direto ao ponto. Use Português do Brasil.
                    
                    TEMPLATE DE RESPOSTA:
                    💪 **Ponto Forte:** [Cite o principal ponto positivo técnico]
                    
                    ⚠️ **Gap Identificado:** [Cite o que falta ou poderia melhorar]
                    
                    💡 **Veredito:** [Uma frase final curta sobre a aderência]
                    """
                },
                {
                    "role": "user",
                    "content": f"""
                    Analise este Candidato para esta Vaga.
                    
                    CANDIDATO (CV): {texto_curriculo[:3000]}
                    VAGA: {texto_vaga[:2000]}
                    """
                }
            ],
            temperature=0.3, 
            max_tokens=250
        )
        feedback_texto = chat_completion.choices[0].message.content

    except Exception as e:
        feedback_texto = "Erro ao conectar com a IA."

    return {
        "nota": nota,
        "mensagem": "Sucesso",
        "feedback": feedback_texto
    }