(function(){
'use strict';
const VERSION='V0.9.4';
const TERMS={
  'runway':{title:'Runway',def:'Le nombre de mois pendant lesquels ton entreprise peut encore fonctionner avec son cash actuel si elle continue à perdre de l’argent au même rythme.'},
  'valorisation':{title:'Valorisation',def:'La valeur estimée de toute l’entreprise. Ce n’est pas l’argent disponible sur le compte bancaire.'},
  'dilution':{title:'Dilution',def:'La baisse de ton pourcentage de propriété quand de nouvelles parts sont données ou vendues à des investisseurs.'},
  'burn':{title:'Burn',def:'L’argent que l’entreprise perd chaque mois quand ses dépenses sont supérieures à ses revenus.'},
  'burn rate':{title:'Burn rate',def:'La vitesse à laquelle l’entreprise consomme son cash chaque mois.'},
  'conversion':{title:'Conversion',def:'Le pourcentage de personnes qui deviennent réellement clientes parmi celles qui découvrent ou utilisent ton offre.'},
  'marge nette':{title:'Marge nette',def:'La part du chiffre d’affaires qui reste réellement en bénéfice après toutes les dépenses.'},
  'cac':{title:'CAC',def:'Coût d’acquisition client : combien tu dépenses en moyenne pour obtenir un nouveau client.'},
  'churn':{title:'Churn',def:'Le pourcentage de clients qui arrêtent d’acheter ou se désabonnent sur une période donnée.'},
  'equity':{title:'Equity',def:'Ta part de propriété dans l’entreprise. 100 % signifie que tu possèdes toute la société.'},
  'ta part':{title:'Ta part',def:'Le pourcentage de l’entreprise que tu possèdes encore. Une levée de fonds peut le faire baisser par dilution.'},
  'valeur de ta part':{title:'Valeur de ta part',def:'La valeur théorique de ce que tu possèdes : valorisation de l’entreprise × ton pourcentage de propriété.'},
  'dette / ca annuel':{title:'Dette / CA annuel',def:'Compare ta dette à ton chiffre d’affaires sur un an. Plus ce ratio est élevé, plus la dette pèse lourd par rapport à l’activité.'},
  'croissance ca (1 mois)':{title:'Croissance du CA',def:'La variation réelle du chiffre d’affaires par rapport au mois précédent.'},
  'croissance valo (1 mois)':{title:'Croissance de la valorisation',def:'La variation de la valeur estimée de l’entreprise par rapport au mois précédent.'},
  'valo depuis départ':{title:'Valorisation depuis le départ',def:'La progression totale de la valeur estimée de l’entreprise depuis le début de la partie.'},
  'résultat / mois':{title:'Résultat mensuel',def:'Revenus du mois moins toutes les dépenses du mois. Positif = bénéfice, négatif = perte.'},
  'dette':{title:'Dette',def:'L’argent emprunté que l’entreprise devra rembourser, en plus des intérêts éventuels.'},
  'pré-money':{title:'Pré-money',def:'La valorisation de l’entreprise juste avant qu’un investisseur injecte de l’argent.'},
  'post-money':{title:'Post-money',def:'La valorisation juste après l’investissement : valorisation pré-money + argent investi.'},
  'roi':{title:'ROI',def:'Retour sur investissement : ce que rapporte une dépense ou un investissement par rapport à son coût.'}
};
const INLINE_KEYS=['runway','dilution','burn rate','burn','cac','churn','equity','pré-money','post-money','roi'];
const normalize=s=>(s||'').trim().toLowerCase().replace(/\s+/g,' ');
function makeInfo(term){
  const info=TERMS[term];if(!info)return null;
  const b=document.createElement('button');b.type='button';b.className='info-dot';b.setAttribute('aria-label',`Définition : ${info.title}`);b.setAttribute('aria-expanded','false');
  b.innerHTML=`<span aria-hidden="true">i</span><span class="info-tooltip" role="tooltip"><strong>${info.title}</strong>${info.def}</span>`;
  b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const open=b.classList.toggle('is-open');b.setAttribute('aria-expanded',String(open));document.querySelectorAll('.info-dot.is-open').forEach(x=>{if(x!==b){x.classList.remove('is-open');x.setAttribute('aria-expanded','false')}})});
  return b;
}
function decorateLabels(root=document){
  root.querySelectorAll('.stat-card > span,.economy-strip span,.result-grid span,.progress-card span,.v09-world-card > span,.analysis-summary span').forEach(el=>{
    if(el.querySelector('.info-dot'))return;
    const key=normalize(el.textContent),term=TERMS[key]?key:(key==='croissance valo (1 mois)'?'croissance valo (1 mois)':null);
    if(term){const b=makeInfo(term);if(b)el.append(' ',b)}
  });
}
function decorateInline(root=document){
  const selector='#event-description,.choice-btn span,.decision-feedback p,.config-preview,.review-choice,.analysis-item p,.share-note';
  root.querySelectorAll(selector).forEach(container=>{
    const walker=document.createTreeWalker(container,NodeFilter.SHOW_TEXT);
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(node=>{
      if(!node.parentElement||node.parentElement.closest('.glossary-term,.info-dot'))return;
      const raw=node.nodeValue;if(!raw||!INLINE_KEYS.some(k=>raw.toLowerCase().includes(k)))return;
      const re=new RegExp(`\\b(${INLINE_KEYS.sort((a,b)=>b.length-a.length).map(k=>k.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')).join('|')})\\b`,'gi');
      let last=0,m,frag=document.createDocumentFragment(),changed=false;
      while((m=re.exec(raw))){const before=raw.slice(last,m.index);if(before)frag.append(before);const key=normalize(m[0]);const wrap=document.createElement('span');wrap.className='glossary-term';wrap.append(m[0]);const b=makeInfo(key);if(b)wrap.append(' ',b);frag.append(wrap);last=m.index+m[0].length;changed=true;}
      if(changed){if(last<raw.length)frag.append(raw.slice(last));node.replaceWith(frag)}
    });
  });
}
let scheduled=false;function refresh(){scheduled=false;decorateLabels();decorateInline();}
const observer=new MutationObserver(()=>{if(!scheduled){scheduled=true;requestAnimationFrame(refresh)}});
queueMicrotask(()=>{
  document.title='Scale Up — '+VERSION;const badge=document.querySelector('.hero h1')?.nextElementSibling;if(badge)badge.textContent=VERSION;
  refresh();observer.observe(document.body,{childList:true,subtree:true,characterData:true});
  document.addEventListener('click',e=>{if(!e.target.closest('.info-dot'))document.querySelectorAll('.info-dot.is-open').forEach(x=>{x.classList.remove('is-open');x.setAttribute('aria-expanded','false')})});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.info-dot.is-open').forEach(x=>{x.classList.remove('is-open');x.setAttribute('aria-expanded','false')})});
  console.info('Scale Up '+VERSION+' — glossaire interactif activé');
});
})();