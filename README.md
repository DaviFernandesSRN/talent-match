# 🎯 TalentMatch MVP

Aplicação Full-Stack que utiliza Inteligência Artificial (NLP) para analisar a aderência de um currículo (PDF) em relação a uma descrição de vaga.

![Status](https://img.shields.io/badge/Status-MVP_Complete-green)

## 🏗 Arquitetura

O projeto segue uma arquitetura de microsserviços simples:

- **Frontend:** React + Vite + TailwindCSS (Interface do Usuário).
- **Backend:** Node.js + Express (API Gateway, Processamento de PDF).
- **Worker:** Python + FastAPI + Spacy (Motor de IA/NLP).

## 🚀 Como Rodar o Projeto (Guia Rápido)

Siga a ordem abaixo para iniciar os serviços. Você precisará de 3 terminais.

### Pré-requisitos
- Node.js (v18+)
- Python (v3.12+)

---

### Passo 1: Iniciar o Worker (IA) 🧠
Este serviço roda na porta `8000`.

1. Acesse a pasta raiz.
2. Crie e ative o ambiente virtual (se ainda não existir):
   ```bash
   # Windows
   py -3.12 -m venv venv
   .\venv\Scripts\activate