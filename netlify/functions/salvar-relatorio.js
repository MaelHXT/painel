// Importa o conector especial do Netlify para o banco Neon
import { neon } from '@netlify/neon';

// Esta é a função principal que o Netlify vai executar
export default async (req) => {
  try {
    // 1. Pega os dados que seu HTML enviou (ex: { "unidade": "COPI", "toneladas": 150.5 })
    const { unidade, toneladas } = await req.json();

    // Validação simples para garantir que os dados existem
    if (!unidade || !toneladas) {
      return new Response(JSON.stringify({ error: 'Dados incompletos.' }), { status: 400 });
    }

    // 2. Conecta ao banco de dados (usa a variável NETLIFY_DATABASE_URL automaticamente)
    const sql = neon();

    // 3. Executa o comando SQL para INSERIR os dados na tabela que criamos
    const [novoRelatorio] = await sql`
      INSERT INTO relatorios (unidade, toneladas) 
      VALUES (${unidade}, ${toneladas}) 
      RETURNING id, unidade, toneladas
    `;
    
    // 4. Se tudo deu certo, retorna uma resposta de sucesso com os dados salvos
    return new Response(JSON.stringify({ message: "Salvo com sucesso!", data: novoRelatorio }), { status: 200 });

  } catch (error) {
    // Se algo der errado (ex: tabela não existe, erro de conexão)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
