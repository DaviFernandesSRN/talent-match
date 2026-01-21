import google.generativeai as genai

# Sua chave
CHAVE = "AIzaSyBrA-iKhY54Qubwka_snP8efgbFDUXxz0g"

print("🔄 Tentando conectar com o Google Gemini...")

try:
    genai.configure(api_key=CHAVE)
    model = genai.GenerativeModel('gemini-pro')
    
    response = model.generate_content("Diga 'Olá Mundo' se você estiver me ouvindo!")
    
    print("\n✅ SUCESSO! A IA respondeu:")
    print(f"🤖 Gemini diz: {response.text}")
    print("\n------------------------------------------------")
    print("Pode rodar o 'uvicorn main:app --reload' que vai funcionar!")
    
except Exception as e:
    print("\n❌ ERRO FATAL:")
    print(e)
    print("\n------------------------------------------------")
    print("DICA: Verifique se sua internet não bloqueia o Google ou se a chave foi copiada inteira.")