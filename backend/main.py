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

# --- SPACY (Cálculo Matemático) ---
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
        return {"nota": 0, "feedback": "Erro: Currículo ilegível."}

    # 2. Ler Vaga
    texto_vaga = ""
    if jobFile:
        texto_vaga = await ler_pdf(jobFile)
    elif jobDescription:
        texto_vaga = jobDescription
    
    if not texto_vaga:
        return {"nota": 0, "feedback": "Erro: Vaga não informada."}

    # 3. Nota Matemática (Spacy)
    doc1 = nlp(texto_curriculo[:100000])
    doc2 = nlp(texto_vaga[:100000])
    nota = round(doc1.similarity(doc2) * 100, 2)

    # 4. Análise "Mapa de Investigação" (Prompt V3 - Auditoria Técnica)
    feedback_texto = "Análise indisponível."
    try:
        chat_completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile", 
            messages=[
                {
                    "role": "system",
                    "content": """
                    Você é um Auditor Técnico de Carreira e Data Analyst de RH.
                    Sua função NÃO é elogiar o candidato, mas fornecer um MAPA DE INVESTIGAÇÃO baseado puramente em dados e evidências do texto.
                    
                    DIRETRIZES:
                    1. Elimine subjetividades. Não use "parece ser proativo" ou "boa comunicação".
                    2. Foco em EVIDÊNCIAS: O candidato citou números? Citou tecnologias específicas?
                    3. Seja cético: Se ele diz "Sênior" mas só descreve tarefas operacionais, aponte isso.
                    
                    ESTRUTURA DE RESPOSTA OBRIGATÓRIA (Markdown):
                    
                    ## 🧭 Resumo da Trajetória
                    [Sintetize em 2 linhas a movimentação de carreira. Ex: "Perfil especialista em Backend migrando para Fullstack..."]
                    
                    ## ⚖️ Análise de Gaps (O que tem vs. O que falta)
                    * ✅ **Match Confirmado:** [Liste apenas tecnologias que constam explicitamente no CV]
                    * ❌ **Ponto Cego (Gap):** [Liste requisitos da vaga que NÃO aparecem no CV]
                    
                    ## 📡 Radar de Senioridade
                    [Analise se o texto descreve RESULTADOS (Ex: "Reduzi custo em 20%") ou apenas TAREFAS ("Responsável por AWS"). Classifique se a descrição é condizente com o nível da vaga.]
                    
                    ## 🕵️‍♂️ Pontos de Investigação (O Pulo do Gato)
                    [Cruze a vaga com o CV e liste 3 inconsistências ou faltas de detalhe para o gestor investigar na entrevista]
                    * 🔍 **Ponto 1:** [Ex: "Cita Liderança Técnica, mas não menciona tamanho do time. Investigar escopo real."]
                    * 🔍 **Ponto 2:** [Ex: "Experiência em Python parece acadêmica, vaga exige Sênior. Investigar cases reais em produção."]
                    * 🔍 **Ponto 3:** [Outro ponto de atenção crítica]
                    """
                },
                {
                    "role": "user",
                    "content": f"CV: {texto_curriculo[:6000]} \n VAGA: {texto_vaga[:3000]}"
                }
            ],
            temperature=0.1, # Temperatura baixíssima para máxima precisão e zero alucinação
            max_tokens=600
        )
        feedback_texto = chat_completion.choices[0].message.content

    except Exception as e:
        print(f"Erro IA: {e}")
        feedback_texto = "Erro ao gerar análise. Tente novamente."

    return {
        "nota": nota,
        "feedback": feedback_texto
    }