(function(){
  const VERSION='V0.6.1';

  function runwayMonths(){
    const burn=Math.max(1,state.expenses-state.revenue);
    if(state.profit>=0)return 99;
    return Math.max(0,state.cash/burn);
  }

  const oldVweight=typeof vweight==='function'?vweight:null;
  if(oldVweight){
    vweight=function(domain){
      let w=oldVweight(domain);
      const run=runwayMonths();
      if(state.revenue<500&&domain==='SALES')w+=5;
      if(state.revenue<500&&domain==='FINANCE')w+=3;
      if((state.revenue<450||state.cash<2500)&&domain==='TEAM')w*=0.2;
      if(run<4&&domain==='FINANCE')w+=4;
      if(run<4&&domain==='MARKETING')w*=0.65;
      return Math.max(.05,w);
    };
  }

  choose=function(choice){
    const cost=chooseCost(choice);
    if(cost>0&&cost>Math.max(0,state.cash))return;
    if(choice.quit){
      pendingEnd={won:false,reason:'cash'};
      return renderFeedback(choice,'Tu choisis de fermer la société.',snapshot());
    }
    const before=snapshot();
    const outcome=choice.apply(state)||'La décision est appliquée.';
    state.month++;
    recalcEconomy();
    pushHistory();
    addFeed('Mois '+state.month,`${choice.label} — ${monthlySummary()}`);
    render();
    pendingEnd=detectEnd();
    renderFeedback(choice,outcome,before);
  };

  renderCurrentEvent=function(){
    const e=currentEvent;
    $('event-title').textContent=e.title;
    $('event-description').textContent=e.description;
    $('event-category').textContent=e.category;
    $('event-risk').textContent=`Risque ${e.risk} · ${Math.min(state.flags?.seenCount||0,100)}/100 vues`;
    $('choices').innerHTML='';
    e.choices.forEach(c=>{
      const btn=document.createElement('button');
      btn.className='choice-btn';
      const cost=chooseCost(c);
      let blocked=cost>0&&cost>Math.max(0,state.cash);
      let warning='';
      if(e.category==='TEAM'&&c.label&&/recrut/i.test(c.label)){
        const afterCash=state.cash-cost;
        const projectedMonthly=Math.max(1,state.expenses+state.salaryPerEmployee-state.revenue);
        const projectedRunway=afterCash/projectedMonthly;
        if(projectedRunway<2.5)warning=' · ⚠ runway très faible après ce recrutement';
      }
      btn.disabled=blocked;
      if(blocked)btn.style.opacity='.45';
      btn.innerHTML=`<strong>${c.label}</strong><span>${c.hint}${warning}${blocked?' · Cash insuffisant':''}</span>`;
      btn.addEventListener('click',()=>choose(c));
      $('choices').appendChild(btn);
    });
  };

  const oldResetGame=resetGame;
  resetGame=function(){
    oldResetGame();
    state.salaryPerEmployee=state.month<12?800:1100;
    recalcSnapshotOnly();
    render();
  };

  const oldRecalcEconomy=recalcEconomy;
  recalcEconomy=function(){
    if(state.month<=12&&state.employees>0)state.salaryPerEmployee=800;
    else if(state.month<=24&&state.employees>0)state.salaryPerEmployee=950;
    else state.salaryPerEmployee=1100;
    oldRecalcEconomy();
  };

  queueMicrotask(()=>{
    document.title='Scale Up — '+VERSION;
    const badge=document.querySelector('.hero h1')?.nextElementSibling;
    if(badge)badge.textContent=VERSION;
    const p=document.querySelector('#start-screen p:not(.kicker)');
    if(p)p.textContent='500 scénarios générés selon ta situation. La V0.6.1 corrige le financement d’urgence et adoucit le début de partie sans supprimer le risque.';
    console.info('Scale Up '+VERSION+' — emergency fix + early game rebalance');
  });
})();