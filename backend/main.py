# ... (Mantenha as importações e configurações de CORS)

@app.post("/analisar")
async def analisar(
    file: UploadFile = File(...),
    jobDescription: str = Form(None),
    jobFile: UploadFile = File(None)
):
    # ... (Lógica de extração de texto PDF currículo e vaga)

    try:
        chat_completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile", 
            messages=[
                {
                    "role": "system",
                    "content": """
                    Você é um Auditor Técnico de Carreira. 
                    Gere um relatório técnico estruturado com marcações Markdown.
                    
                    TEMPLATE OBRIGATÓRIO:
                    
                    ## 🧭 Resumo da Trajetória
                    > [Resumo técnico direto.]
                    
                    ## ⚖️ Análise de Gaps
                    ### ✅ O que deu Match:
                    * [Item 1]
                    * [Item 2]
                    
                    ### ❌ Pontos de Atenção (Gaps):
                    * **[Gap]:** [Explicação técnica]
                    
                    ## 📡 Radar de Senioridade
                    **Diagnóstico:** [Perfil Operacional vs Resultados]
                    * 📉 **Sinal de Alerta:** [Evidência negativa]
                    * 📈 **Evidência Positiva:** [Evidência positiva]

                    ## 🎯 Pontos de Investigação (O Pulo do Gato)
                    * **Ponto 1:** [Evidência] Investigar como o candidato [pergunta].
                    * **Ponto 2:** [Evidência] Investigar como o candidato [pergunta].
                    """
                },
                {
                    "role": "user",
                    "content": f"CV: {texto_curriculo[:6000]} \n VAGA: {texto_vaga[:3000]}"
                }
            ],
            temperature=0.1, 
            max_tokens=850
        )
        feedback_texto = chat_completion.choices[0].message.content
    except Exception as e:
        feedback_texto = "Erro ao processar análise."

    return {"nota": nota, "feedback": feedback_texto}