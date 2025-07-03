// src/pages/Financeiro.tsx - VERSÃO DE TESTE DE SCROLL

export default function FinanceiroPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-10">
        Página de Teste de Rolagem
      </h1>
      
      {/* Este código gera 100 parágrafos para forçar o conteúdo a ser muito longo */}
      {Array.from({ length: 100 }).map((_, index) => (
        <p key={index} className="mb-4">
          Testando a rolagem... linha {index + 1}. Se você consegue ler esta linha
          e rolar para baixo, o nosso layout principal está funcionando corretamente.
          O problema está em um dos componentes da visão financeira.
        </p>
      ))}

      <h2 className="text-2xl font-bold mt-10">
        Fim do Teste. Você conseguiu rolar até aqui?
      </h2>
    </div>
  );
}