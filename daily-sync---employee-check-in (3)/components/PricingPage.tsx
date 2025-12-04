
import React, { useState, useEffect } from 'react';
import { Check, X, ArrowRight, HelpCircle, Shield, Users, BarChart3, Zap, Globe, Menu, PlayCircle } from 'lucide-react';

interface PricingPageProps {
  onLogin: () => void;
  onBack: () => void;
}

type Lang = 'en' | 'uk';
type BillingCycle = 'monthly' | 'quarterly' | 'yearly';

const CONTENT = {
  uk: {
    nav: {
      home: 'Головна',
      login: 'Увійти',
      cta: 'Спробувати 14 днів'
    },
    header: {
      title: 'Прозоре ціноутворення для команди',
      subtitle: 'Платите за реальні робочі місця, а не за красиві дашборди. Співробітники отримують фокус, керівники — огляд.'
    },
    toggles: {
      monthly: 'Місяць',
      quarterly: '3 Місяці',
      yearly: 'Рік (Вигідно)'
    },
    plans: {
      basic: {
        name: 'Team Basic',
        desc: 'Для команд, які хочуть поставити простий ритуал "План → Звіт" без AI.',
        priceLabel: '/ співробітник / міс',
        features: [
          'Особистий екран "Мій день"',
          'Щоденні плани та звіти',
          'Історія задач',
          'Експорт даних (CSV)'
        ],
        notIncluded: 'AI-поради та дайджести не входять'
      },
      ai: {
        name: 'Team AI',
        badge: 'Рекомендовано',
        desc: 'Для команд, які хочуть, щоб AI щодня допомагав концентруватись на головному.',
        priceLabel: '/ співробітник / міс',
        features: [
          'Усе з Team Basic',
          'AI-порада "3 дії на сьогодні"',
          'AI-дайджест для керівника',
          'AI-структуризатор задач',
          'Автоматичні самарі днів'
        ]
      }
    },
    roles: {
      manager: {
        title: 'Робоче місце керівника',
        price: 'Free в бета-періоді',
        futurePrice: 'Планова ціна: $49/міс + $1.99/людину',
        desc: 'Керівник бачить щоденний огляд команди: з ким поговорити, де ризики, де блокери.'
      },
      owner: {
        title: 'Робоче місце власника',
        price: 'Free в бета-періоді',
        futurePrice: 'Планова ціна: $99/міс + $9.99/департамент',
        desc: 'Панель стану бізнесу: як використовують час ключові ролі та чи рухаються стратегічні ініціативи.'
      }
    },
    comparison: {
      title: 'Чому не просто купити ChatGPT Plus за $20?',
      text: 'ChatGPT не знає контексту вашої команди. AI Advisory Board щодня бачить плани, звіти та історію. Він не просто відповідає на питання — він веде вас до результату.'
    },
    faq: {
      title: 'Часті запитання',
      q1: 'Чому окремі місця для ролей?',
      a1: 'Співробітник веде день, керівник бачить команду, власник — бізнес. Ви платите за той рівень аналітики, який вам потрібен.',
      q2: 'Що значить "Free в бета-періоді"?',
      a2: 'Ви користуєтесь панелями керівника/власника безкоштовно, поки ми доводимо продукт. Ми показуємо майбутні ціни для прозорості.',
      q3: 'Чи можна почати без AI?',
      a3: 'Так. Тариф Team Basic ідеальний для старту. Коли команда звикне до ритму звітів, можна увімкнути AI.'
    },
    cta: {
      title: 'Почніть з однієї команди',
      text: 'Оберіть 3–7 людей і одного керівника. Запустіть на 14 днів.',
      btn: 'Запросити демо та розрахунок'
    }
  },
  en: {
    nav: {
      home: 'Home',
      login: 'Log In',
      cta: 'Try Free'
    },
    header: {
      title: 'Transparent Pricing for Your Team',
      subtitle: 'Pay for real seats, not vanity metrics. Employees get focus, managers get visibility.'
    },
    toggles: {
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      yearly: 'Yearly (Best Value)'
    },
    plans: {
      basic: {
        name: 'Team Basic',
        desc: 'For teams establishing a simple "Plan → Report" ritual without AI.',
        priceLabel: '/ user / month',
        features: [
          'Personal "My Day" screen',
          'Daily plans and reports',
          'Task history',
          'Data export (CSV)'
        ],
        notIncluded: 'AI advice and digests not included'
      },
      ai: {
        name: 'Team AI',
        badge: 'Recommended',
        desc: 'For teams that want AI to help focus on what matters daily.',
        priceLabel: '/ user / month',
        features: [
          'Everything in Team Basic',
          'AI Mentor "3 Actions for Today"',
          'Daily Manager Digest',
          'AI Task Structurer',
          'Automatic daily summaries'
        ]
      }
    },
    roles: {
      manager: {
        title: 'Manager Workspace',
        price: 'Free in Beta',
        futurePrice: 'Future price: $49/mo + $1.99/user',
        desc: 'Daily team overview: who to talk to, risks, and blockers.'
      },
      owner: {
        title: 'Owner Workspace',
        price: 'Free in Beta',
        futurePrice: 'Future price: $99/mo + $9.99/dept',
        desc: 'Business health dashboard: time usage by role and strategic progress.'
      }
    },
    comparison: {
      title: 'Why not just buy ChatGPT Plus for $20?',
      text: 'ChatGPT doesn\'t know your team context. AI Advisory Board sees plans, reports, and history daily. It doesn\'t just answer questions—it drives results.'
    },
    faq: {
      title: 'FAQ',
      q1: 'Why separate seats for roles?',
      a1: 'Employees manage days, managers oversee teams, owners view business health. You pay for the analytics level you need.',
      q2: 'What does "Free in Beta" mean?',
      a2: 'You use Manager/Owner panels for free while we refine the product. Future prices are shown for transparency.',
      q3: 'Can I start without AI?',
      a3: 'Yes. Team Basic is perfect for starting. Once the team adapts to the rhythm, you can enable AI.'
    },
    cta: {
      title: 'Start with One Team',
      text: 'Pick 3-7 people and one manager. Run it for 14 days.',
      btn: 'Request Demo & Quote'
    }
  }
};

const PRICES = {
  basic: { monthly: 2.99, quarterly: 2.49, yearly: 1.99 },
  ai: { monthly: 14.99, quarterly: 13.49, yearly: 9.99 }
};

export const PricingPage: React.FC<PricingPageProps> = ({ onLogin, onBack }) => {
  const [lang, setLang] = useState<Lang>('en');
  const [billing, setBilling] = useState<BillingCycle>('yearly');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'uk') {
      setLang('uk');
    }
  }, []);

  const t = CONTENT[lang];
  const toggleLang = () => setLang(l => l === 'en' ? 'uk' : 'en');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-white selection:bg-blue-200 dark:selection:bg-blue-900">
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={onBack}>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">AI</span>
              </div>
              <span className="font-bold text-xl tracking-tight hidden sm:block">Advisory Board</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <button onClick={onBack} className="text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors">
                {t.nav.home}
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
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 absolute w-full left-0 top-16 z-50">
            <div className="px-4 pt-2 pb-6 space-y-4 shadow-xl">
              <button onClick={onBack} className="block w-full text-left text-base font-medium text-slate-700 dark:text-slate-200 py-2">
                {t.nav.home}
              </button>
              <button onClick={onLogin} className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-bold shadow-md">
                {t.nav.cta}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Header */}
      <section className="pt-16 pb-12 text-center px-4">
         <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-6">
            {t.header.title}
         </h1>
         <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {t.header.subtitle}
         </p>
      </section>

      {/* Billing Toggle */}
      <section className="mb-12 flex justify-center px-4">
         <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl inline-flex flex-wrap justify-center gap-1">
            {(['monthly', 'quarterly', 'yearly'] as const).map((cycle) => (
               <button
                  key={cycle}
                  onClick={() => setBilling(cycle)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                     billing === cycle 
                     ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                     : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
               >
                  {t.toggles[cycle]}
               </button>
            ))}
         </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-4xl mx-auto">
            
            {/* Basic Plan */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 transition-colors flex flex-col">
               <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t.plans.basic.name}</h3>
               <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 min-h-[40px]">{t.plans.basic.desc}</p>
               
               <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                     <span className="text-4xl font-extrabold text-slate-900 dark:text-white">${PRICES.basic[billing]}</span>
                     <span className="text-slate-500 dark:text-slate-400">{t.plans.basic.priceLabel}</span>
                  </div>
               </div>

               <button onClick={onLogin} className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors mb-8">
                  {t.nav.cta}
               </button>

               <div className="space-y-4 flex-1">
                  {t.plans.basic.features.map((feat, i) => (
                     <div key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-slate-400 shrink-0" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{feat}</span>
                     </div>
                  ))}
                  <div className="flex items-start gap-3 opacity-60">
                     <X className="w-5 h-5 text-slate-400 shrink-0" />
                     <span className="text-sm text-slate-500 dark:text-slate-400 italic">{t.plans.basic.notIncluded}</span>
                  </div>
               </div>
            </div>

            {/* AI Plan */}
            <div className="bg-slate-900 dark:bg-slate-800 rounded-2xl p-8 border-2 border-blue-500 shadow-2xl relative flex flex-col transform hover:scale-[1.02] transition-transform">
               <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg uppercase tracking-wider">
                  {t.plans.ai.badge}
               </div>
               
               <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  {t.plans.ai.name} <Zap className="w-5 h-5 text-yellow-400 fill-current" />
               </h3>
               <p className="text-slate-300 text-sm mb-6 min-h-[40px]">{t.plans.ai.desc}</p>
               
               <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                     <span className="text-4xl font-extrabold text-white">${PRICES.ai[billing]}</span>
                     <span className="text-slate-400">{t.plans.ai.priceLabel}</span>
                  </div>
               </div>

               <button onClick={onLogin} className="w-full py-3 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors mb-8 shadow-lg shadow-blue-900/50">
                  {t.nav.cta}
               </button>

               <div className="space-y-4 flex-1">
                  {t.plans.ai.features.map((feat, i) => (
                     <div key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-400 shrink-0" />
                        <span className="text-sm text-white">{feat}</span>
                     </div>
                  ))}
               </div>
            </div>

         </div>
      </section>

      {/* Role Add-ons */}
      <section className="py-16 bg-slate-50 dark:bg-slate-800/50">
         <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-center mb-10 text-slate-900 dark:text-white">Add-ons (Beta)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               
               {/* Manager */}
               <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center shrink-0 text-purple-600 dark:text-purple-400">
                     <Users className="w-6 h-6" />
                  </div>
                  <div>
                     <h4 className="text-lg font-bold text-slate-900 dark:text-white">{t.roles.manager.title}</h4>
                     <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded uppercase">
                           {t.roles.manager.price}
                        </span>
                     </div>
                     <p className="text-xs text-slate-400 mb-3">{t.roles.manager.futurePrice}</p>
                     <p className="text-sm text-slate-600 dark:text-slate-300">{t.roles.manager.desc}</p>
                  </div>
               </div>

               {/* Owner */}
               <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
                     <BarChart3 className="w-6 h-6" />
                  </div>
                  <div>
                     <h4 className="text-lg font-bold text-slate-900 dark:text-white">{t.roles.owner.title}</h4>
                     <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded uppercase">
                           {t.roles.owner.price}
                        </span>
                     </div>
                     <p className="text-xs text-slate-400 mb-3">{t.roles.owner.futurePrice}</p>
                     <p className="text-sm text-slate-600 dark:text-slate-300">{t.roles.owner.desc}</p>
                  </div>
               </div>

            </div>
         </div>
      </section>

      {/* Comparison */}
      <section className="py-16 bg-white dark:bg-slate-900">
         <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="inline-block p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-6">
               <HelpCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t.comparison.title}</h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
               {t.comparison.text}
            </p>
         </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-slate-50 dark:bg-slate-800/30">
         <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-10 text-slate-900 dark:text-white">{t.faq.title}</h2>
            <div className="space-y-6">
               {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                     <h3 className="font-bold text-lg mb-2 dark:text-white">{t.faq[`q${n}` as keyof typeof t.faq]}</h3>
                     <p className="text-slate-600 dark:text-slate-400">{t.faq[`a${n}` as keyof typeof t.faq]}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-slate-900 text-white text-center">
         <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6">{t.cta.title}</h2>
            <p className="text-xl text-slate-400 mb-8">{t.cta.text}</p>
            <button onClick={onLogin} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-full text-lg font-bold transition-all shadow-lg hover:scale-105">
               {t.cta.btn}
            </button>
         </div>
      </section>

    </div>
  );
};
