(function(){
'use strict';

const VERSION='V0.8.3';
const $id=id=>document.getElementById(id);
const clamp2=(n,a,b)=>Math.max(a,Math.min(b,n));
const diffFail={discovery:.72,normal:1,hard:1.18,brutal:1.38};
const ECON={
  grocer:{variable:.67,fixed:170,revMultiple:1.0,profitMultiple:7,acq:.45},
  freelance:{variable:.10,fixed:90,revMultiple:1.35,profitMultiple:9,acq:.55},
  ecommerce:{variable:.50,fixed:320,revMultiple:1.8,profitMultiple:10,acq:.75},
  saas:{variable:.09,fixed:240,revMultiple:5.5,profitMultiple:18,acq:.95},
  pme:{variable:.43,fixed:1450,revMultiple:1.6,profitMultiple:9,acq:.50},
  funded:{variable:.11,fixed:2600,revMultiple:6.5,profitMultiple:20,acq:1.05}
};

function diff(){return state?.v08?.difficulty||'normal'}
function startKey(){return state?.v08?.start||'grocer'}
function econ(){return ECON[startKey()]||ECON.grocer}
function history(){return Array.isArray(state?.history)?state.history:[]}
function pct(now,before){if(!Number.isFinite(now)||!Number.isFinite(before)||Math.abs(before)<.0001)return null;return(now-before)/Math.abs(before)*100}
function fmtPct(v){if(v===null||!Number.isFinite(v))return'—';const n=Math.abs(v)<.05?0:v;return`${n>0?'+':''}${n.toFixed(Math.abs(n)>=100?0:1)} %`}
function runway(){const burn=Math.max(0,(state.expenses||0)-(state.revenue||0));return burn<=0?Infinity:Math.max(0,(state.cash||0)/burn)}
function statClass(el,value){if(!el)return;el.classList.remove('positive','negative');if(value>0)el.classList.add('positive');if(value<0)el.classList.add('negative')}
function annualRevenue(){return Math.max(0,(state.revenue||0)*12)}
function netMargin(){return state.revenue>0?state.profit/state.revenue*100:null}
function debtRatio(){const ar=annualRevenue();return ar>0?(state.debt||0)/ar:0}
function founderWorth(){return Math.max(0,state.valuation||0)*clamp2(state.equity||0,0,1)}
function healthScore(){
  const rw=runway(),margin=netMargin()??-100,dr=debtRatio();
  let s=50;
  s+=rw===Infinity?22:clamp2((rw-4)*3,-18,18);
  s+=clamp2(margin*.35,-18,18);
  s+=clamp2(((state.reputation||50)-50)*.22,-10,10);
  s-=clamp2(dr*18,0,20);
  return Math.round(clamp2(s,0,100));
}

function ensureUI(){
  const grid=document.querySelector('#game-screen .stats-grid');
  const cards=[['Résultat / mois','profit-live'],['Runway','runway-live'],['Valeur de ta part','owner-worth'],['Dette','debt-live'],['Marge nette','net-margin'],['Santé financière','health-live']];
  if(grid)cards.forEach(([label,id])=>{if($id(id))return;const a=document.createElement('article');a.className='stat-card';a.innerHTML=`<span>${label}</span><strong id="${id}"></strong>`;grid.appendChild(a)});
  const strip=document.querySelector('#game-screen .economy-strip');
  const growth=$id('growth');if(growth&&growth.previousElementSibling)growth.previousElementSibling.textContent='Croissance CA (1 mois)';
  [['Croissance clients','customer-growth'],['Croissance valo','valuation-growth'],['Dette / CA annuel','debt-ratio']].forEach(([label,id])=>{if(!strip||$id(id))return;const d=document.createElement('div');d.innerHTML=`<span>${label}</span><b id="${id}"></b>`;strip.appendChild(d)});
}

/* --- Modèle économique cohérent --- */
expenseBreakdown=function(){
  const e=econ();
  const salaries=Math.max(0,(state.employees||0)*(state.salaryPerEmployee||0));
  const infra=Math.round((e.fixed+Math.max(0,state.users||0)*.035*Math.max(.55,state.infraEfficiency||1))*((state.infraLevel||1)*.08+.92));
  const marketing=Math.max(0,Math.round(state.marketing||0));
  const debtCost=Math.max(0,Math.round((state.debt||0)*.012));
  const variable=Math.max(0,Math.round((state.revenue||0)*e.variable));
  return{salaries,infra,marketing,debtCost,variable,total:salaries+infra+marketing+debtCost+variable};
};

function valuationFromEconomy(){
  const e=econ();
  const ar=annualRevenue();
  const annualProfit=Math.max(0,(state.profit||0)*12);
  const quality=clamp2(.72+(state.product||50)/180+(state.reputation||50)/260,.75,1.55);
  const momentum=history().length>1?clamp2(1+(pct(state.revenue,history()[history().length-2]?.revenue)||0)/250,.75,1.45):1;
  const revenueValue=ar*e.revMultiple*quality*momentum;
  const profitValue=annualProfit*e.profitMultiple*quality;
  const base=Math.max(revenueValue,profitValue);
  const netCash=Math.max(-base*.45,(state.cash||0)-(state.debt||0));
  return Math.max(1000,Math.round(base+netCash*.65));
}

recalcSnapshotOnly=function(){
  state.equity=clamp2(Number.isFinite(state.equity)?state.equity:1,.001,1);
  state.product=clamp2(state.product||50,5,100);state.reputation=clamp2(state.reputation||50,0,100);state.compliance=clamp2(state.compliance||50,0,100);
  state.conversion=clamp2(state.conversion||.05,.005,.35);state.growth=clamp2(state.growth||.05,-.05,.35);
  state.customers=Math.max(1,Math.round(Math.min(state.users||1,(state.users||1)*state.conversion)));
  state.revenue=Math.max(0,Math.round(state.customers*Math.max(1,state.price||1)));
  const b=expenseBreakdown();state.expenses=b.total;state.profit=state.revenue-state.expenses;state.valuation=valuationFromEconomy();
};

recalcEconomy=function(){
  state.equity=clamp2(Number.isFinite(state.equity)?state.equity:1,.001,1);
  state.product=clamp2(state.product||50,5,100);state.reputation=clamp2(state.reputation||50,0,100);state.compliance=clamp2(state.compliance||50,0,100);
  state.conversion=clamp2(state.conversion||.05,.005,.35);state.growth=clamp2(state.growth||.05,-.05,.35);
  const e=econ();
  const quality=(state.product/100)*.55+(state.reputation/100)*.45;
  const organicRate=clamp2(state.growth*(.62+quality*.7),-.04,.28);
  const paidUsers=(state.marketing||0)*e.acq*(.65+state.reputation/120);
  const churnRate=clamp2(.085-state.product*.00048-state.reputation*.00028,.012,.095);
  const newUsers=Math.max(0,(state.users||0)*Math.max(0,organicRate)+paidUsers);
  const lostUsers=Math.max(0,(state.users||0)*churnRate);
  state.users=Math.max(10,Math.round((state.users||10)+newUsers-lostUsers));
  const pricePenalty=clamp2(1-Math.max(0,(state.price||1)-40)*.0012,.68,1);
  const effectiveConv=clamp2(state.conversion*pricePenalty*(.78+state.product/210+state.reputation/350),.005,.40);
  state.customers=Math.max(1,Math.round(state.users*effectiveConv));
  state.revenue=Math.max(0,Math.round(state.customers*Math.max(1,state.price||1)));
  const b=expenseBreakdown();state.expenses=b.total;state.profit=state.revenue-state.expenses;
  state.cash=(state.cash||0)+state.profit;
  state.valuation=valuationFromEconomy();
  if(diff()==='discovery')state.reputation=clamp2(state.reputation+.25,0,100);
  if(diff()==='hard')state.reputation=clamp2(state.reputation-.10,0,100);
  if(diff()==='brutal')state.reputation=clamp2(state.reputation-.22,0,100);
};

const originalPushHistory=pushHistory;
pushHistory=function(){
  originalPushHistory();
  const h=history(),p=h[h.length-1];if(!p)return;
  Object.assign(p,{equity:state.equity,profit:state.profit,expenses:state.expenses,debt:state.debt,customers:state.customers,users:state.users,margin:netMargin(),health:healthScore()});
};

function renderLive(){
  ensureUI();
  const h=history(),last=h[h.length-1],prev=h[h.length-2];
  const rg=last&&prev?pct(last.revenue,prev.revenue):null,cg=last&&prev?pct(last.customers,prev.customers):null,vg=last&&prev?pct(last.valuation,prev.valuation):null;
  const growth=$id('growth');if(growth){growth.textContent=fmtPct(rg);statClass(growth,rg||0);growth.title='Variation réelle du chiffre d’affaires par rapport au mois précédent.'}
  const cge=$id('customer-growth');if(cge){cge.textContent=fmtPct(cg);statClass(cge,cg||0);cge.title='Variation du nombre de clients actifs par rapport au mois précédent.'}
  const vge=$id('valuation-growth');if(vge){vge.textContent=fmtPct(vg);statClass(vge,vg||0);vge.title='Variation de la valorisation par rapport au mois précédent.'}
  const profit=$id('profit-live');if(profit){profit.textContent=fmtMoney(state.profit);statClass(profit,state.profit)}
  const rw=runway(),r=$id('runway-live');if(r){r.textContent=rw===Infinity?'Rentable':`${rw.toFixed(1)} mois`;statClass(r,rw===Infinity||rw>=6?1:rw<3?-1:0)}
  const worth=$id('owner-worth');if(worth){worth.textContent=fmtMoney(founderWorth());worth.title='Valorisation × part détenue.'}
  const debt=$id('debt-live');if(debt){debt.textContent=fmtMoney(state.debt||0);statClass(debt,-(state.debt||0))}
  const nm=$id('net-margin'),m=netMargin();if(nm){nm.textContent=m===null?'—':fmtPct(m);statClass(nm,m||0);nm.title='Résultat mensuel ÷ revenu mensuel.'}
  const hs=$id('health-live'),score=healthScore();if(hs){hs.textContent=`${score}/100`;statClass(hs,score>=65?1:score<40?-1:0);hs.title='Synthèse du runway, de la marge, de la dette et de la réputation.'}
  const dr=$id('debt-ratio'),ratio=debtRatio();if(dr){dr.textContent=`${(ratio*100).toFixed(ratio>=1?0:1)} %`;statClass(dr,ratio>.5?-1:ratio<.15?1:0);dr.title='Dette totale divisée par le chiffre d’affaires annualisé.'}
  const eq=$id('equity');if(eq){state.equity=clamp2(state.equity,.001,1);eq.textContent=`${(state.equity*100).toFixed(1)} %`;eq.title=`Part réelle du fondateur. Valeur théorique : ${fmtMoney(founderWorth())}. Elle ne baisse que lors d’une cession de capital.`}
  const expenses=$id('expenses');if(expenses){const b=expenseBreakdown();expenses.title=`Salaires ${fmtMoney(b.salaries)} · exploitation ${fmtMoney(b.variable)} · infra ${fmtMoney(b.infra)} · marketing ${fmtMoney(b.marketing)} · intérêts ${fmtMoney(b.debtCost)}`}
}
const oldRender=render;render=function(){oldRender();renderLive()};

/* --- Choix procéduraux : coûts uniques + dilution économique --- */
function baseForChoice(choice,index){const visible=chooseCost(choice)||0;if(index===0&&visible>0)return visible;if(index===1&&visible>0)return visible/.4;return Math.round(180+(state.month||1)*32+Math.sqrt(Math.max(0,state.valuation||0))*1.8)}
function investmentRound(scale){
  const pre=Math.max(2500,state.valuation||2500);
  const amount=clamp2(pre*scale,2500,8000000);
  const dilution=clamp2(amount/(pre+amount),.03,.28);
  state.cash+=amount;state.equity*=1-dilution;state.totalRaised=(state.totalRaised||0)+amount;
  state.equity=clamp2(state.equity,.001,1);
  return{amount,dilution};
}
function applyProcedural(category,index,choice){
  const c=chooseCost(choice)||0,base=baseForChoice(choice,index);if(c>0)state.cash-=c;
  const f=diffFail[diff()]||1;
  switch(category){
    case'PRODUCT':if(index===0){state.product+=7;state.conversion+=.004}else if(index===1){state.product+=3;state.conversion+=.0015}else{state.product-=.6;state.growth-=.001}break;
    case'SALES':if(index===0){state.cash+=700+state.month*95+state.price*12;state.reputation+=1.3}else if(index===1){state.cash+=350+state.month*55+state.price*6;state.reputation+=.6;state.price*=.995}else state.product+=.8;break;
    case'MARKETING':if(index===0){state.users*=1.12+Math.random()*.08;state.marketing+=base*.08}else if(index===1){state.users*=1.035+Math.random()*.05;state.growth+=.0015}else state.product+=.3;break;
    case'TEAM':if(index===0){state.employees++;state.team++;state.product+=2.5;state.growth+=.002}else if(index===1)state.product+=1.5;else state.growth-=.0007;break;
    case'FINANCE':if(index===0){const r=investmentRound(.16+.07*Math.random());return`Tu lèves ${fmtMoney(r.amount)} sur une valorisation pré-money de ${fmtMoney(state.valuation)}. Dilution : ${(r.dilution*100).toFixed(1)} points. Tu détiens maintenant ${(state.equity*100).toFixed(1)} %.`}else if(index===1){const a=clamp2((state.valuation||2500)*(.07+.04*Math.random()),2000,2500000);state.cash+=a;state.debt+=a;return`Tu empruntes ${fmtMoney(a)} sans dilution. Dette totale : ${fmtMoney(state.debt)}.`}else{state.marketing*=.65;state.growth-=.0015}break;
    case'COMPETITION':if(index===0){state.product+=3.5;state.reputation+=1.2}else if(index===1){state.price=Math.max(5,state.price*.985);state.conversion+=.0025}else if(Math.random()<.32*f){state.users*=.95;state.reputation-=2}break;
    case'INFRA':if(index===0){state.infraLevel++;state.reputation+=.8}else if(index===1)state.infraEfficiency=clamp2(state.infraEfficiency*.94,.52,1);else if(Math.random()<.24*f){state.users*=.92;state.reputation-=4}break;
    case'REPUTATION':if(index===0)state.reputation+=4.5;else if(index===1)state.reputation+=2;else if(Math.random()<.34*f)state.reputation-=4;break;
    case'LEGAL':if(index===0)state.compliance=(state.compliance||50)+8;else if(index===1)state.compliance=(state.compliance||50)+3;else if(Math.random()<.22*f){state.cash-=base*1.3;state.reputation-=2.5}break;
    case'STRATEGY':if(index===0){state.growth+=.005;state.users*=1.04}else if(index===1){state.product+=1.3;state.conversion+=.0017}else state.growth-=.0004;break;
    case'OPERATIONS':if(index===0){state.infraEfficiency=clamp2(state.infraEfficiency*.92,.5,1);state.product+=1.5}else if(index===1)state.infraEfficiency=clamp2(state.infraEfficiency*.965,.55,1);else if(Math.random()<.27*f)state.cash-=base*.5;break;
    case'CUSTOMER':if(index===0){state.reputation+=4;state.conversion+=.0025}else if(index===1){state.reputation+=1.8;state.conversion+=.0013}else if(Math.random()<.3*f){state.reputation-=2.5;state.conversion-=.0012}break;
    case'SUPPLY':if(index===0){state.infraEfficiency=clamp2(state.infraEfficiency*.92,.5,1);state.reputation+=.7}else if(index===1)state.infraEfficiency=clamp2(state.infraEfficiency*.97,.55,1);else if(Math.random()<.28*f){state.cash-=base*.7;state.product-=1.5}break;
    case'EXPANSION':if(index===0){state.users*=1.13;state.growth+=.0045}else if(index===1){state.users*=1.05;state.growth+=.0015}else state.product+=.3;break;
  }
  return index===0?'Tu prends une décision offensive avec un impact durable.':index===1?'Tu avances de façon mesurée pour limiter le risque.':'Tu préserves le cash et acceptes de laisser le risque ouvert.';
}

const chooseV08=choose;
choose=function(choice){
  const procedural=typeof currentEvent?.id==='string'&&currentEvent.id.startsWith('v08-')&&Array.isArray(currentEvent.choices);if(!procedural)return chooseV08(choice);
  const c=chooseCost(choice);if(c>0&&c>Math.max(0,state.cash))return;
  const before=snapshot(),index=Math.max(0,currentEvent.choices.indexOf(choice)),outcome=applyProcedural(currentEvent.category,index,choice);
  state.month++;recalcEconomy();pushHistory();addFeed('Mois '+state.month,`${choice.label} — ${monthlySummary()}`);render();pendingEnd=detectEnd();renderFeedback(choice,outcome,before);
};

financingEvent=function(){
  const pre=Math.max(2500,state.valuation||2500),need=Math.max(2000,Math.ceil(Math.abs(state.cash)+state.expenses*2)),amount=Math.max(need,Math.round(pre*.22));
  const dilution=clamp2(amount/(pre+amount),.06,.30);
  return{id:`rescue-v083-${state.month}`,category:'FINANCE',risk:'Trésorerie critique',title:'La trésorerie passe sous zéro',description:`Tu dois refinancer l’activité. Cash ${fmtMoney(state.cash)}, valorisation pré-money ${fmtMoney(pre)}, coûts ${fmtMoney(state.expenses)}/mois.`,choices:[{label:'Faire entrer un investisseur',hint:`+${fmtMoney(amount)} · dilution ${(dilution*100).toFixed(1)} %`,cost:0,good:'Tu achètes du runway avec un prix de dilution calculé sur la valorisation actuelle.',bad:'Une levée en urgence dilue davantage quand la valorisation est faible.',apply:s=>{s.cash+=amount;s.equity*=1-dilution;s.totalRaised=(s.totalRaised||0)+amount;return`Tu détiens maintenant ${(s.equity*100).toFixed(1)} % de la société.`}},{label:'Dette court terme',hint:`+${fmtMoney(amount)} · aucune dilution`,cost:0,good:'Tu conserves tes parts.',bad:'Les intérêts augmentent les charges mensuelles.',apply:s=>{s.cash+=amount;s.debt+=amount;return`Dette totale : ${fmtMoney(s.debt)}.`}},{label:'Arrêter l’activité',hint:'Fin de la run',cost:0,quit:true,good:'Tu limites les pertes.',bad:'La valeur future disparaît.',apply:()=>''}]};
};

queueMicrotask(()=>{ensureUI();document.title='Scale Up — '+VERSION;const badge=document.querySelector('.hero h1')?.nextElementSibling;if(badge)badge.textContent=VERSION;renderLive();console.info('Scale Up '+VERSION+' — modèle économique, croissance et dilution recalculés');});
})();