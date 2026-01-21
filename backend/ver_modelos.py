import google.generativeai as genai

genai.configure(api_key="AIzaSyBgE5KDXlSKn1bSfmFqfFV3lfvnvR58mcQ")

print("🔍 LISTA DE MODELOS DISPONÍVEIS NA SUA CONTA:")
print("-" * 30)

try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"✅ {m.name}")
except Exception as e:
    print(f"❌ Erro: {e}")

print("-" * 30)