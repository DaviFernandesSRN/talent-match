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
    texto_curriculo = await ler_pdf(file)
    if not texto_curriculo:
        return {"nota": 0, "feedback": "Erro: Currículo ilegível."}

    texto_vaga = ""
    if jobFile:
        texto_vaga = await ler_pdf(jobFile)
    elif jobDescription:
        texto_vaga = jobDescription
    
    if not texto_vaga:
        return {"nota": 0, "feedback": "Erro: Vaga não informada."}

    doc1 = nlp(texto_curriculo[:100000])
    doc2 = nlp(texto_vaga[:100000])
    nota = round(doc1.similarity(doc2) * 100, 2)

    try:
        chat_completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile", 
            messages=[
                {
                    "role": "system",
                    "content": """
                    Você é um Auditor Técnico de Carreira. 
                    Gere um relatório visualmente limpo, usando tópicos e negrito para tecnologias.
                    
                    TEMPLATE DE RESPOSTA OBRIGATÓRIO:
                    
                    ## 🧭 Resumo da Trajetória
                    > [Resumo curto e direto do perfil técnico do candidato.]
                    
                    ## ⚖️ Análise de Gaps
                    ### ✅ O que deu Match:
                    * [Listar competências que batem com a vaga]
                    
                    ### ❌ Pontos de Atenção (Gaps):
                    * **[Gap]:** [Breve explicação técnica]
                    
                    ## 📡 Radar de Senioridade
                    **Diagnóstico:** [Perfil Operacional vs Perfil de Resultados]
                    
                    * 📉 **Sinal de Alerta:** [Ex: Foco apenas em ferramentas, sem citar impactos.]
                    * 📈 **Evidência Positiva:** [Ex: Menção a métricas ou liderança técnica.]
                    """
                },
                {
                    "role": "user",
                    "content": f"CV: {texto_curriculo[:6000]} \n VAGA: {texto_vaga[:3000]}"
                }
            ],
            temperature=0.1, 
            max_tokens=700
        )
        feedback_texto = chat_completion.choices[0].message.content
    except Exception as e:
        feedback_texto = "Erro ao processar análise técnica."

    return {"nota": nota, "feedback": feedback_texto}