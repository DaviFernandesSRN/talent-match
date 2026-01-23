import os
import io
import pypdf
import spacy
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq

# --- CONFIGURAÇÃO ---
# Chave da API (Certifique-se de que a variável de ambiente está configurada no Render)
MINHA_CHAVE = os.getenv("GROQ_API_KEY", "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")
client = Groq(api_key=MINHA_CHAVE)

app = FastAPI()

# --- MIDDLEWARE CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CARREGAMENTO DO SPACY ---
try:
    nlp = spacy.load("pt_core_news_md")
except Exception:
    # Se não encontrar o modelo localmente, tenta baixar (comum em builds de primeira vez)
    os.system("python -m spacy download pt_core_news_md")
    nlp = spacy.load("pt_core_news_md")

# --- FUNÇÃO AUXILIAR: LEITURA DE PDF ---
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
    file: UploadFile = File(...),
    jobDescription: str = Form(None),
    jobFile: UploadFile = File(None)
):
    # 1. Extração de texto do Currículo
    texto_curriculo = await ler_pdf(file)
    if not texto_curriculo:
        return {"nota": 0, "feedback": "Erro: Não foi possível ler o texto do currículo."}

    # 2. Extração de texto da Vaga
    texto_vaga = ""
    if jobFile:
        texto_vaga = await ler_pdf(jobFile)
    elif jobDescription:
        texto_vaga = jobDescription
    
    if not texto_vaga:
        return {"nota": 0, "feedback": "Erro: Dados da vaga não informados."}

    # 3. Cálculo de similaridade com Spacy (Nota base)
    doc_cv = nlp(texto_curriculo[:50000])
    doc_job = nlp(texto_vaga[:50000])
    nota_base = round(doc_cv.similarity(doc_job) * 100, 2)

    # 4. Análise com IA (Groq/Llama-3)
    try:
        chat_completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile", 
            messages=[
                {
                    "role": "system",
                    "content": """
                    Você é um Auditor Técnico de Carreira especializado em TalentMatch. 
                    Seu objetivo é gerar um relatório técnico direto e baseado em evidências.
                    
                    ESTRUTURA OBRIGATÓRIA DA RESPOSTA:
                    
                    ## 🧭 Resumo da Trajetória
                    > [Breve parágrafo resumindo a senioridade e foco do candidato.]
                    
                    ## ⚖️ Análise de Gaps
                    ### ✅ O que deu Match:
                    * [Listar tecnologias presentes no CV que batem com a vaga]
                    
                    ### ❌ Pontos de Atenção (Gaps):
                    * **[Tecnologia/Habilidade]:** [Por que é um gap crítico?]
                    
                    ## 📡 Radar de Senioridade
                    **Diagnóstico:** [Perfil Operacional vs Perfil de Resultados]
                    * 📉 **Sinal de Alerta:** [O que falta para atingir a senioridade da vaga?]
                    * 📈 **Evidência Positiva:** [Pontos fortes de liderança ou impacto.]

                    ## 🎯 Pontos de Investigação (O Pulo do Gato)
                    * **Ponto 1:** [Evidência] Investigar como o candidato [pergunta para entrevista].
                    * **Ponto 2:** [Falta de evidência] Investigar experiência com [pergunta para entrevista].
                    * **Ponto 3:** [Inconsistência] Questionar sobre [pergunta para entrevista].
                    """
                },
                {
                    "role": "user",
                    "content": f"CURRÍCULO: {texto_curriculo[:6000]} \n VAGA: {texto_vaga[:3000]}"
                }
            ],
            temperature=0.1, 
            max_tokens=850
        )
        feedback_ia = chat_completion.choices[0].message.content
    except Exception as e:
        print(f"Erro na IA: {e}")
        feedback_ia = "Erro ao gerar análise técnica detalhada. Tente novamente."

    return {
        "nota": nota_base,
        "feedback": feedback_ia
    }

# Necessário para o Render identificar a porta
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run(app, host="0.0.0.0", port=port)