
import React, { useState, useEffect } from 'react';
import { Check, ChevronRight, Globe, Lock, Menu, X, ArrowRight, Layout, Zap, Users, BarChart3, MessageSquare, ShieldCheck, PlayCircle } from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
  onNavigate: (page: string) => void;
}

type Lang = 'en' | 'uk';

const CONTENT = {
  en: {
    nav: {
      features: 'Features',
      howItWorks: 'How it Works',
      pricing: 'Pricing',
      benefits: 'Benefits',
      login: 'Log In',
      cta: 'Try Free for 14 Days'
    },
    hero: {
      badge: 'New: AI Advisory Board 2.0',
      title: 'Your Daily AI Mentor & Team Pulse',
      subtitle: 'Employees get a focused daily plan. Managers get real visibility. No more micromanagement or chaotic to-do lists.',
      ctaPrimary: 'Request Demo',
      ctaSecondary: 'Try Free (14 Days)',
      trust: 'No complex setup required. Start in minutes.'
    },
    roles: {
      title: 'Built for Modern Teams',
      subtitle: 'Designed for knowledge workers who need focus, not just tracking.',
      ceo: {
        title: 'CEO / Owner',
        text: 'Get a clear daily pulse. See if key initiatives are moving or if the team is stuck in "work about work". No complex dashboards needed.'
      },
      manager: {
        title: 'Team Lead',
        text: 'Spot risks early. Know exactly who needs help today without reading 500 chat messages. 1:1s become actionable.'
      },
      employee: {
        title: 'Employee',
        text: 'Replace chaos with clarity. Get 3 key actions for the day and clear "tails" of unfinished work. Your AI mentor helps you grow.'
      }
    },
    problem: {
      title: 'The Reality Without AI Advisory',
      items: [
        'Tasks scattered across Slack, Jira, and notes.',
        'Plans written "just for show" or ignored.',
        'Managers wasting hours hunting for status updates.',
        'Important goals constantly pushed "to tomorrow".'
      ],
      summary: 'Result: Everyone works hard, but progress feels slow.'
    },
    features: {
      title: '3 Daily Actions That Change Everything',
      f1: {
        badge: 'For Employee',
        title: 'AI Mentor',
        desc: 'Every morning, AI analyzes role and history to suggest 3 high-impact actions. It flags carry-over tasks and warns about overload.'
      },
      f2: {
        badge: 'For Manager',
        title: 'Daily Digest',
        desc: 'Instead of long reports, get a summary: who needs attention, where are the blockers, and what are the top risks today.'
      },
      f3: {
        badge: 'For Tasks',
        title: 'AI Structurer',
        desc: 'Turn messy thoughts like "fix client issue" into structured plans with outcomes, steps, and definition of done instantly.'
      }
    },
    workflow: {
      title: 'A Typical Day with AI Advisory',
      steps: [
        { title: 'Morning', desc: 'Employee drafts a quick 3-line plan.' },
        { title: 'AI Advice', desc: 'AI suggests focus & flags risks.' },
        { title: 'Work', desc: 'Focus on what matters. Manager sees pulse.' },
        { title: 'Evening', desc: 'Quick report. AI learns for tomorrow.' }
      ]
    },
    benefits: {
      title: 'What Changes?',
      items: [
        'Starts day with focus, not chaos.',
        'Managers stop chasing information.',
        'Important tasks stop sliding indefinitely.',
        'Common language: "Main Result", "Tails", "3 Actions".',
        'Clear view of value vs busywork.'
      ]
    },
    security: {
      title: 'Data & Security',
      text: 'We only process what is needed for advice: plans, reports, and tasks. No invasive screen logging. Data is encrypted and role-partitioned.'
    },
    testimonials: {
      title: 'Scenarios',
      t1: {
        role: 'Sales Team Lead',
        text: 'I used to read reports only when things broke. Now I get a morning digest: "Talk to these 3 people". My 1:1s are finally useful.'
      },
      t2: {
        role: 'Product Manager',
        text: 'I had a list of 50 tasks. AI forces me to pick 3. It hurts, but I finally started shipping important features.'
      }
    },
    faq: {
      title: 'FAQ',
      q1: 'Is this just ChatGPT?',
      a1: 'ChatGPT doesn’t know your team context or history. We track patterns over time to give specific, role-aware advice.',
      q2: 'Is it more bureaucracy?',
      a2: 'No. The form takes 2 minutes. If it doesn’t help you, you won’t use it. We optimize for value, not control.',
      q3: 'How to start?',
      a3: 'Pick one team. Run it for 2 weeks. See the clarity improve.'
    },
    cta: {
      title: 'Transform Your Team in 14 Days',
      text: 'Choose one team, start the simple "Plan -> AI Advice -> Report" ritual.',
      btn: 'Start Free Trial'
    }
  },
  uk: {
    nav: {
      features: 'Можливості',
      howItWorks: 'Як це працює',
      pricing: 'Ціни',
      benefits: 'Переваги',
      login: 'Увійти',
      cta: 'Спробувати 14 днів'
    },
    hero: {
      badge: 'New: AI Advisory Board 2.0',
      title: 'AI-наставник для вас і вашої команди',
      subtitle: 'Співробітник отримує чіткий фокус на день. Керівник — реальну картину без мікроменеджменту.',
      ctaPrimary: 'Запросити демо',
      ctaSecondary: 'Спробувати (14 днів)',
      trust: 'Без складних налаштувань. Старт за хвилини.'
    },
    roles: {
      title: 'Для сучасних команд',
      subtitle: 'Створено для тих, хто працює головою, а не лише руками.',
      ceo: {
        title: 'Власник / СЕО',
        text: 'Отримайте щоденний пульс бізнесу. Розумійте, куди йде час команди — у важливі ініціативи чи в "роботу про роботу".'
      },
      manager: {
        title: 'Team Lead',
        text: 'Бачте ризики заздалегідь. Знайте, з ким поговорити сьогодні, не перечитуючи сотні чатів.'
      },
      employee: {
        title: 'Співробітник',
        text: 'Замініть хаос на ясність. AI підкаже 3 головні дії та підсвітить "хвости", що тягнуть вас назад.'
      }
    },
    problem: {
      title: 'Реальність без AI Advisory',
      items: [
        'Задачі розкидані по Slack, Jira та нотатках.',
        'Плани пишуться "для галочки" або ігноруються.',
        'Керівники витрачають години на збір статусів.',
        'Важливі цілі постійно відкладаються "на завтра".'
      ],
      summary: 'Результат: Всі працюють багато, але прогрес повільний.'
    },
    features: {
      title: '3 дії, що змінюють гру',
      f1: {
        badge: 'Для співробітника',
        title: 'AI Ментор',
        desc: 'Щоранку AI аналізує роль та історію, щоб запропонувати 3 дії з найвищим впливом. Він попереджає про перевантаження.'
      },
      f2: {
        badge: 'Для керівника',
        title: 'Щоденний Дайджест',
        desc: 'Замість довгих звітів — коротке самарі: кому потрібна увага, де блокери і які ризики виникли сьогодні.'
      },
      f3: {
        badge: 'Для задач',
        title: 'AI Структуризатор',
        desc: 'Перетворює "кашу" в голові на чіткий план. З "розібратись з клієнтом" робить список кроків та критерії успіху.'
      }
    },
    workflow: {
      title: 'Типовий день з AI Advisory',
      steps: [
        { title: 'Ранок', desc: 'Короткий план на 3 рядки.' },
        { title: 'Порада AI', desc: 'AI дає фокус та підсвічує ризики.' },
        { title: 'Робота', desc: 'Фокус на головному. Прозорість.' },
        { title: 'Вечір', desc: 'Швидкий звіт. AI вчиться на завтра.' }
      ]
    },
    benefits: {
      title: 'Що зміниться?',
      items: [
        'День починається з фокусу, а не хаосу.',
        'Керівники перестають "полювати" за інформацією.',
        'Важливі задачі перестають вічно переноситись.',
        'З\'являється спільна мова: "Головний результат", "Хвости".',
        'Прозоре розуміння цінності часу.'
      ]
    },
    security: {
      title: 'Дані та Безпека',
      text: 'Ми обробляємо лише те, що потрібно для порад: плани та звіти. Жодних скріншотів чи кейлогерів. Дані шифруються.'
    },
    testimonials: {
      title: 'Сценарії використання',
      t1: {
        role: 'Sales Team Lead',
        text: 'Раніше я дізнавався про проблеми, коли все горіло. Тепер я отримую ранковий дайджест і знаю, кому допомогти.'
      },
      t2: {
        role: 'Product Manager',
        text: 'У мене було 50 задач. AI змушує обрати 3. Це боляче, але я нарешті почав закривати важливі проекти.'
      }
    },
    faq: {
      title: 'FAQ',
      q1: 'Чим це відрізняється від ChatGPT?',
      a1: 'ChatGPT не знає контексту вашої команди. Ми аналізуємо історію та патерни роботи, щоб давати персоналізовані поради.',
      q2: 'Це ще одна бюрократія?',
      a2: 'Ні. Форма займає 2 хвилини. Якщо це не приносить користі — ви не будете цим користуватись. Ми за цінність.',
      q3: 'З чого почати?',
      a3: 'Візьміть одну команду. Спробуйте 2 тижні. Ви побачите різницю в ясності та комунікації.'
    },
    cta: {
      title: 'Трансформуйте команду за 14 днів',
      text: 'Оберіть одну команду, запустіть ритуал "План -> AI -> Звіт".',
      btn: 'Почати безкоштовний тест'
    }
  }
};

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onNavigate }) => {
  const [lang, setLang] = useState<Lang>('en');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'uk') {
      setLang('uk');
    }
  }, []);

  const t = CONTENT[lang];

  const toggleLang = () => setLang(l => l === 'en' ? 'uk' : 'en');

  // Helper to safely scroll to ID without changing URL (prevents iframe connection errors)
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-white overflow-x-hidden selection:bg-blue-200 dark:selection:bg-blue-900">
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">AI</span>
              </div>
              <span className="font-bold text-xl tracking-tight hidden sm:block">Advisory Board</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('features')} className="text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors">
                {t.nav.features}
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors">
                {t.nav.howItWorks}
              </button>
              <button onClick={() => onNavigate('pricing')} className="text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors">
                {t.nav.pricing}
              </button>
              <button onClick={toggleLang} className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                <Globe className="w-4 h-4" /> {lang.toUpperCase()}
              </button>
              <div className="flex items-center gap-3">
                <button onClick={onLogin} className="text-sm font-medium text-slate-900 dark:text-white hover:text-blue-600 transition-colors">
                  {t.nav.login}
                </button>
                <button onClick={onLogin} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-bold transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40">
                  {t.nav.cta}
                </button>
              </div>
            </div>

            <div className="md:hidden flex items-center gap-4">
               <button onClick={toggleLang} className="text-slate-600 dark:text-slate-400">
                  <Globe className="w-5 h-5" />
               </button>
               <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
               </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 absolute w-full left-0 top-16 z-50">
            <div className="px-4 pt-2 pb-6 space-y-4 shadow-xl">
              <button 
                onClick={() => { scrollToSection('features'); setMobileMenuOpen(false); }} 
                className="block w-full text-left text-base font-medium text-slate-700 dark:text-slate-200 py-2"
              >
                {t.nav.features}
              </button>
              <button 
                onClick={() => { scrollToSection('how-it-works'); setMobileMenuOpen(false); }} 
                className="block w-full text-left text-base font-medium text-slate-700 dark:text-slate-200 py-2"
              >
                {t.nav.howItWorks}
              </button>
              <button 
                onClick={() => { onNavigate('pricing'); setMobileMenuOpen(false); }} 
                className="block w-full text-left text-base font-medium text-slate-700 dark:text-slate-200 py-2"
              >
                {t.nav.pricing}
              </button>
              <button onClick={onLogin} className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-bold shadow-md">
                {t.nav.cta}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="relative pt-20 pb-24 lg:pt-32 lg:pb-40 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            <div className="text-center lg:text-left animate-in slide-in-from-bottom-10 fade-in duration-700">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wide mb-6 border border-blue-100 dark:border-blue-800">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                {t.hero.badge}
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight mb-6">
                {lang === 'en' ? (
                  <>Your Daily <span className="text-blue-600">AI Mentor</span><br/>& Team Pulse</>
                ) : (
                  <>Щоденний <span className="text-blue-600">AI-наставник</span><br/>для команди</>
                )}
              </h1>
              
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {t.hero.subtitle}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button onClick={onLogin} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-xl shadow-blue-600/30 hover:scale-105 flex items-center justify-center gap-2">
                  {t.hero.ctaPrimary} <ArrowRight className="w-5 h-5" />
                </button>
                <button onClick={onLogin} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-8 py-4 rounded-xl text-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
                  <PlayCircle className="w-5 h-5" /> {t.hero.ctaSecondary}
                </button>
              </div>
              
              <p className="mt-6 text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center lg:justify-start gap-2">
                <ShieldCheck className="w-4 h-4 text-green-500" /> {t.hero.trust}
              </p>
            </div>

            {/* Hero Image / UI Mockup */}
            <div className="relative mx-auto lg:ml-auto w-full max-w-[600px] lg:max-w-none animate-in zoom-in-95 fade-in duration-1000 delay-200">
               <div className="relative rounded-2xl bg-white dark:bg-slate-800 shadow-2xl border border-slate-200 dark:border-slate-700 p-2 overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500">
                  <img 
                    src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop" 
                    alt="App Interface" 
                    className="rounded-xl w-full h-auto opacity-90"
                  />
                  
                  {/* Floating AI Card */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] bg-slate-900/90 backdrop-blur-md p-6 rounded-xl border border-slate-700 shadow-2xl text-left">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                           <Zap className="w-4 h-4 text-white" />
                        </div>
                        <div>
                           <p className="text-white font-bold text-sm">AI Mentor Advice</p>
                           <p className="text-slate-400 text-xs">Today, 09:15 AM</p>
                        </div>
                     </div>
                     <p className="text-slate-200 text-sm mb-3">Here are your top 3 actions for today:</p>
                     <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-xs text-white bg-white/10 p-2 rounded">
                           <Check className="w-3 h-3 text-green-400" /> Finalize Q1 Hiring Plan (Priority)
                        </li>
                         <li className="flex items-center gap-2 text-xs text-white bg-white/10 p-2 rounded">
                           <Check className="w-3 h-3 text-green-400" /> Client X Sync
                        </li>
                     </ul>
                  </div>
               </div>
               
               {/* Decorative blobs */}
               <div className="absolute -top-10 -right-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
               <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl -z-10 animate-pulse delay-700"></div>
            </div>

          </div>
        </div>
      </header>

      {/* Audience Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
               <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{t.roles.title}</h2>
               <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">{t.roles.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-blue-500 transition-colors group">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                     <BarChart3 className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 dark:text-white">{t.roles.ceo.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{t.roles.ceo.text}</p>
               </div>
               
               <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-purple-500 transition-colors group">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                     <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 dark:text-white">{t.roles.manager.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{t.roles.manager.text}</p>
               </div>

               <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-green-500 transition-colors group">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-6 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
                     <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 dark:text-white">{t.roles.employee.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{t.roles.employee.text}</p>
               </div>
            </div>
         </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-bl-full -mr-8 -mt-8"></div>
                
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">{t.problem.title}</h2>
                
                <div className="space-y-4 mb-8">
                   {t.problem.items.map((item, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30">
                         <X className="w-6 h-6 text-red-500 shrink-0" />
                         <span className="text-slate-700 dark:text-slate-200 font-medium">{item}</span>
                      </div>
                   ))}
                </div>
                
                <p className="text-center font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-sm">
                   {t.problem.summary}
                </p>
             </div>
         </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white dark:bg-slate-900 scroll-mt-20">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-16 dark:text-white">{t.features.title}</h2>

            <div className="space-y-20">
               {/* Feature 1 */}
               <div className="flex flex-col lg:flex-row items-center gap-12">
                  <div className="lg:w-1/2">
                     <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold uppercase mb-4">{t.features.f1.badge}</span>
                     <h3 className="text-3xl font-bold mb-4 dark:text-white">{t.features.f1.title}</h3>
                     <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">{t.features.f1.desc}</p>
                  </div>
                  <div className="lg:w-1/2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-1 shadow-2xl transform hover:scale-[1.02] transition-transform">
                     <div className="bg-white dark:bg-slate-900 rounded-xl p-6 h-full">
                        {/* Mockup */}
                        <div className="space-y-4">
                           <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">AI</div>
                              <div>
                                 <p className="font-bold text-sm dark:text-white">AI Mentor</p>
                                 <p className="text-xs text-slate-500">Suggested Focus</p>
                              </div>
                           </div>
                           <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg flex gap-3">
                              <Check className="w-5 h-5 text-green-600" />
                              <div className="text-sm dark:text-slate-200">
                                 <span className="font-bold">Focus:</span> Finalize Q1 Hiring Plan
                                 <p className="text-xs text-slate-500 mt-1">Reason: This task has been moved 3 times.</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Feature 2 */}
               <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
                  <div className="lg:w-1/2">
                     <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-bold uppercase mb-4">{t.features.f2.badge}</span>
                     <h3 className="text-3xl font-bold mb-4 dark:text-white">{t.features.f2.title}</h3>
                     <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">{t.features.f2.desc}</p>
                  </div>
                  <div className="lg:w-1/2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-1 shadow-2xl transform hover:scale-[1.02] transition-transform">
                     <div className="bg-white dark:bg-slate-900 rounded-xl p-6 h-full">
                        <div className="space-y-3">
                           <h4 className="font-bold text-sm uppercase text-slate-400">Team Risks</h4>
                           <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-lg flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                                 <span className="text-sm font-medium dark:text-white">Alex (Dev)</span>
                              </div>
                              <span className="text-xs font-bold text-red-600 bg-white dark:bg-slate-800 px-2 py-1 rounded">Stuck 2 days</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
               
               {/* Feature 3 */}
               <div className="flex flex-col lg:flex-row items-center gap-12">
                  <div className="lg:w-1/2">
                     <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-bold uppercase mb-4">{t.features.f3.badge}</span>
                     <h3 className="text-3xl font-bold mb-4 dark:text-white">{t.features.f3.title}</h3>
                     <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">{t.features.f3.desc}</p>
                  </div>
                  <div className="lg:w-1/2 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl p-1 shadow-2xl transform hover:scale-[1.02] transition-transform">
                     <div className="bg-white dark:bg-slate-900 rounded-xl p-6 h-full">
                        <div className="space-y-4">
                           <div className="opacity-50 blur-[1px]">
                              <p className="text-sm font-mono text-slate-500">Raw: "Fix client bug"</p>
                           </div>
                           <ArrowRight className="w-6 h-6 text-green-500 mx-auto rotate-90" />
                           <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                              <p className="font-bold text-sm mb-2 dark:text-white">Task: Resolve API Error 500 for Client X</p>
                              <ul className="text-xs text-slate-500 space-y-1">
                                 <li>• Check server logs</li>
                                 <li>• Reproduce locally</li>
                                 <li>• Deploy hotfix</li>
                              </ul>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

            </div>
         </div>
      </section>

      {/* Workflow Section */}
      <section id="how-it-works" className="py-20 bg-slate-900 text-white scroll-mt-20">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-16">{t.workflow.title}</h2>
            
            <div className="relative">
               {/* Line */}
               <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-700 -translate-y-1/2 hidden lg:block"></div>

               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {t.workflow.steps.map((step, i) => (
                     <div key={i} className="relative z-10 bg-slate-800 p-6 rounded-xl border border-slate-700 text-center hover:border-blue-500 transition-colors group">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold mx-auto mb-4 ring-8 ring-slate-900 group-hover:scale-110 transition-transform">
                           {i + 1}
                        </div>
                        <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                        <p className="text-slate-400 text-sm">{step.desc}</p>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">{t.benefits.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {t.benefits.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10">
                     <Check className="w-6 h-6 text-blue-600 shrink-0" />
                     <span className="font-medium text-slate-800 dark:text-slate-200">{item}</span>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* Security */}
      <section className="py-16 bg-slate-50 dark:bg-slate-800/50">
         <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full mb-6">
               <Lock className="w-6 h-6 text-slate-600 dark:text-slate-300" />
            </div>
            <h2 className="text-2xl font-bold mb-4 dark:text-white">{t.security.title}</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
               {t.security.text}
            </p>
         </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white dark:bg-slate-900">
         <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-16 dark:text-white">{t.testimonials.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-2xl relative">
                  <MessageSquare className="w-8 h-8 text-blue-200 dark:text-slate-600 absolute top-6 right-6" />
                  <p className="text-lg text-slate-700 dark:text-slate-300 italic mb-6">"{t.testimonials.t1.text}"</p>
                  <p className="font-bold text-slate-900 dark:text-white">— {t.testimonials.t1.role}</p>
               </div>
               <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-2xl relative">
                  <MessageSquare className="w-8 h-8 text-purple-200 dark:text-slate-600 absolute top-6 right-6" />
                  <p className="text-lg text-slate-700 dark:text-slate-300 italic mb-6">"{t.testimonials.t2.text}"</p>
                  <p className="font-bold text-slate-900 dark:text-white">— {t.testimonials.t2.role}</p>
               </div>
            </div>
         </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/30">
         <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">{t.faq.title}</h2>
            <div className="space-y-6">
               {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
                     <h3 className="font-bold text-lg mb-2 dark:text-white">{t.faq[`q${n}` as keyof typeof t.faq]}</h3>
                     <p className="text-slate-600 dark:text-slate-400">{t.faq[`a${n}` as keyof typeof t.faq]}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-blue-600 relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
         <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-6">{t.cta.title}</h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">{t.cta.text}</p>
            <button onClick={onLogin} className="bg-white text-blue-600 px-10 py-5 rounded-full text-xl font-bold hover:bg-blue-50 transition-transform hover:scale-105 shadow-2xl">
               {t.cta.btn}
            </button>
            <p className="mt-6 text-sm text-blue-200 opacity-80">No credit card required • Cancel anytime</p>
         </div>
      </section>

      <footer className="bg-slate-900 text-slate-400 py-12 text-center text-sm">
         <p>&copy; 2023 AI Advisory Board. All rights reserved.</p>
      </footer>
    </div>
  );
};
