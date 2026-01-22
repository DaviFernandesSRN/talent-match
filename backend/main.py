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
        return {"nota": 0, "feedback": "Erro: Currículo ilegível."}

    # 2. Ler Vaga
    texto_vaga = ""
    if jobFile:
        texto_vaga = await ler_pdf(jobFile)
    elif jobDescription:
        texto_vaga = jobDescription
    
    if not texto_vaga:
        return {"nota": 0, "feedback": "Erro: Vaga não informada."}

    # 3. Nota Matemática
    doc1 = nlp(texto_curriculo[:100000])
    doc2 = nlp(texto_vaga[:100000])
    nota = round(doc1.similarity(doc2) * 100, 2)

    # 4. Análise IA (Prompt Formatado para Leitura Dinâmica)
    feedback_texto = "Análise indisponível."
    try:
        chat_completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile", 
            messages=[
                {
                    "role": "system",
                    "content": """
                    Você é um Auditor Técnico de Carreira.
                    Sua missão é gerar um relatório visualmente limpo, usando listas e tópicos para facilitar a leitura rápida.
                    
                    DIRETRIZES DE FORMATAÇÃO (Markdown):
                    - Use listas (bullet points) sempre que citar mais de 2 itens.
                    - Use **Negrito** para destacar tecnologias ou palavras-chave.
                    - Pule linhas entre os tópicos para dar respiro.
                    
                    TEMPLATE DE RESPOSTA OBRIGATÓRIO:
                    
                    ## 🧭 Resumo da Trajetória
                    > [Escreva aqui um parágrafo curto e direto, em itálico ou blockquote, resumindo o perfil.]
                    
                    ## ⚖️ Análise de Gaps
                    ### ✅ O que deu Match:
                    * [Tech 1]
                    * [Tech 2]
                    * [Tech 3]
                    
                    ### ❌ Pontos de Atenção (Gaps):
                    * **[Requisito Faltante]:** [Breve explicação]
                    * **[Requisito Faltante]:** [Breve explicação]
                    
                    ## 📡 Radar de Senioridade
                    **Diagnóstico:** [Ex: Perfil Operacional vs Perfil de Resultados]
                    
                    * 📉 **Sinal de Alerta:** [Ex: Descreve muitas tarefas ("Fiz manutenção"), mas poucos números.]
                    * 📈 **Evidência Positiva:** [Ex: Cita "Redução de 20% no custo AWS".]
                    
                    ## 🕵️‍♂️ Mapa de Investigação (Perguntas)
                    [Liste 3 pontos para o entrevistador aprofundar]
                    
                    * 🔍 **Sobre [Tópico]:** [Dúvida gerada] 
                      👉 *Sugerir:* "[Pergunta direta para a entrevista]"
                    
                    * 🔍 **Sobre [Tópico]:** [Dúvida gerada]
                      👉 *Sugerir:* "[Pergunta direta para a entrevista]"
                    
                    * 🔍 **Sobre [Tópico]:** [Dúvida gerada]
                      👉 *Sugerir:* "[Pergunta direta para a entrevista]"
                    """
                },
                {
                    "role": "user",
                    "content": f"CV: {texto_curriculo[:6000]} \n VAGA: {texto_vaga[:3000]}"
                }
            ],
            temperature=0.1, 
            max_tokens=800
        )
        feedback_texto = chat_completion.choices[0].message.content

    except Exception as e:
        print(f"Erro IA: {e}")
        feedback_texto = "Erro ao gerar análise."

    return {
        "nota": nota,
        "feedback": feedback_texto
    }