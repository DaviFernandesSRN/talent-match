# 🎯 TalentMatch - AI Recruiter

> Sistema inteligente de análise de currículos powered by Llama 3 (Groq) & NLP.

![Badge Status](https://img.shields.io/badge/Status-Concluído-green) ![React](https://img.shields.io/badge/Frontend-React-blue) ![Python](https://img.shields.io/badge/Backend-Python%20FastAPI-yellow)

## 💻 Sobre o Projeto

O **TalentMatch** é uma aplicação Fullstack que revoluciona o processo de triagem de candidatos. O sistema utiliza Processamento de Linguagem Natural (NLP) para calcular a compatibilidade semântica entre um currículo (PDF) e uma descrição de vaga, além de usar **Inteligência Artificial Generativa** para fornecer um feedback detalhado sobre pontos fortes e gaps do candidato.

🔗 **Link para o Site:** [Acesse o Projeto Online Aqui](https://talent-match-c3nh.vercel.app/)
<img width="1916" height="869" alt="image" src="https://github.com/user-attachments/assets/e165b281-0020-4f8b-8974-c7c5f98b6516" />
<img width="1910" height="862" alt="image" src="https://github.com/user-attachments/assets/25ffcaaa-9174-4c7b-9226-b72d304b9280" />



---

## 🚀 Funcionalidades

- **Upload de PDF:** Leitura e extração automática de texto de currículos em formato PDF.
- **Análise Semântica (NLP):** Utiliza a biblioteca `Spacy` para calcular uma nota de aderência (0-100%) baseada na similaridade vetorial entre o CV e a Vaga.
- **Feedback com IA:** Integração com a API da `Groq` (modelo Llama-3.3-70b) para atuar como um recrutador sênior, citando pontos de melhoria reais.
- **Interface Responsiva:** Frontend moderno construído com React e TailwindCSS.

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React.js** (Vite)
- **TailwindCSS** (Estilização)
- **Lucide React** (Ícones)

### Backend
- **Python 3**
- **FastAPI** (API de alta performance)
- **Spacy** (Processamento de Linguagem Natural - NLP)
- **Groq API** (LLM Llama 3)
- **PyPDF** (Leitura de arquivos)

### Infraestrutura
- **Render** (Hospedagem Backend Python)
- **Vercel** (Hospedagem Frontend)

---

## 📦 Como rodar localmente

Se quiser rodar este projeto no seu computador:

### Pré-requisitos
- Node.js e Python instalados.
- Uma chave de API da Groq (Grátis).

### 1. Backend (Servidor)
```bash
cd backend
# Crie um ambiente virtual
python -m venv venv
# Ative o ambiente (Windows)
.\venv\Scripts\activate
# Instale as dependências
pip install -r requirements.txt
# Baixe o modelo de linguagem
python -m spacy download pt_core_news_md
# Rode o servidor
uvicorn main:app --reload

Desenvolvido por Davi Fernandes. Projeto criado para portfólio de Desenvolvimento Fullstack com IA.
