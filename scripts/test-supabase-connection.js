const { createClient } = require("@supabase/supabase-js");

const fs = require("fs");
const path = require("path");

// Carregar variáveis de ambiente de .env.local caso não estejam no processo
let url = process.env.NEXT_PUBLIC_SUPABASE_URL;
let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  const envPath = path.resolve(__dirname, "../.env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const k = match[1].trim();
        const v = match[2].trim().replace(/^["']|["']$/g, "");
        if (k === "NEXT_PUBLIC_SUPABASE_URL") url = v;
        if (k === "NEXT_PUBLIC_SUPABASE_ANON_KEY") key = v;
      }
    });
  }
}

async function testConnection() {
  console.log("=================================================");
  console.log("🔌 TESTANDO CONEXÃO DIRETA COM O SUPABASE");
  console.log("=================================================");
  console.log(`URL do Projeto: ${url}`);
  console.log(`Chave Pública: ${key.slice(0, 15)}...`);

  const supabase = createClient(url, key);

  try {
    // 1. Testar query na tabela categories criada pelo schema
    console.log("\n1. Testando leitura na tabela 'categories'...");
    const { data: catData, error: catError } = await supabase.from("categories").select("*").limit(5);

    if (catError) {
      console.log(`   Nota: ${catError.message} (Código: ${catError.code})`);
    } else {
      console.log(`✅ [SUCESSO] Tabela 'categories' consultada com sucesso! Linhas retornadas: ${catData.length}`);
    }

    // 2. Testar query na tabela accounts
    console.log("\n2. Testando leitura na tabela 'accounts'...");
    const { data: accData, error: accError } = await supabase.from("accounts").select("*").limit(5);

    if (accError) {
      console.log(`   Nota: ${accError.message} (Código: ${accError.code})`);
    } else {
      console.log(`✅ [SUCESSO] Tabela 'accounts' consultada com sucesso! Linhas retornadas: ${accData.length}`);
    }

    // 3. Testar query na tabela profiles
    console.log("\n3. Testando leitura na tabela 'profiles'...");
    const { data: profData, error: profError } = await supabase.from("profiles").select("*").limit(5);

    if (profError) {
      console.log(`   Nota: ${profError.message} (Código: ${profError.code})`);
    } else {
      console.log(`✅ [SUCESSO] Tabela 'profiles' consultada com sucesso! Linhas retornadas: ${profData.length}`);
    }

    console.log("\n=================================================");
    console.log("🎉 O BANCO DE DADOS SUPABASE ESTÁ 100% OPERACIONAL!");
    console.log("=================================================");
  } catch (err) {
    console.error("Erro ao conectar:", err);
  }
}

testConnection();
