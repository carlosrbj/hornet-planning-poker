"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { Fragment } from "react";
import Image from "next/image";
import logo from "../../public/logo-full.png";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function LandingPage() {
  return (
    <>
      <LandingNavbar />
      <main id="top">
        <Hero />
        <Problem />
        <HowItWorks />
        <Features />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}

function LandingNavbar() {
  return (
    <div className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#0b0b0be6] border-b border-white/5">
      <div className="container">
        <nav className="flex items-center justify-between h-[120px]">
          <Link href="#top" className="flex items-center gap-[14px]">
            <Image src={logo} alt="Hornet Logo" width={400} height={140} className="object-contain w-[280px] md:w-[380px] lg:w-[420px] h-auto -ml-5 -my-8" priority />
          </Link>

          <div className="hidden md:flex items-center gap-6 text-muted-foreground font-medium">
            <Link href="#problem" className="hover:text-foreground transition-colors">Problema</Link>
            <Link href="#how" className="hover:text-foreground transition-colors">Como funciona</Link>
            <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-foreground transition-colors">Planos</Link>
          </div>

          <div className="flex gap-3 items-center">
            <Link href="/pricing" className="btn btn-secondary hidden md:inline-flex">Ver planos</Link>
            <Link href="/login" className="btn btn-primary">Cria uma sala grátis</Link>
          </div>
        </nav>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative py-[72px] pb-[28px] isolate">
      <div className="container grid md:grid-cols-[1.08fr_0.92fr] gap-[42px] items-center">
        <motion.div 
          className="relative z-10"
          initial="hidden" animate="visible" variants={stagger}
        >
          <motion.div variants={fadeUp} className="pill mb-5">
            Tempo real • Jira ready • Identidade de enxame
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(44px,7vw,78px)] font-black leading-[0.95] tracking-[-0.06em] mb-4">
            Stop guessing.<br/>Start swarming.
          </motion.h1>
          <motion.p variants={fadeUp} className="max-w-[700px] text-[#d4d4d8] text-[clamp(18px,2.6vw,21px)] leading-[1.65] mb-7">
            Estimativas rápidas, decisões alinhadas e execução sem ruído. O Planning Poker feito para times que querem parar de discutir e começar a entregar.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap gap-[14px] mb-5">
            <Link href="/login" className="btn btn-primary">Cria uma sala grátis</Link>
            <Link href="#how" className="btn btn-secondary">▶ Veja como funciona</Link>
          </motion.div>
          <motion.p variants={fadeUp} className="text-muted-foreground text-sm leading-[1.6] max-w-[500px]">
            Sem fricção. Sem reunião arrastada. Sem aquela guerra silenciosa entre quem chuta alto e quem quer "fechar a sprint".
          </motion.p>
        </motion.div>

        <motion.div 
          className="relative min-h-auto md:min-h-[560px] grid place-items-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          <div className="absolute w-[280px] h-[280px] bg-[#ffd60a1a] rounded-full blur-[26px] right-[12%] top-[8%] animate-float before:content-[''] before:absolute before:w-[160px] before:h-[160px] before:bg-[#ffd60a0f] before:rounded-full before:blur-[26px] before:left-[-110px] before:bottom-[12px] after:content-[''] after:absolute after:w-[180px] after:h-[180px] after:bg-[#ffd60a14] after:rounded-full after:blur-[26px] after:right-[-30px] after:top-[120px]"></div>
          
          <div className="absolute inset-0 pointer-events-none opacity-60 bg-[linear-gradient(135deg,transparent_48%,rgba(255,214,10,0.08)_49%,transparent_50%),linear-gradient(-135deg,transparent_48%,rgba(255,214,10,0.05)_49%,transparent_50%)] bg-[length:120px_120px] [mask-image:radial-gradient(circle_at_center,black_30%,transparent_84%)]"></div>
          
          <div className="relative w-full max-w-[540px] rounded-[28px] p-[18px] bg-gradient-to-b from-white/10 to-white/5 border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.5),auto] bg-glow backdrop-blur-md md:[transform:perspective(1600px)_rotateY(-10deg)_rotateX(6deg)]">
            <div className="flex items-center justify-between gap-3 px-2 pb-4 pt-1">
              <div className="flex gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]"></span>
              </div>
              <div className="text-muted-foreground text-[13px] font-semibold">planning-poker-hornet.app / room / sprint-42</div>
            </div>
            
            <div className="rounded-[22px] overflow-hidden border border-white/10 bg-gradient-to-b from-[#111111f5] to-[#0b0b0bf5]">
              <div className="p-[18px] border-b border-white/10 flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 min-h-[32px] px-3 rounded-full bg-[#ffd60a14] border border-[#ffd60a24] text-[#fff3ad] text-xs font-bold uppercase tracking-wide">
                  Hornet Swarm Mode
                </span>
                <span className="text-[#c4c4cc] text-xs font-bold tracking-widest uppercase">
                  6 online • 5 votes locked
                </span>
              </div>
              
              <div className="p-[18px] grid gap-[18px]">
                <div className="p-[18px] bg-white/5 border border-white/10 rounded-[20px]">
                  <h3 className="m-0 mb-2.5 text-[20px] tracking-[-0.03em] font-bold">Checkout: recalcular frete por CEP e carrier</h3>
                  <p className="m-0 text-muted-foreground leading-[1.6] text-[14px]">Escopo claro, dependências visíveis e um time inteiro alinhando expectativa antes da sprint virar loteria.</p>
                </div>
                
                <div className="grid grid-cols-3 gap-[1px] overflow-hidden bg-white/5 rounded-[20px] border border-white/10">
                  <div className="p-4 bg-[#111111f2]">
                    <small className="block text-muted-foreground mb-1.5 uppercase font-bold tracking-widest text-[11px]">Convergência</small>
                    <strong className="text-[28px] tracking-[-0.05em] font-bold">82%</strong>
                  </div>
                  <div className="p-4 bg-[#111111f2]">
                    <small className="block text-muted-foreground mb-1.5 uppercase font-bold tracking-widest text-[11px]">Timer</small>
                    <strong className="text-[28px] tracking-[-0.05em] font-bold">00:24</strong>
                  </div>
                  <div className="p-4 bg-[#111111f2]">
                    <small className="block text-muted-foreground mb-1.5 uppercase font-bold tracking-widest text-[11px]">Consenso</small>
                    <strong className="text-[28px] tracking-[-0.05em] font-bold">8h</strong>
                  </div>
                </div>
                
                <div className="p-4 grid grid-cols-4 md:grid-cols-8 gap-2.5 rounded-[20px] border border-white/10 bg-white/5">
                  {[3, 5, 8, 8, 8, 5, 8, '?'].map((vote, i) => (
                    <div key={i} className={`min-h-[76px] rounded-[18px] grid place-items-center bg-gradient-to-b from-[#ffd60a24] to-[#ffd60a0d] border border-[#ffd60a33] font-black text-[24px] text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${i === 2 ? 'animate-pulse-custom' : ''}`}>
                      {vote}
                    </div>
                  ))}
                </div>
                
                <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-[20px] border border-white/10 bg-white/5">
                  <div className="flex items-center">
                    {['CR', 'AN', 'JS', 'LM', 'GP'].map((av, i) => (
                      <div key={i} className={`w-[42px] h-[42px] rounded-full grid place-items-center font-extrabold text-[#141414] bg-gradient-to-b from-[#ffe974] to-[#ffd60a] border-2 border-[#111] shadow-[0_0_0_2px_rgba(255,255,255,0.03)] ${i > 0 ? '-ml-2' : ''}`}>
                        {av}
                      </div>
                    ))}
                  </div>
                  <div className="text-left">
                    <h4 className="m-0 mb-1.5 text-[15px] tracking-tight font-bold">Todo mundo vota. Ninguém contamina o voto do outro.</h4>
                    <p className="m-0 text-[13px] text-muted-foreground">Decisão rápida, discussão objetiva, reveal com impacto e próxima issue sem perder ritmo.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Problem() {
  return (
    <section className="py-[74px] md:py-[96px]" id="problem">
      <div className="container">
        <motion.div 
          className="max-w-[760px] mb-8"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}
        >
          <motion.span variants={fadeUp} className="inline-flex items-center gap-2.5 text-[#fff3ad] text-xs font-extrabold tracking-widest uppercase mb-4 before:content-[''] before:w-[26px] before:h-[2px] before:rounded-full before:bg-gradient-to-r before:from-primary before:to-transparent">
            O problema real
          </motion.span>
          <motion.h2 variants={fadeUp} className="m-0 mb-3.5 text-[clamp(34px,5vw,56px)] leading-[0.98] tracking-[-0.05em] font-bold">
            Estimativa não deveria ser uma reunião infinita.
          </motion.h2>
          <motion.p variants={fadeUp} className="m-0 text-[#d4d4d8] text-lg leading-[1.7] max-w-[760px]">
            O problema nunca foi só o Planning Poker. O problema é o caos: voto influenciado, discussão improdutiva, sprint começando torta e um monte de gente fingindo alinhamento.
          </motion.p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-[1.1fr_0.9fr] gap-[18px] items-stretch"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}
        >
          <div className="grid gap-[14px]">
            {[
              { title: "Voto contaminado", desc: "Alguém fala primeiro, o resto ajusta a opinião. Pronto: virou teatro, não estimativa." },
              { title: "Discussão arrastada", desc: "O time gasta energia demais debatendo o número e de menos entendendo o risco." },
              { title: "Falsa convergência", desc: "Todo mundo “concorda” só pra reunião acabar. Depois a sprint cobra a conta." },
              { title: "Ferramentas sem personalidade", desc: "A maioria ajuda a votar. Pouquíssimas ajudam o time a decidir rápido e bem." }
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp} className="flex items-start gap-3 p-[18px] rounded-[18px] bg-white/5 border border-white/10">
                <span className="w-2.5 h-2.5 rounded-full mt-2 bg-primary shadow-[0_0_12px_rgba(255,214,10,0.4)] flex-shrink-0"></span>
                <div>
                  <strong className="block mb-1.5 tracking-tight font-bold text-foreground">{item.title}</strong>
                  <span className="text-muted-foreground leading-[1.6] text-sm">{item.desc}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeUp} className="flex flex-col justify-between min-h-full relative overflow-hidden p-6 rounded-[24px] bg-[var(--panel)] border border-[var(--border)] backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-primary/20 hover:bg-[var(--panel-strong)] bg-glow">
            <div className="absolute w-[220px] h-[220px] rounded-full -right-[80px] -bottom-[80px] bg-[radial-gradient(circle,rgba(255,214,10,0.12),transparent_70%)] pointer-events-none"></div>
            <div>
              <span className="inline-flex items-center gap-2.5 text-[#fff3ad] text-xs font-extrabold tracking-widest uppercase mb-4 before:content-[''] before:w-[26px] before:h-[2px] before:rounded-full before:bg-gradient-to-r before:from-primary before:to-transparent">Hornet mindset</span>
              <div className="text-[44px] font-black tracking-[-0.08em] leading-[0.9] my-4 text-white">Decidir rápido é uma vantagem competitiva.</div>
              <p className="m-0 text-muted-foreground leading-[1.7] text-[15px]">O Hornet transforma estimativa em coordenação de enxame: cada pessoa contribui, a divergência aparece cedo e a decisão sai sem ruído desnecessário.</p>
            </div>
            <p className="m-0 text-muted-foreground leading-[1.7] text-[15px] mt-[18px]">Menos debate circular. Mais clareza. Mais entrega.</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="py-[74px] md:py-[96px]" id="how">
      <div className="container">
        <motion.div 
          className="max-w-[760px] mb-8"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}
        >
          <motion.span variants={fadeUp} className="inline-flex items-center gap-2.5 text-[#fff3ad] text-xs font-extrabold tracking-widest uppercase mb-4 before:content-[''] before:w-[26px] before:h-[2px] before:rounded-full before:bg-gradient-to-r before:from-primary before:to-transparent">
            Como funciona
          </motion.span>
          <motion.h2 variants={fadeUp} className="m-0 mb-3.5 text-[clamp(34px,5vw,56px)] leading-[0.98] tracking-[-0.05em] font-bold">
            Coordenação de enxame, não reunião cansada.
          </motion.h2>
          <motion.p variants={fadeUp} className="m-0 text-[#d4d4d8] text-lg leading-[1.7] max-w-[760px]">
            A lógica é simples: criar sala em segundos, voto simultâneo, reveal com contexto e próxima issue sem perder o compasso.
          </motion.p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[18px]"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}
        >
          {[
            { num: "01", title: "Create the swarm", desc: "Crie uma sala em um clique e convide o time com um link. Sem onboarding burocrático, porque ninguém merece cadastro pra tudo." },
            { num: "02", title: "Vote silently", desc: "Todo mundo vota ao mesmo tempo. Sem influência, sem hierarquia mascarando opinião, sem o clássico “vou no do sênior”." },
            { num: "03", title: "Reveal & converge", desc: "Os votos aparecem juntos, a divergência fica explícita e a conversa finalmente vira algo útil." },
            { num: "04", title: "Move fast", desc: "Decidiu? Sincroniza, registra e segue para a próxima issue sem transformar planning em maratona de desgaste." }
          ].map((item, i) => (
            <motion.article key={i} variants={fadeUp} className="p-6 rounded-[24px] bg-[var(--panel)] border border-[var(--border)] backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-primary/20 hover:bg-[var(--panel-strong)] hover:shadow-[var(--glow)]">
              <div className="w-[48px] h-[48px] rounded-2xl grid place-items-center mb-[18px] bg-primary/10 border border-primary/20 text-primary font-black shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                {item.num}
              </div>
              <h3 className="m-0 mb-2.5 text-[22px] tracking-[-0.04em] font-bold text-white">{item.title}</h3>
              <p className="m-0 text-muted-foreground leading-[1.7] text-[15px]">{item.desc}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="py-[74px] md:py-[96px]" id="features">
      <div className="container">
        <motion.div 
          className="max-w-[760px] mb-8"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}
        >
          <motion.span variants={fadeUp} className="inline-flex items-center gap-2.5 text-[#fff3ad] text-xs font-extrabold tracking-widest uppercase mb-4 before:content-[''] before:w-[26px] before:h-[2px] before:rounded-full before:bg-gradient-to-r before:from-primary before:to-transparent">
            Features que importam
          </motion.span>
          <motion.h2 variants={fadeUp} className="m-0 mb-3.5 text-[clamp(34px,5vw,56px)] leading-[0.98] tracking-[-0.05em] font-bold">
            Velocidade não é um recurso. É um padrão.
          </motion.h2>
          <motion.p variants={fadeUp} className="m-0 text-[#d4d4d8] text-lg leading-[1.7] max-w-[760px]">
            O Hornet foi desenhado para reduzir ruído operacional e aumentar alinhamento real. Não é enfeite. É cadência.
          </motion.p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[18px]"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}
        >
          {[
            { icon: "⚡", title: "Real-time voting", desc: "Sem refresh, sem delay e sem aquela sensação de ferramenta lenta travando o ritmo do time." },
            { icon: "⏱️", title: "Smart timers", desc: "Tempo controlado por issue para a discussão não se espalhar igual café derramado na mesa." },
            { icon: "🔗", title: "Jira native sync", desc: "Importe sprint, estime com contexto e sincronize sem gambiarra nem planilha paralela escondida." },
            { icon: "👥", title: "Live presence", desc: "Veja quem está online, quem já votou e quem claramente foi buscar água na hora errada." },
            { icon: "📊", title: "Convergence analytics", desc: "Entenda quanto o time converge de verdade e onde a estimativa vira ponto cego recorrente." },
            { icon: "☕", title: "Coffee break mode", desc: "Porque até enxame precisa respirar antes de voltar para a próxima rodada de decisão." }
          ].map((item, i) => (
            <motion.article key={i} variants={fadeUp} className="p-6 rounded-[24px] bg-[var(--panel)] border border-[var(--border)] backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-primary/20 hover:bg-[var(--panel-strong)] hover:shadow-[var(--glow)]">
              <div className="w-[48px] h-[48px] rounded-2xl grid place-items-center mb-[18px] bg-primary/10 border border-primary/20 text-[20px] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                {item.icon}
              </div>
              <h3 className="m-0 mb-2.5 text-[22px] tracking-[-0.04em] font-bold text-white">{item.title}</h3>
              <p className="m-0 text-muted-foreground leading-[1.7] text-[15px]">{item.desc}</p>
            </motion.article>
          ))}
        </motion.div>

        <motion.div 
          className="mt-[26px] grid grid-cols-1 md:grid-cols-2 gap-[18px]"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}
        >
          <motion.div variants={fadeUp} className="rounded-[22px] p-6 border border-red-500/15 bg-white/5">
            <h3 className="m-0 mb-3 text-[22px] tracking-[-0.04em] font-bold text-white">Ferramenta comum</h3>
            <ul className="p-0 m-0 list-none grid gap-3">
              {["Ajuda o time a votar", "Parece mais uma UI genérica de board", "Não reduz ruído de verdade", "Quase nenhuma identidade de produto"].map((li, i) => (
                <li key={i} className="flex gap-2.5 items-start text-[#fca5a5] text-[15px] leading-[1.65] before:content-[''] before:w-2 before:h-2 before:mt-[9px] before:rounded-full before:bg-current before:opacity-85 before:flex-shrink-0">
                  {li}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div variants={fadeUp} className="rounded-[22px] p-6 border border-primary/20 bg-white/5 shadow-[var(--glow)]">
            <h3 className="m-0 mb-3 text-[22px] tracking-[-0.04em] font-bold text-white">Planning Poker Hornet</h3>
            <ul className="p-0 m-0 list-none grid gap-3">
              {["Ajuda o time a decidir rápido e bem", "Tem identidade forte, memorável e vendável", "Transforma divergência em clareza", "Entrega velocidade, coordenação e foco"].map((li, i) => (
                <li key={i} className="flex gap-2.5 items-start text-[#fde68a] text-[15px] leading-[1.65] before:content-[''] before:w-2 before:h-2 before:mt-[9px] before:rounded-full before:bg-current before:opacity-85 before:flex-shrink-0">
                  {li}
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section className="py-[74px] md:py-[96px]" id="pricing">
      <div className="container">
        <motion.div 
          className="max-w-[760px] mb-8"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}
        >
          <motion.span variants={fadeUp} className="inline-flex items-center gap-2.5 text-[#fff3ad] text-xs font-extrabold tracking-widest uppercase mb-4 before:content-[''] before:w-[26px] before:h-[2px] before:rounded-full before:bg-gradient-to-r before:from-primary before:to-transparent">
            Planos
          </motion.span>
          <motion.h2 variants={fadeUp} className="m-0 mb-3.5 text-[clamp(34px,5vw,56px)] leading-[0.98] tracking-[-0.05em] font-bold">
            Preço simples. Valor óbvio.
          </motion.h2>
          <motion.p variants={fadeUp} className="m-0 text-[#d4d4d8] text-lg leading-[1.7] max-w-[760px]">
            Ninguém quer estudar tabela de cobrança para usar um produto que deveria economizar tempo. Então aqui vai o modelo sem truque de circo.
          </motion.p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[18px] items-stretch"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}
        >
          <motion.article variants={fadeUp} className="relative flex flex-col gap-[18px] p-6 rounded-[24px] bg-[var(--panel)] border border-[var(--border)] backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-primary/20 hover:bg-[var(--panel-strong)] hover:shadow-[var(--glow)]">
            <h3 className="m-0 text-[22px] tracking-[-0.04em] font-bold text-white">Free</h3>
            <p className="m-0 text-muted-foreground leading-[1.7] text-[15px]">Para times pequenos que querem testar a dinâmica do enxame antes de colocar a sprint inteira na brincadeira.</p>
            <div className="flex items-end gap-2.5">
              <strong className="text-[46px] tracking-[-0.08em] leading-[0.9]">R$0</strong>
              <span className="text-muted-foreground text-sm pb-2">/mês</span>
            </div>
            <ul className="p-0 m-0 list-none grid gap-3">
              {["Salas básicas", "Até 5 participantes", "Votação em tempo real", "Deck focado em horas"].map((li, i) => (
                <li key={i} className="flex gap-2.5 items-start text-[#d4d4d8] text-[15px] leading-[1.65] before:content-[''] before:w-2 before:h-2 before:mt-[9px] before:rounded-full before:bg-current before:opacity-85 before:flex-shrink-0">{li}</li>
              ))}
            </ul>
            <Link href="/login" className="btn btn-secondary mt-auto">Começar grátis</Link>
          </motion.article>

          <motion.article variants={fadeUp} className="relative flex flex-col gap-[18px] p-6 rounded-[24px] bg-gradient-to-b from-primary/5 to-white/5 border border-primary/20 shadow-[var(--glow)] backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:bg-[var(--panel-strong)]">
            <span className="absolute top-[18px] right-[18px] min-h-[28px] px-3 rounded-full inline-flex items-center bg-primary/10 border border-primary/20 text-[#fff3ad] text-[11px] font-extrabold uppercase tracking-widest">Mais forte</span>
            <h3 className="m-0 text-[22px] tracking-[-0.04em] font-bold text-white">Pro</h3>
            <p className="m-0 text-muted-foreground leading-[1.7] text-[15px]">Para equipes que já vivem em sprint, usam Jira e querem estimativa como parte de uma operação séria.</p>
            <div className="flex items-end gap-2.5">
              <strong className="text-[46px] tracking-[-0.08em] leading-[0.9]">R$49</strong>
              <span className="text-muted-foreground text-sm pb-2">/mês por time</span>
            </div>
            <ul className="p-0 m-0 list-none grid gap-3">
              {["Integração nativa com Jira", "Timers avançados", "Analytics de convergência", "Histórico de estimativas"].map((li, i) => (
                <li key={i} className="flex gap-2.5 items-start text-[#d4d4d8] text-[15px] leading-[1.65] before:content-[''] before:w-2 before:h-2 before:mt-[9px] before:rounded-full before:bg-current before:opacity-85 before:flex-shrink-0">{li}</li>
              ))}
            </ul>
            <Link href="/login" className="btn btn-primary mt-auto">Assinar Pro</Link>
          </motion.article>

          <motion.article variants={fadeUp} className="relative flex flex-col gap-[18px] p-6 rounded-[24px] bg-[var(--panel)] border border-[var(--border)] backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-primary/20 hover:bg-[var(--panel-strong)] hover:shadow-[var(--glow)]">
            <h3 className="m-0 text-[22px] tracking-[-0.04em] font-bold text-white">Team</h3>
            <p className="m-0 text-muted-foreground leading-[1.7] text-[15px]">Para times múltiplos, operação maior e líderes que querem previsibilidade em vez de adivinhação com crachá.</p>
            <div className="flex items-end gap-2.5">
              <strong className="text-[46px] tracking-[-0.08em] leading-[0.9]">R$149</strong>
              <span className="text-muted-foreground text-sm pb-2">/mês</span>
            </div>
            <ul className="p-0 m-0 list-none grid gap-3">
              {["Workspaces multi-time", "Dashboards por sprint", "Gestão centralizada", "Suporte prioritário"].map((li, i) => (
                <li key={i} className="flex gap-2.5 items-start text-[#d4d4d8] text-[15px] leading-[1.65] before:content-[''] before:w-2 before:h-2 before:mt-[9px] before:rounded-full before:bg-current before:opacity-85 before:flex-shrink-0">{li}</li>
              ))}
            </ul>
            <Link href="#cta" className="btn btn-secondary mt-auto">Falar com vendas</Link>
          </motion.article>
        </motion.div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="relative py-[74px] md:py-[110px]" id="cta">
      <div className="container">
        <motion.div 
          className="relative overflow-hidden rounded-[34px] p-10 border border-primary/20 shadow-[var(--shadow),var(--glow)] bg-[radial-gradient(circle_at_85%_15%,rgba(255,214,10,0.16),transparent_25%),linear-gradient(180deg,rgba(255,214,10,0.08),rgba(255,255,255,0.04))]"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}
        >
          <motion.span variants={fadeUp} className="inline-flex items-center gap-2.5 text-[#fff3ad] text-xs font-extrabold tracking-widest uppercase mb-4 before:content-[''] before:w-[26px] before:h-[2px] before:rounded-full before:bg-gradient-to-r before:from-primary before:to-transparent">
            Hora de parar de adivinhar
          </motion.span>
          <motion.h2 variants={fadeUp} className="m-0 mb-3.5 text-[clamp(36px,5vw,64px)] leading-[0.95] tracking-[-0.06em] font-bold max-w-[720px] text-white">
            Seu time não precisa de mais uma reunião. Precisa de decisões melhores.
          </motion.h2>
          <motion.p variants={fadeUp} className="m-0 mb-[26px] text-[#e4e4e7] text-lg leading-[1.7] max-w-[760px]">
            Crie uma sala, convide o time e veja a diferença entre estimar por obrigação e estimar com coordenação de verdade. O resto é ruído — e ruído a gente corta.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap gap-[14px] mb-[20px]">
            <Link href="/login" className="btn btn-primary">🔥 Abrir app</Link>
            <Link href="#top" className="btn btn-secondary">↑ Voltar ao topo</Link>
          </motion.div>
          <motion.p variants={fadeUp} className="m-0 text-muted-foreground text-sm leading-[1.7]">
            Pronto para deploy estático. Fácil de adaptar para Next, Angular ou Vercel sem retrabalho besta.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-[26px] pb-[52px] text-muted-foreground border-t border-white/5">
      <div className="container flex justify-between items-center gap-[18px] flex-wrap">
        <div className="text-sm leading-[1.7]">© 2026 Planning Poker Hornet. Stop guessing. Start swarming.</div>
        <div className="flex flex-wrap gap-[18px] font-medium text-sm">
          <Link href="#problem" className="hover:text-white transition-colors">Problema</Link>
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Planos</Link>
          <Link href="/login" className="hover:text-white transition-colors">App</Link>
        </div>
      </div>
    </footer>
  );
}
