(function(){
'use strict';

const VERSION='V0.8.2';
const $id=id=>document.getElementById(id);
const clamp2=(n,a,b)=>Math.max(a,Math.min(b,n));
const diffFail={discovery:.72,normal:1,hard:1.18,brutal:1.38};

function currentDifficulty(){return state?.v08?.difficulty||'normal'}
function currentHistory(){return Array.isArray(state?.history)?state.history:[]}
function pct(now,before){
  if(!Number.isFinite(now)||!Number.isFinite(before)||Math.abs(before)<.0001)return null;
  return (now-before)/Math.abs(before)*100;
}
function fmtPct(v){
  if(v===null||!Number.isFinite(v))return '—';
  const n=Math.abs(v)<.05?0:v;
  return `${n>0?'+':''}${n.toFixed(Math.abs(n)>=100?0:1)} %`;
}
function runway(){
  const burn=Math.max(0,(state.expenses||0)-(state.revenue||0));
  if(burn<=0)return Infinity;
  return Math.max(0,(state.cash||0)/burn);
}
function statClass(el,value){
  if(!el)return;
  el.classList.remove('positive','negative');
  if(value>0)el.classList.add('positive');
  if(value<0)el.classList.add('negative');
}

function ensureStatUI(){
  const grid=document.querySelector('#game-screen .stats-grid');
  if(grid&&!$id('profit-live')){
    const cards=[
      ['Résultat / mois','profit-live'],
      ['Runway','runway-live'],
      ['Valeur de ta part','owner-worth'],
      ['Dette','debt-live']
    ];
    cards.forEach(([label,id])=>{
      const a=document.createElement('article');
      a.className='stat-card';
      a.innerHTML=`<span>${label}</span><strong id="${id}"></strong>`;
      grid.appendChild(a);
    });
  }
  const strip=document.querySelector('#game-screen .economy-strip');
  const growth=$id('growth');
  if(growth&&growth.previousElementSibling)growth.previousElementSibling.textContent='Croissance CA (1 mois)';
  if(strip&&!$id('valuation-growth')){
    const d=document.createElement('div');
    d.innerHTML='<span>Croissance valo (1 mois)</span><b id="valuation-growth"></b>';
    strip.appendChild(d);
  }
  if(strip&&!$id('valuation-growth-total')){
    const d=document.createElement('div');
    d.innerHTML='<span>Valo depuis départ</span><b id="valuation-growth-total"></b>';
    strip.appendChild(d);
  }
}

const originalPushHistory=pushHistory;
pushHistory=function(){
  originalPushHistory();
  const h=currentHistory(),p=h[h.length-1];
  if(p){
    p.equity=state.equity;
    p.profit=state.profit;
    p.expenses=state.expenses;
    p.debt=state.debt;
    p.customers=state.customers;
    p.users=state.users;
  }
};

function renderLiveStats(){
  ensureStatUI();
  const h=currentHistory(),last=h[h.length-1],prev=h[h.length-2],first=h[0];
  const revenueGrowth=last&&prev?pct(last.revenue,prev.revenue):null;
  const valuationGrowth=last&&prev?pct(last.valuation,prev.valuation):null;
  const totalValGrowth=last&&first?pct(last.valuation,first.valuation):null;
  const growth=$id('growth');
  if(growth){growth.textContent=fmtPct(revenueGrowth);statClass(growth,revenueGrowth||0);growth.title='Variation réelle du chiffre d’affaires par rapport au mois précédent.'}
  const vg=$id('valuation-growth');
  if(vg){vg.textContent=fmtPct(valuationGrowth);statClass(vg,valuationGrowth||0);vg.title='Variation réelle de la valorisation par rapport au mois précédent.'}
  const vgt=$id('valuation-growth-total');
  if(vgt){vgt.textContent=fmtPct(totalValGrowth);statClass(vgt,totalValGrowth||0);vgt.title='Évolution de la valorisation depuis le début de cette partie.'}
  const profit=$id('profit-live');
  if(profit){profit.textContent=fmtMoney(state.profit);statClass(profit,state.profit);profit.title='Revenu mensuel moins toutes les dépenses mensuelles.'}
  const r=$id('runway-live'),rw=runway();
  if(r){r.textContent=rw===Infinity?'Rentable':`${rw.toFixed(1)} mois`;statClass(r,rw===Infinity||rw>=6?1:rw<3?-1:0);r.title='Nombre approximatif de mois avant épuisement du cash au rythme actuel.'}
  const worth=$id('owner-worth');
  if(worth){worth.textContent=fmtMoney(state.valuation*state.equity);worth.title='Valorisation de l’entreprise × pourcentage que tu détiens réellement.'}
  const debt=$id('debt-live');
  if(debt){debt.textContent=fmtMoney(state.debt||0);statClass(debt,-(state.debt||0));}
  const eq=$id('equity');
  if(eq){eq.textContent=`${(state.equity*100).toFixed(1)} %`;eq.title=`Tu possèdes réellement ${(state.equity*100).toFixed(2)} % de l’entreprise. Valeur théorique : ${fmtMoney(state.valuation*state.equity)}.`}
}

const renderBeforeStats=render;
render=function(){renderBeforeStats();renderLiveStats()};

function baseForChoice(choice,index){
  const visible=chooseCost(choice)||0;
  if(index===0&&visible>0)return visible;
  if(index===1&&visible>0)return visible/.4;
  return Math.round(180+(state.month||1)*32+Math.sqrt(Math.max(0,state.valuation||0))*1.8);
}
function proceduralOutcome(category,index){
  if(index===0)return `Tu choisis une réponse offensive sur ce dossier.`;
  if(index===1)return `Tu choisis une réponse mesurée pour limiter le risque.`;
  return `Tu préserves le cash et acceptes de laisser une partie du risque ouverte.`;
}
function applyProcedural(category,index,choice){
  const cost=chooseCost(choice)||0;
  const base=baseForChoice(choice,index);
  if(cost>0)state.cash-=cost;
  switch(category){
    case'PRODUCT':
      if(index===0){state.product+=7;state.conversion+=.004}
      else if(index===1){state.product+=3;state.conversion+=.0015}
      else{state.product-=.7;state.growth-=.001}
      break;
    case'SALES':
      if(index===0){state.cash+=700+state.month*95+state.price*12;state.reputation+=1.5;state.product-=.5}
      else if(index===1){state.cash+=350+state.month*55+state.price*6;state.reputation+=.7;state.price*=.99}
      else state.product+=1.2;
      break;
    case'MARKETING':
      if(index===0){state.users*=1.15+Math.random()*.12;state.marketing+=base*.12}
      else if(index===1){state.users*=1.04+Math.random()*.07;state.growth+=.002}
      else state.product+=.5;
      break;
    case'TEAM':
      if(index===0){state.employees++;state.team++;state.product+=3;state.growth+=.003}
      else if(index===1)state.product+=2;
      else state.growth-=.001;
      break;
    case'FINANCE':
      if(index===0){
        const mult=diffFail[currentDifficulty()]||1;
        const amount=clamp2(state.valuation*(.18+.08*Math.random()),3000,8000000);
        const dilution=clamp2(.055+.075*Math.random()*mult,.05,.17);
        state.cash+=amount;
        state.equity*=1-dilution;
        state.totalRaised=(state.totalRaised||0)+amount;
        return `Tu lèves ${fmtMoney(amount)} et cèdes ${(dilution*100).toFixed(1)} % de ta participation actuelle. Tu détiens maintenant ${(state.equity*100).toFixed(1)} %.`;
      }else if(index===1){
        const amount=clamp2(state.valuation*(.08+.05*Math.random()),2000,2500000);
        state.cash+=amount;state.debt+=amount;
        return `Tu empruntes ${fmtMoney(amount)} sans dilution. Ta dette monte à ${fmtMoney(state.debt)}.`;
      }else{state.marketing*=.5;state.growth-=.002}
      break;
    case'COMPETITION':
      if(index===0){state.product+=4;state.reputation+=1.5}
      else if(index===1){state.price=Math.max(5,state.price*.97);state.conversion+=.003}
      else if(Math.random()<.38*(diffFail[currentDifficulty()]||1)){state.users*=.94;state.reputation-=2.5}
      break;
    case'INFRA':
      if(index===0){state.infraLevel++;state.reputation++}
      else if(index===1)state.infraEfficiency=clamp2(state.infraEfficiency*.93,.52,1);
      else if(Math.random()<.28*(diffFail[currentDifficulty()]||1)){state.users*=.9;state.reputation-=5}
      break;
    case'REPUTATION':
      if(index===0)state.reputation+=5;
      else if(index===1)state.reputation+=2.5;
      else if(Math.random()<.38*(diffFail[currentDifficulty()]||1))state.reputation-=4.5;
      break;
    case'LEGAL':
      if(index===0)state.compliance=(state.compliance||50)+9;
      else if(index===1)state.compliance=(state.compliance||50)+3;
      else if(Math.random()<.24*(diffFail[currentDifficulty()]||1)){state.cash-=base*1.5;state.reputation-=3}
      break;
    case'STRATEGY':
      if(index===0){state.growth+=.007;state.users*=1.05}
      else if(index===1){state.product+=1.5;state.conversion+=.002}
      else{state.product+=.4;state.growth-=.0007}
      break;
    case'OPERATIONS':
      if(index===0){state.infraEfficiency=clamp2(state.infraEfficiency*.91,.5,1);state.product+=2}
      else if(index===1)state.infraEfficiency=clamp2(state.infraEfficiency*.96,.55,1);
      else if(Math.random()<.3*(diffFail[currentDifficulty()]||1))state.cash-=base*.6;
      break;
    case'CUSTOMER':
      if(index===0){state.reputation+=5;state.conversion+=.003}
      else if(index===1){state.reputation+=2;state.conversion+=.0015}
      else if(Math.random()<.34*(diffFail[currentDifficulty()]||1)){state.reputation-=3;state.conversion-=.0015}
      break;
    case'SUPPLY':
      if(index===0){state.infraEfficiency=clamp2(state.infraEfficiency*.9,.5,1);state.reputation+=1}
      else if(index===1)state.infraEfficiency=clamp2(state.infraEfficiency*.96,.55,1);
      else if(Math.random()<.3*(diffFail[currentDifficulty()]||1)){state.cash-=base*.8;state.product-=2}
      break;
    case'EXPANSION':
      if(index===0){state.users*=1.16;state.growth+=.006}
      else if(index===1){state.users*=1.06;state.growth+=.002}
      else state.product+=.5;
      break;
  }
  return proceduralOutcome(category,index);
}

const chooseFromV08=choose;
choose=function(choice){
  const procedural=typeof currentEvent?.id==='string'&&currentEvent.id.startsWith('v08-')&&Array.isArray(currentEvent.choices);
  if(!procedural)return chooseFromV08(choice);
  const cost=chooseCost(choice);
  if(cost>0&&cost>Math.max(0,state.cash))return;
  const before=snapshot();
  const index=Math.max(0,currentEvent.choices.indexOf(choice));
  const outcome=applyProcedural(currentEvent.category,index,choice);
  state.month++;
  recalcEconomy();
  pushHistory();
  addFeed('Mois '+state.month,`${choice.label} — ${monthlySummary()}`);
  render();
  pendingEnd=detectEnd();
  renderFeedback(choice,outcome,before);
};

queueMicrotask(()=>{
  ensureStatUI();
  document.title='Scale Up — '+VERSION;
  const badge=document.querySelector('.hero h1')?.nextElementSibling;
  if(badge)badge.textContent=VERSION;
  renderLiveStats();
  console.info('Scale Up '+VERSION+' — statistiques réelles et dilution corrigée');
});
})();