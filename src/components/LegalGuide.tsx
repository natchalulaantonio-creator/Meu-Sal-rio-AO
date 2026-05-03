import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  ShieldCheck, 
  AlertCircle, 
  Scale, 
  Info,
  ExternalLink,
  ChevronRight,
  Gavel
} from 'lucide-react';

const LawSection = ({ title, icon: Icon, children }: any) => (
  <div className="glass-card p-6 sm:p-10 space-y-6">
    <div className="flex items-center gap-4 mb-2">
      <div className="p-3 bg-primary/10 rounded-2xl text-primary shrink-0">
        <Icon size={24} />
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h3>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const ArticleCard = ({ number, title, content }: any) => (
  <div className="p-5 sm:p-6 bg-white dark:bg-white/2 rounded-3xl border border-slate-100 dark:border-white/5 hover:border-primary/30 transition-all group">
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
      <span className="w-fit px-2 py-1 bg-primary text-white text-[10px] font-black rounded-lg shrink-0">ART. {number}</span>
      <h4 className="font-bold text-slate-800 dark:text-white group-hover:text-primary transition-colors">{title}</h4>
    </div>
    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
      {content}
    </p>
  </div>
);

const FAQItem = ({ q, a, q_icon }: any) => (
  <div className="p-6 sm:p-8 bg-white dark:bg-white/5 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all">
    <div className="flex flex-col sm:flex-row items-start gap-4">
      <div className="p-3 bg-white dark:bg-white/5 border border-slate-100 dark:border-transparent rounded-2xl text-slate-400 shrink-0">
        {q_icon}
      </div>
      <div className="space-y-2">
        <h4 className="font-bold text-slate-900 dark:text-white leading-tight">{q}</h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{a}</p>
      </div>
    </div>
  </div>
);

export const LegalGuide = () => {
  return (
    <div className="space-y-12 sm:space-y-16 page-transition pb-20">
      <header className="relative py-8">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
        <div className="max-w-2xl px-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-[10px] font-black uppercase tracking-widest text-primary mb-4">
            Base de Conhecimento Legislação
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white leading-tight tracking-tighter">
            O Teu Guia <br className="hidden sm:block" />
            <span className="text-slate-300 dark:text-slate-700">Jurídico Laboral.</span>
          </h2>
          <p className="mt-4 sm:mt-6 text-slate-500 dark:text-slate-400 text-base sm:text-lg font-medium leading-relaxed">
            Entenda os teus direitos e deveres segundo a Lei Geral do Trabalho de Angola (LGT 2026) e as normas de fiscalidade vigentes.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <LawSection title="Direitos e Cessação" icon={Gavel}>
          <ArticleCard 
            number="236" 
            title="Indemnização p/ Antiguidade" 
            content="O trabalhador tem direito a uma indemnização correspondente ao salário base por cada ano de serviço em caso de despedimento s/ justa causa."
          />
          <ArticleCard 
            number="145" 
            title="Direito a Férias" 
            content="Todo trabalhador tem direito a 22 dias úteis de férias remuneradas por cada ano de trabalho efectivo."
          />
          <ArticleCard 
            number="158" 
            title="Subsídio de Natal" 
            content="Equivalente a 50% do salário base, pago obrigatoriamente até ao dia 15 de Dezembro de cada ano."
          />
        </LawSection>

        <LawSection title="Deveres e Fiscalidade" icon={Scale}>
          <div className="p-6 bg-amber-50 dark:bg-amber-500/5 rounded-3xl border border-amber-100 dark:border-amber-500/20">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-amber-500" size={20} />
              <h4 className="font-bold text-amber-900 dark:text-amber-500">Sobre o IRT (Imposto de Rendimento)</h4>
            </div>
            <p className="text-sm text-amber-800 dark:text-amber-200/60 leading-relaxed mb-4">
              O IRT incide sobre todos os rendimentos do trabalho. Isenção total para salários abaixo de 150.000 Kz (conforme tabela actual 2026).
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-400">
                <ChevronRight size={14} /> Até 150.000 Kz: Isento
              </li>
              <li className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-400">
                <ChevronRight size={14} /> 150k a 200k: 16% s/ excesso
              </li>
              <li className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-400">
                <ChevronRight size={14} /> Acima de 10M Kz: 25% (Taxa Máxima)
              </li>
            </ul>
          </div>

          <div className="p-6 bg-emerald-50 dark:bg-emerald-500/5 rounded-3xl border border-emerald-100 dark:border-emerald-500/20">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="text-emerald-500" size={20} />
              <h4 className="font-bold text-emerald-900 dark:text-emerald-500">Segurança Social (INSS)</h4>
            </div>
            <p className="text-sm text-emerald-800 dark:text-emerald-200/60 leading-relaxed">
              Contribuição obrigatória de 3% por parte do trabalhador e 8% por parte da entidade empregadora. Garante reforma, subsídio de maternidade e doença.
            </p>
          </div>
        </LawSection>
      </div>

      <div className="space-y-8">
        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Perguntas Frequentes (FAQ)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FAQItem 
            q="O Subsidio de Alimentação tem limite de isenção?" 
            q_icon={<Info size={16} />}
            a="Sim. Segundo a legislação actual, os subsídios de alimentação e transporte são isentos de IRT até ao limite de 30.000 Kz cada um." 
          />
          <FAQItem 
            q="Quanto tempo tenho para reclamar créditos laborais?" 
            q_icon={<Scale size={16} />}
            a="O trabalhador tem até 1 ano após a cessação do contrato para reclamar judicialmente créditos salariais ou indemnizações." 
          />
          <FAQItem 
            q="O 13º mês (Natal) é obrigatório?" 
            q_icon={<ExternalLink size={16} />}
            a="Sim. O Subsídio de Natal é obrigatório por lei e deve ser pago 50% em Novembro e 50% em Dezembro (ou total em Dezembro)." 
          />
          <FAQItem 
            q="Como é calculada a indemnização por antiguidade?" 
            q_icon={<Gavel size={16} />}
            a="Varia conforme o tamanho da empresa. Para grandes empresas, é geralmente 1 salário base por cada ano trabalhado até ao 5º ano." 
          />
        </div>
      </div>

      <div className="glass-card p-8 sm:p-12 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none hidden sm:block">
          <BookOpen size={200} />
        </div>
        <div className="max-w-xl space-y-6 relative z-10">
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight">Dúvidas Complexas?</h3>
          <p className="text-slate-400 font-medium leading-relaxed text-sm sm:text-base">
            As simulações deste portal são baseadas em cenários padrões da LGT. Para casos de litígio, suspensão de contrato ou situações especiais, recomendamos sempre a consulta de um advogado especializado ou o Portal do MAPTSS.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <a href="https://www.maptss.gov.ao" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors">
              Portal do MAPTSS <ExternalLink size={16} />
            </a>
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl font-bold text-sm hover:bg-white/20 transition-colors border border-white/10">
              Descarregar LGT (PDF)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
