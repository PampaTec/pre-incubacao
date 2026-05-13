const ETAPAS = [
  'Proposta de Valor',
  'Segmento de Clientes',
  'Relacionamento com Clientes',
  'Canais',
  'Fontes de Receita',
  'Parcerias Principais',
  'Recursos Principais',
  'Atividades-Chave',
  'Estrutura de Custos'
];

export default function ProgressBar({ progresso = [], size = 'md' }) {
  const concluidas = progresso.filter(p => p.status && p.status.includes('Concluído')).length;
  const percentual = Math.round((concluidas / 9) * 100);

  const isSmall = size === 'sm';

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className={`font-bold text-pampa-gray ${isSmall ? 'text-sm' : 'text-lg'}`}>
          Progresso BMC
        </span>
        <span className={`text-pampa-green font-bold ${isSmall ? 'text-sm' : 'text-lg'}`}>
          {concluidas}/9 ({percentual}%)
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-pampa-green h-full rounded-full transition-all duration-500"
          style={{ width: `${percentual}%` }}
        />
      </div>

      <div className={`grid grid-cols-9 gap-1 mt-2 ${isSmall ? '' : ''}`}>
        {ETAPAS.map((nome, i) => {
          const etapaNum = i + 1;
          const p = progresso.find(pr => parseInt(pr.etapa || pr.Etapa) === etapaNum);
          const status = p ? (p.status || p.Status) : '⬜ Pendente';
          const concluido = status.includes('Concluído');

          return (
            <div key={i} className="flex flex-col items-center">
              <div className={`w-full h-1.5 rounded-full mb-1 ${concluido ? 'bg-pampa-green' : 'bg-gray-200'}`} />
              <span className={`${isSmall ? 'text-[10px]' : 'text-xs'} text-center leading-tight ${concluido ? 'text-pampa-green font-medium' : 'text-gray-400'}`}>
                {isSmall ? (i + 1) : nome.split(' ')[0]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
