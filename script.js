const $ = (id) => document.getElementById(id);
const fmtMoney = (n) => new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n);
const fmt = (n) => new Intl.NumberFormat('fr-FR',{maximumFractionDigits:0}).format(Math.round(n));
const clamp = (n,min,max) => Math.max(min,Math.min(max,n));

const START = {
  month: 1, cash: 1000, users: 80, customers: 4, price: 12,
  team: 1, salaryPerPerson: 1100, marketing: 0, infraLevel: 1,
  reputation: 50, product: 42, growth: 0.10, conversion: 0.05,
  equity: 1, debt: 0, totalRaised: 0, valuation: 5000,
  revenue: 48, expenses: 1180, profit: -1132, history: [], flags: {}
};

let state = {};
let currentEvent = null;

const events = [
  {
    id:'first-client', category:'CLIENT', risk:'Risque faible',
    condition:s=>s.month<=4,
    title:'Un premier client veut une fonctionnalité sur mesure',
    description:'Il est prêt à payer, mais son besoin ne correspond pas vraiment à ta roadmap.',
    choices:[
      {label:'Accepter le contrat', hint:'Cash immédiat, mais le produit perd un peu de focus.', apply:s=>{s.cash+=900;s.product-=3;s.reputation+=3;}},
      {label:'Refuser et garder le cap', hint:'Pas de cash immédiat, mais le produit progresse plus vite.', apply:s=>{s.product+=7;s.reputation+=1;}}
    ]
  },
  {
    id:'marketing', category:'CROISSANCE', risk:'Risque moyen',
    condition:s=>s.month>=2,
    title:'Tu dois choisir ton niveau d’acquisition',
    description:'Le marketing peut accélérer la croissance, mais il est payé chaque mois jusqu’à ce que tu le modifies.',
    choices:[
      {label:'0 € / mois', hint:'Croissance organique uniquement.', apply:s=>{s.marketing=0;}},
      {label:'300 € / mois', hint:'Acquisition raisonnable et persistante.', apply:s=>{s.marketing=300;}},
      {label:'900 € / mois', hint:'Croissance agressive, dangereuse avec peu de cash.', apply:s=>{s.marketing=900;}}
    ]
  },
  {
    id:'pricing', category:'PRICING', risk:'Risque moyen',
    condition:s=>s.customers>=8,
    title:'Tes premiers clients commencent à payer',
    description:'Tu peux modifier ton prix mensuel. Un prix élevé augmente le revenu par client mais réduit la conversion.',
    choices:[
      {label:'9 € / mois', hint:'Conversion plus facile, revenu par client plus faible.', apply:s=>{s.price=9;s.conversion+=0.018;}},
      {label:'19 € / mois', hint:'Équilibre entre conversion et revenu.', apply:s=>{s.price=19;s.conversion-=0.003;}},
      {label:'39 € / mois', hint:'Positionnement premium, conversion plus difficile.', apply:s=>{s.price=39;s.conversion-=0.018;s.reputation+=2;}}
    ]
  },
  {
    id:'hire', category:'ÉQUIPE', risk:'Risque élevé',
    condition:s=>s.month>=3 && s.team<8,
    title:'Le produit avance trop lentement',
    description:'Recruter améliore durablement le produit et la capacité à supporter la croissance, mais augmente les salaires chaque mois.',
    choices:[
      {label:'Rester seul', hint:'Aucun nouveau coût fixe.', apply:s=>{s.product+=2;}},
      {label:'Recruter 1 personne', hint:'+1 100 € de dépenses mensuelles.', apply:s=>{s.team+=1;s.cash-=700;s.product+=8;}},
      {label:'Recruter 3 personnes', hint:'+3 300 € / mois. Très agressif.', apply:s=>{s.team+=3;s.cash-=1800;s.product+=18;s.reputation+=3;}}
    ]
  },
  {
    id:'investor-seed', category:'INVESTISSEUR', risk:'Dilution',
    condition:s=>s.month>=4 && !s.flags.seed && s.valuation>=12000,
    title:'Un investisseur te propose un seed',
    description:'25 000 € contre 20 % de la société. Ta trésorerie changerait complètement, mais tu ne posséderais plus tout.',
    choices:[
      {label:'Accepter 25 000 € pour 20 %', hint:'Cash massif maintenant, dilution permanente.', apply:s=>{s.cash+=25000;s.equity*=0.8;s.totalRaised+=25000;s.flags.seed=true;s.reputation+=5;}},
      {label:'Refuser', hint:'Tu gardes tes parts et continues avec tes propres revenus.', apply:s=>{s.flags.seed=true;s.reputation+=2;}}
    ]
  },
  {
    id:'infra', category:'INFRA', risk:'Risque élevé',
    condition:s=>s.users>1800*s.infraLevel,
    title:'Tes serveurs approchent de leur limite',
    description:'Ta base utilisateurs grandit plus vite que ton infrastructure. Une panne ferait chuter la réputation et la croissance.',
    choices:[
      {label:'Améliorer l’infrastructure', hint:'Coût immédiat de 1 500 € et +120 € / mois.', apply:s=>{s.cash-=1500;s.infraLevel+=1;s.reputation+=2;}},
      {label:'Prendre le risque', hint:'Tu économises maintenant, mais une panne est possible.', apply:s=>{if(Math.random()<0.55){s.reputation-=16;s.users*=0.86;s.product-=5;}else{s.reputation-=2;}}}
    ]
  },
  {
    id:'viral', category:'VIRAL', risk:'Opportunité',
    condition:s=>s.product>=55 && s.reputation>=50,
    title:'Une vidéo sur ton produit commence à devenir virale',
    description:'Tu peux amplifier le mouvement ou laisser la croissance organique faire son travail.',
    choices:[
      {label:'Amplifier avec 2 000 €', hint:'Plus de portée, mais aucune garantie sur la conversion.', apply:s=>{s.cash-=2000;s.users*=1.55;s.reputation+=5;}},
      {label:'Laisser faire', hint:'Moins explosif mais gratuit.', apply:s=>{s.users*=1.22;s.reputation+=3;}}
    ]
  },
  {
    id:'competitor', category:'CONCURRENCE', risk:'Risque moyen',
    condition:s=>s.users>=2500,
    title:'Un concurrent mieux financé copie tes fonctionnalités',
    description:'Tu dois choisir entre te différencier par le produit ou défendre ton marché avec le prix.',
    choices:[
      {label:'Investir dans le produit', hint:'Coût 2 500 €, amélioration durable du produit.', apply:s=>{s.cash-=2500;s.product+=14;s.reputation+=4;}},
      {label:'Baisser le prix', hint:'Meilleure conversion, mais moins de revenu par client.', apply:s=>{s.price=Math.max(5,s.price*0.75);s.conversion+=0.012;}},
      {label:'Ignorer', hint:'Tu conserves ton cash mais risques de perdre de la croissance.', apply:s=>{s.growth-=0.035;s.reputation-=3;}}
    ]
  },
  {
    id:'enterprise', category:'VENTE', risk:'Risque moyen',
    condition:s=>s.product>=68 && s.team>=2,
    title:'Une entreprise veut signer un gros contrat annuel',
    description:'Le contrat apporte du cash et de la crédibilité, mais l’équipe devra consacrer du temps à ce client.',
    choices:[
      {label:'Signer le contrat', hint:'+12 000 € maintenant, produit légèrement ralenti.', apply:s=>{s.cash+=12000;s.product-=4;s.reputation+=8;}},
      {label:'Rester 100 % self-service', hint:'Pas de cash immédiat, produit plus scalable.', apply:s=>{s.product+=7;s.growth+=0.025;}}
    ]
  },
  {
    id:'series-a', category:'INVESTISSEUR', risk:'Forte dilution',
    condition:s=>s.revenue>=12000 && !s.flags.seriesA,
    title:'Des fonds veulent financer ton accélération',
    description:'300 000 € contre 18 % de la société. Tu pourrais recruter et attaquer le marché beaucoup plus vite.',
    choices:[
      {label:'Lever 300 000 €', hint:'Accélération massive, dilution de 18 %.', apply:s=>{s.cash+=300000;s.equity*=0.82;s.totalRaised+=300000;s.flags.seriesA=true;s.reputation+=7;}},
      {label:'Rester indépendant', hint:'Tu gardes tes parts et finances la croissance avec le revenu.', apply:s=>{s.flags.seriesA=true;s.reputation+=4;}}
    ]
  },
  {
    id:'scale-team', category:'ÉQUIPE', risk:'Coûts fixes',
    condition:s=>s.revenue>=7000 && s.team<15,
    title:'La croissance dépasse les capacités de ton équipe',
    description:'Plus de personnes améliorent le produit et la croissance, mais les salaires peuvent rapidement devenir ton principal risque.',
    choices:[
      {label:'Recruter 2 personnes', hint:'+2 200 € / mois.', apply:s=>{s.team+=2;s.product+=10;s.cash-=1500;}},
      {label:'Recruter 5 personnes', hint:'+5 500 € / mois, forte capacité de croissance.', apply:s=>{s.team+=5;s.product+=22;s.cash-=4000;}},
      {label:'Automatiser', hint:'4 000 € maintenant, pas de salaire supplémentaire.', apply:s=>{s.cash-=4000;s.product+=8;s.growth+=0.015;}}
    ]
  },
  {
    id:'reputation-crisis', category:'CRISE', risk:'Risque élevé',
    condition:s=>s.users>=10000 && s.reputation<62,
    title:'Des utilisateurs se plaignent publiquement',
    description:'La croissance a été plus rapide que la qualité. Tu dois choisir entre réparer profondément ou limiter les dégâts.',
    choices:[
      {label:'Sprint qualité', hint:'3 500 € et croissance ralentie ce mois-ci.', apply:s=>{s.cash-=3500;s.product+=16;s.reputation+=12;s.users*=0.97;}},
      {label:'Communication de crise', hint:'Moins cher mais ne corrige pas le fond.', apply:s=>{s.cash-=700;s.reputation+=5;s.product-=2;}}
    ]
  }
];

function recalcEconomy(){
  state.product=clamp(state.product,5,100);
  state.reputation=clamp(state.reputation,0,100);
  state.conversion=clamp(state.conversion,0.01,0.22);
  state.growth=clamp(state.growth,0.01,0.55);

  const productFactor=0.55+state.product/100;
  const repFactor=0.65+state.reputation/140;
  const teamFactor=1+Math.log2(Math.max(1,state.team))*0.08;
  const marketingUsers=state.marketing>0 ? state.marketing*(0.7+state.reputation/100) : 0;
  const organicGrowth=state.users*state.growth*productFactor*repFactor*teamFactor;
  const churnRate=clamp(0.09-state.product*0.00055-state.reputation*0.00025,0.012,0.10);
  const churn=state.users*churnRate;

  state.users=Math.max(30,Math.round(state.users+organicGrowth+marketingUsers-churn));
  const pricePenalty=Math.max(0.45,1-(state.price-12)*0.012);
  const effectiveConversion=clamp(state.conversion*pricePenalty*(0.7+state.product/125),0.01,0.25);
  state.customers=Math.max(1,Math.round(state.users*effectiveConversion));
  state.revenue=Math.round(state.customers*state.price);

  const salaries=state.team*state.salaryPerPerson;
  const infra=80+state.infraLevel*120+state.users*0.025;
  state.expenses=Math.round(salaries+infra+state.marketing);
  state.profit=state.revenue-state.expenses;
  state.cash+=state.profit;

  const annualRevenue=state.revenue*12;
  const growthPremium=2.2+state.growth*8;
  const qualityPremium=(0.65+state.product/180)*(0.7+state.reputation/200);
  const profitabilityBonus=state.profit>0?1.2:0.85;
  state.valuation=Math.max(1000,Math.round(annualRevenue*growthPremium*qualityPremium*profitabilityBonus+Math.max(0,state.cash)*0.6));
}

function getAvailableEvents(){
  return events.filter(e=>e.condition(state));
}

function pickEvent(){
  const available=getAvailableEvents();
  if(!available.length) return makeRoutineEvent();
  const scored=available.map(e=>({e,score:Math.random()+(state.flags['seen-'+e.id]||0)*0.7})).sort((a,b)=>a.score-b.score);
  const chosen=scored[0].e;
  state.flags['seen-'+chosen.id]=(state.flags['seen-'+chosen.id]||0)+1;
  return chosen;
}

function makeRoutineEvent(){
  return {
    id:'routine-'+state.month, category:'STRATÉGIE', risk:'Décision mensuelle',
    title:'Où concentrer l’effort ce mois-ci ?',
    description:'Pas de crise particulière. Tu peux améliorer le produit, chercher de la croissance ou protéger ta trésorerie.',
    choices:[
      {label:'Produit',hint:'Amélioration durable de la qualité, croissance plus lente immédiatement.',apply:s=>{s.product+=7;s.cash-=350;}},
      {label:'Croissance',hint:'Plus d’utilisateurs, mais acquisition plus coûteuse.',apply:s=>{s.cash-=500;s.users*=1.16;s.reputation-=1;}},
      {label:'Rentabilité',hint:'Réduit légèrement les coûts et améliore la conversion.',apply:s=>{s.salaryPerPerson=Math.max(850,s.salaryPerPerson-35);s.conversion+=0.004;}}
    ]
  };
}

function resetGame(){
  state=JSON.parse(JSON.stringify(START));
  state.history=[];
  state.flags={};
  recalcSnapshotOnly();
  pushHistory();
  $('start-screen').classList.add('hidden');
  $('end-screen').classList.add('hidden');
  $('game-screen').classList.remove('hidden');
  $('feed').innerHTML='';
  addFeed('Mois 1','Tu lances Scale Labs avec 1 000 € et un produit encore fragile.');
  render();
  showEvent();
}

function recalcSnapshotOnly(){
  state.revenue=Math.round(state.customers*state.price);
  state.expenses=Math.round(state.team*state.salaryPerPerson+80+state.infraLevel*120+state.users*0.025+state.marketing);
  state.profit=state.revenue-state.expenses;
  const annual=state.revenue*12;
  state.valuation=Math.max(1000,Math.round(annual*(2.2+state.growth*8)*(0.65+state.product/180)*(0.7+state.reputation/200)*0.85+state.cash*0.6));
}

function choose(choice){
  choice.apply(state);
  state.month+=1;
  recalcEconomy();
  pushHistory();
  addFeed('Mois '+state.month,choice.label+' — '+monthlySummary());
  render();

  if(state.cash<0) return endGame(false,'cash');
  if(state.reputation<=0) return endGame(false,'reputation');
  if(state.month>96) return endGame(false,'time');
  if(state.valuation>=1_000_000_000) return endGame(true,'win');
  setTimeout(showEvent,130);
}

function monthlySummary(){
  const p=state.profit>=0?`+${fmtMoney(state.profit)}`:fmtMoney(state.profit);
  return `${fmt(state.customers)} clients, ${fmtMoney(state.revenue)}/mois, résultat ${p}.`;
}

function showEvent(){
  currentEvent=pickEvent();
  $('event-title').textContent=currentEvent.title;
  $('event-description').textContent=currentEvent.description;
  $('event-category').textContent=currentEvent.category;
  $('event-risk').textContent=currentEvent.risk;
  $('choices').innerHTML='';
  currentEvent.choices.forEach(choice=>{
    const btn=document.createElement('button');
    btn.className='choice-btn';
    btn.innerHTML=`<strong>${choice.label}</strong><span>${choice.hint}</span>`;
    btn.addEventListener('click',()=>choose(choice));
    $('choices').appendChild(btn);
  });
}

function pushHistory(){
  state.history.push({month:state.month,cash:Math.round(state.cash),valuation:Math.round(state.valuation),revenue:Math.round(state.revenue)});
}

function render(){
  $('cash').textContent=fmtMoney(state.cash);
  $('revenue').textContent=fmtMoney(state.revenue);
  $('expenses').textContent=fmtMoney(state.expenses);
  $('valuation').textContent=fmtMoney(state.valuation);
  $('users').textContent=fmt(state.users);
  $('customers').textContent=fmt(state.customers);
  $('team').textContent=fmt(state.team);
  $('equity').textContent=(state.equity*100).toFixed(1)+' %';
  $('price').textContent=fmtMoney(state.price)+'/mois';
  $('conversion').textContent=(state.customers/state.users*100).toFixed(1)+' %';
  $('reputation').textContent=Math.round(state.reputation)+'/100';
  $('product').textContent=Math.round(state.product)+'/100';
  $('growth').textContent=(state.growth*100).toFixed(1)+' %';
  $('month-label').textContent='Mois '+state.month;
  $('cash').className=state.cash<state.expenses?'negative':'';
  $('revenue').className=state.profit>=0?'positive':'';
  drawChart();
}

function drawChart(){
  const canvas=$('history-chart');
  const dpr=window.devicePixelRatio||1;
  const rect=canvas.getBoundingClientRect();
  const width=Math.max(300,rect.width||900),height=260;
  canvas.width=width*dpr;canvas.height=height*dpr;
  const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);
  ctx.clearRect(0,0,width,height);
  const pad={l:52,r:16,t:18,b:30};
  const w=width-pad.l-pad.r,h=height-pad.t-pad.b;
  const hist=state.history;
  if(hist.length<1)return;
  const values=hist.flatMap(p=>[Math.max(0,p.valuation),Math.max(0,p.cash)]);
  const max=Math.max(1000,...values)*1.08;
  ctx.strokeStyle='rgba(143,155,170,.18)';ctx.lineWidth=1;
  ctx.fillStyle='#8f9baa';ctx.font='11px system-ui';
  for(let i=0;i<=4;i++){
    const y=pad.t+h*i/4;
    ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(width-pad.r,y);ctx.stroke();
    const val=max*(1-i/4);
    ctx.fillText(compactMoney(val),4,y+4);
  }
  const plot=(key,color)=>{
    ctx.strokeStyle=color;ctx.lineWidth=2.5;ctx.beginPath();
    hist.forEach((p,i)=>{
      const x=pad.l+(hist.length===1?w/2:i*w/Math.max(1,hist.length-1));
      const y=pad.t+h-(Math.max(0,p[key])/max)*h;
      i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    });ctx.stroke();
  };
  plot('valuation','#77f29c');plot('cash','#79a8ff');
  ctx.fillStyle='#8f9baa';ctx.fillText('M1',pad.l,height-8);ctx.textAlign='right';ctx.fillText('M'+state.month,width-pad.r,height-8);ctx.textAlign='left';
}

function compactMoney(n){
  if(n>=1e9)return (n/1e9).toFixed(1)+' Md€';
  if(n>=1e6)return (n/1e6).toFixed(1)+' M€';
  if(n>=1e3)return (n/1e3).toFixed(0)+' k€';
  return Math.round(n)+' €';
}

function addFeed(label,text){
  const item=document.createElement('div');item.className='feed-item';
  item.innerHTML=`<b>${label}</b><span>${text}</span>`;$('feed').prepend(item);
}

function endGame(won,reason){
  $('game-screen').classList.add('hidden');$('end-screen').classList.remove('hidden');
  const worth=state.valuation*state.equity;
  $('end-kicker').textContent=won?'UNICORNE':'FIN DE RUN';
  $('end-title').textContent=won?'Ta startup vaut 1 milliard.':'La startup n’a pas survécu.';
  const reasons={cash:'Ta trésorerie est passée sous zéro. Les coûts fixes ont gagné.',reputation:'Ta réputation est tombée à zéro.',time:'Après 8 ans, tu n’as pas atteint le milliard. La partie est terminée.'};
  $('end-copy').textContent=won?`Tu possèdes encore ${(state.equity*100).toFixed(1)} % de la société. La valeur théorique de ta part est ${fmtMoney(worth)}.`:reasons[reason];
  $('end-valuation').textContent=fmtMoney(state.valuation);
  $('end-equity').textContent=(state.equity*100).toFixed(1)+' %';
  $('end-worth').textContent=fmtMoney(worth);
  $('end-revenue').textContent=fmtMoney(state.revenue);
}

$('start-btn').addEventListener('click',resetGame);
$('restart-btn').addEventListener('click',resetGame);
$('play-again-btn').addEventListener('click',resetGame);
window.addEventListener('resize',()=>{if(state.history?.length)drawChart();});