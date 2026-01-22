import os
import io
import pypdf
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import spacy
from groq import Groq 

# --- CONFIGURAÇÃO ---
# Tenta pegar a chave do ambiente (Render), senão usa a sua fixa
MINHA_CHAVE = os.getenv("GROQ_API_KEY", "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")
client = Groq(api_key=MINHA_CHAVE)

app = FastAPI()

# Permite que o Frontend (Vercel) converse com o Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SPACY (Para cálculo matemático da nota) ---
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
    file: UploadFile = File(...),              # Currículo
    jobDescription: str = Form(None),          # Texto da Vaga
    jobFile: UploadFile = File(None)           # PDF da Vaga
):
    print(f"📩 Recebendo análise...")

    # 1. Ler o Currículo
    texto_curriculo = await ler_pdf(file)
    if not texto_curriculo:
        return {"nota": 0, "feedback": "Erro: Não foi possível ler o PDF do currículo."}

    # 2. Ler a Vaga
    texto_vaga = ""
    if jobFile:
        print("📂 Lendo PDF da vaga...")
        texto_vaga = await ler_pdf(jobFile)
    elif jobDescription:
        print("📝 Lendo texto da vaga...")
        texto_vaga = jobDescription
    
    if not texto_vaga:
        return {"nota": 0, "feedback": "Erro: Você precisa enviar a Vaga (Texto ou PDF)."}

    print(f"✅ Textos extraídos. Comparando...")

    # 3. Calcular Nota (Similaridade Matemática)
    doc1 = nlp(texto_curriculo[:100000]) # Limite de caracteres por segurança
    doc2 = nlp(texto_vaga[:100000])
    nota = round(doc1.similarity(doc2) * 100, 2)

    # 4. Análise Qualitativa (IA - Llama 3)
    feedback_texto = "Sem feedback."
    try:
        chat_completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile", 
            messages=[
                {
                    "role": "system",
                    "content": """
                    Você é um Headhunter Sênior e Consultor de Carreira Tech.
                    Sua análise será lida por um CTO ou Gestor de RH exigente.
                    
                    OBJETIVO:
                    Analise a aderência do candidato à vaga e forneça um relatório estruturado para tomada de decisão rápida.
                    
                    REGRA DE OURO:
                    Siga ESTRITAMENTE o template visual abaixo (Markdown). Não invente introduções.
                    
                    TEMPLATE DE RESPOSTA:
                    
                    ## 📋 Resumo Executivo
                    [Sintetize em 2 ou 3 linhas: O candidato está pronto? É Júnior demais? É Overqualified?]
                    
                    ## 🛠️ Análise Técnica (Hard Skills)
                    * ✅ **Match:** [Liste as tecnologias chaves que ele TEM]
                    * ❌ **Gap:** [Liste o que a vaga pede e ele NÃO TEM ou não citou]
                    
                    ## 🧠 Análise Comportamental (Inferida)
                    * **Soft Skills:** [Infira baseado na escrita/histórico. Ex: Liderança, Comunicação, Resiliência]
                    * **Cultural Fit:** [O tom é acadêmico? Startup "hands-on"? Corporativo formal?]
                    
                    ## 🎯 Perguntas para Entrevista (Ouro)
                    1. [Crie uma pergunta técnica difícil sobre um Gap identificado]
                    2. [Crie uma pergunta situacional sobre soft skills]
                    3. [Crie uma pergunta para validar a experiência real]
                    
                    ## 💡 Veredito Final
                    [Uma frase de impacto recomendando ou não a entrevista]
                    """
                },
                {
                    "role": "user",
                    "content": f"""
                    CANDIDATO (CV): {texto_curriculo[:6000]}
                    ---
                    VAGA: {texto_vaga[:3000]}
                    """
                }
            ],
            temperature=0.4, # Criativo mas preciso
            max_tokens=600
        )
        feedback_texto = chat_completion.choices[0].message.content

    except Exception as e:
        print(f"Erro na IA: {e}")
        feedback_texto = "Erro ao gerar análise inteligente. O servidor de IA pode estar ocupado."

    return {
        "nota": nota,
        "mensagem": "Sucesso",
        "feedback": feedback_texto
    }