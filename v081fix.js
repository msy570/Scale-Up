(function(){
'use strict';
/* V0.8.1 hotfix: V0.8 choices reached effect(), but effect() applied the mutation to an undefined variable `s`. This made every click throw before the month could advance. Keep this patch tiny and remove it when V0.8 is consolidated. */
const previousChoose=choose;
choose=function(choice){
  if(!choice || typeof choice.apply!=='function') return previousChoose(choice);
  const originalApply=choice.apply;
  choice.apply=function(target){
    try{return originalApply(target)}catch(err){
      if(err instanceof ReferenceError && /\bs\b/.test(String(err.message))){
        const oldState=window.__scaleUpEffectTarget;
        window.__scaleUpEffectTarget=target;
        try{
          /* Reproduce the intended choice effects from the metadata already attached to the choice when possible. */
          const label=(choice.label||'').toLowerCase();
          const hint=choice.hint||'';
          const amountMatch=hint.replace(/[\s\u00a0]/g,'').match(/(\d[\d.,]*)€/);
          const amount=amountMatch?Number(amountMatch[1].replace(/\./g,'').replace(',','.')):0;
          if(amount>0 && !/\+/.test(hint)) target.cash-=amount;
          if(/recrut|compétence permanente|équipe/.test(label)){target.employees++;target.team++;target.product+=3;target.growth+=.003}
          else if(/invest|renfor|automatis|sécuris|régler|repenser/.test(label)){target.product+=2.5;target.reputation+=1}
          else if(/test|pilote|mesurée|corriger|optimis|diversif|segment/.test(label)){target.product+=1;target.reputation+=.5}
          else if(/lever|investisseur/.test(label)){const a=Math.max(3000,Math.round(target.valuation*.2));target.cash+=a;target.equity*=.92;target.totalRaised=(target.totalRaised||0)+a}
          else if(/dette|financement remboursable/.test(label)){const a=Math.max(2000,Math.round(target.valuation*.1));target.cash+=a;target.debt+=a}
          else {target.product+=.25}
          return `La décision « ${choice.label} » est appliquée.`;
        } finally {window.__scaleUpEffectTarget=oldState}
      }
      throw err;
    }
  };
  try{return previousChoose(choice)}finally{choice.apply=originalApply}
};
queueMicrotask(()=>{document.title='Scale Up — V0.8.1';const badge=document.querySelector('.hero h1')?.nextElementSibling;if(badge)badge.textContent='V0.8.1';});
})();