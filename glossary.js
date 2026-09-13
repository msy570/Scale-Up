(function(){
'use strict';
const VERSION='V0.9.6';
const TERMS={
  'runway':{title:'Runway',def:'Le nombre de mois pendant lesquels ton entreprise peut encore fonctionner avec son cash actuel si elle perd de l’argent. Si elle gagne au moins autant qu’elle dépense, le runway est considéré comme illimité : ∞ mois.'},
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
function makeInfo(term){const info=TERMS[term];if(!info)return null;const b=document.createElement('button');b.type='button';b.className='info-dot';b.setAttribute('aria-label',`Définition : ${info.title}`);b.setAttribute('aria-expanded','false');b.innerHTML=`<span aria-hidden="true">i</span><span class="info-tooltip" role="tooltip"><strong>${info.title}</strong>${info.def}</span>`;b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const open=b.classList.toggle('is-open');b.setAttribute('aria-expanded',String(open));document.querySelectorAll('.info-dot.is-open').forEach(x=>{if(x!==b){x.classList.remove('is-open');x.setAttribute('aria-expanded','false')}})});return b;}
function decorateLabels(root=document){root.querySelectorAll('.stat-card > span,.economy-strip span,.result-grid span,.progress-card span,.v09-world-card > span,.analysis-summary span').forEach(el=>{if(el.querySelector('.info-dot'))return;const key=normalize(el.textContent),term=TERMS[key]?key:(key==='croissance valo (1 mois)'?'croissance valo (1 mois)':null);if(term){const b=makeInfo(term);if(b)el.append(' ',b)}});}
function decorateInline(root=document){const selector='#event-description,.choice-btn span,.decision-feedback p,.config-preview,.review-choice,.analysis-item p,.share-note';root.querySelectorAll(selector).forEach(container=>{const walker=document.createTreeWalker(container,NodeFilter.SHOW_TEXT),nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);nodes.forEach(node=>{if(!node.parentElement||node.parentElement.closest('.glossary-term,.info-dot'))return;const raw=node.nodeValue;if(!raw||!INLINE_KEYS.some(k=>raw.toLowerCase().includes(k)))return;const re=new RegExp(`\\b(${INLINE_KEYS.sort((a,b)=>b.length-a.length).map(k=>k.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')).join('|')})\\b`,'gi');let last=0,m,frag=document.createDocumentFragment(),changed=false;while((m=re.exec(raw))){const before=raw.slice(last,m.index);if(before)frag.append(before);const key=normalize(m[0]),wrap=document.createElement('span');wrap.className='glossary-term';wrap.append(m[0]);const b=makeInfo(key);if(b)wrap.append(' ',b);frag.append(wrap);last=m.index+m[0].length;changed=true;}if(changed){if(last<raw.length)frag.append(raw.slice(last));node.replaceWith(frag)}});});}

const CLEAR_TITLES={
'partenaire qui veut revendre ton offre':'Une entreprise veut revendre ton produit',
'gros prospect qui exige une remise':'Un gros client veut une forte remise',
'essai gratuit très long':'Un prospect veut tester gratuitement plus longtemps',
'contrat annuel payé d’avance':'Un client propose de payer un an d’avance',
'prospect étranger prêt à signer':'Un client étranger veut acheter ton offre',
'client qui demande une exclusivité':'Un gros client veut une exclusivité',
'personnalisation lourde pour un grand compte':'Un gros client veut une version faite sur mesure',
'client stratégique tenté par un rival':'Un client important pense partir chez un concurrent',
'offre devenue trop complexe':'Ton offre devient trop compliquée',
'fonction clé très demandée':'Tes clients réclament la même nouveauté',
'parcours client trop long':'Les clients abandonnent avant d’acheter',
'bugs après une mise à jour':'Une mise à jour provoque des problèmes',
'offre gratuite trop généreuse':'Trop de clients utilisent gratuitement ton offre',
'publicités devenues trop chères':'Tes publicités coûtent de plus en plus cher',
'campagne qui devient virale':'Une campagne commence à devenir virale',
'créateur qui parle de toi':'Un créateur de contenu veut parler de ton entreprise',
'profil senior disponible':'Un profil expérimenté est prêt à te rejoindre',
'support client débordé':'Ton équipe n’arrive plus à répondre aux clients',
'investisseur qui veut entrer':'Un investisseur veut financer ton entreprise',
'banque qui propose un financement':'Une banque te propose un prêt',
'clients qui paient en retard':'Plusieurs clients te paient en retard',
'concurrent qui copie ton offre':'Un concurrent copie une partie de ton offre',
'rival qui baisse ses prix':'Un concurrent casse ses prix',
'acteur étranger qui arrive':'Un concurrent étranger arrive sur ton marché',
'nouvel entrant gratuit':'Un concurrent lance une offre gratuite',
'paiements qui échouent':'Des clients n’arrivent plus à payer',
'système lent aux heures de pointe':'Ton service ralentit quand il y a beaucoup de monde',
'avis négatif très visible':'Un avis négatif devient très visible',
'client mécontent très visible':'Un gros client se plaint publiquement',
'hausse de prix mal reçue':'Ta hausse de prix provoque des réactions négatives',
'conformité qui bloque une vente':'Un problème juridique bloque un contrat',
'niche qui convertit deux fois mieux':'Un type de client achète beaucoup plus que les autres',
'nouveau pays avec traction':'Des clients arrivent spontanément d’un nouveau pays',
'délais qui s’allongent':'Tes délais deviennent trop longs',
'erreurs manuelles répétées':'Ton équipe répète les mêmes erreurs',
'clients qui demandent plus de support':'Les clients demandent beaucoup plus d’aide',
'hausse des annulations':'De plus en plus de clients partent',
'demandes de remboursement':'Les demandes de remboursement augmentent',
'fournisseur principal qui augmente ses prix':'Ton fournisseur principal augmente ses prix',
'rupture de stock ou de capacité':'Tu risques de ne plus pouvoir servir certains clients',
'nouveau fournisseur moins cher':'Un nouveau fournisseur propose des prix plus bas',
'partenaire logistique en retard':'Ton partenaire de livraison accumule les retards',
'deuxième implantation possible':'Tu peux ouvrir un deuxième point de vente',
'franchise proposée':'Quelqu’un veut ouvrir une franchise avec ta marque',
'acquisition d’un petit concurrent':'Tu peux racheter un petit concurrent',
'grand distributeur intéressé':'Un grand distributeur veut vendre ton offre'
};
const CLEAR_DESC={
PRODUCT:'Un problème concret touche ton produit ou ton offre. Tu peux investir pour le régler, faire un petit test ou attendre.',
SALES:'Une vente importante est possible, mais les conditions proposées ne sont pas parfaites. Tu peux accepter, négocier ou refuser.',
MARKETING:'Une occasion d’attirer de nouveaux clients apparaît. Tu peux investir davantage, faire un petit test ou ne rien changer.',
TEAM:'Ton équipe atteint une limite. Tu peux recruter, prendre une aide temporaire ou continuer avec l’équipe actuelle.',
FINANCE:'Tu dois choisir comment financer la suite : faire entrer un investisseur, emprunter ou réduire les dépenses.',
COMPETITION:'Un concurrent met plus de pression sur ton activité. Tu peux réagir fortement, adapter ton offre ou garder ta stratégie actuelle.',
INFRA:'Un problème technique peut ralentir ou bloquer ton activité. Tu peux le corriger maintenant, faire une amélioration limitée ou attendre.',
REPUTATION:'L’image de ton entreprise est en jeu. Tu peux répondre publiquement, régler le problème directement ou attendre que la situation retombe.',
LEGAL:'Un point juridique demande une décision. Tu peux tout mettre en règle, corriger seulement l’urgence ou reporter.',
STRATEGY:'Une nouvelle direction semble prometteuse. Tu peux miser dessus, la tester à petite échelle ou continuer comme avant.',
OPERATIONS:'Ton organisation interne te fait perdre du temps ou de l’argent. Tu peux revoir le fonctionnement, corriger le principal problème ou continuer ainsi.',
CUSTOMER:'Le comportement de tes clients change. Tu peux traiter le problème à fond, faire une correction ciblée ou attendre davantage de preuves.',
SUPPLY:'Un problème de fournisseur, de stock ou de livraison menace ton activité. Tu peux sécuriser une solution, tester une deuxième option ou ne rien changer.',
EXPANSION:'Une occasion de grandir apparaît. Tu peux te lancer maintenant, tester à petite échelle ou attendre.'
};
const CHOICE_LABELS={PRODUCT:['Corriger complètement','Tester une amélioration limitée','Attendre encore'],SALES:['Accepter avec des limites','Négocier de meilleures conditions','Refuser'],MARKETING:['Investir davantage','Tester avec un petit budget','Ne pas investir pour l’instant'],TEAM:['Renforcer l’équipe maintenant','Prendre une aide temporaire','Faire avec l’équipe actuelle'],FINANCE:['Lever des fonds','Emprunter','Réduire les dépenses'],COMPETITION:['Réagir fortement','Adapter ton offre','Ne pas changer de stratégie'],INFRA:['Corriger le problème maintenant','Faire une amélioration ciblée','Attendre'],REPUTATION:['Répondre publiquement','Régler le problème directement','Ne pas répondre'],LEGAL:['Tout mettre en règle','Corriger seulement le point urgent','Reporter'],STRATEGY:['Miser sur cette piste','Faire un test limité','Continuer comme avant'],OPERATIONS:['Revoir le fonctionnement','Corriger le principal problème','Continuer comme aujourd’hui'],CUSTOMER:['Traiter le problème à fond','Faire une correction ciblée','Attendre davantage'],SUPPLY:['Sécuriser une solution maintenant','Tester une deuxième option','Ne rien changer'],EXPANSION:['Se lancer maintenant','Tester à petite échelle','Attendre avant de grandir']};
function clearStats(){const cash=fmtMoney(Math.round(state.cash||0)),rev=fmtMoney(Math.round(state.revenue||0)),exp=fmtMoney(Math.round(state.expenses||0)),burn=Math.max(0,(state.expenses||0)-(state.revenue||0));const situation=burn>0?`${Math.max(0,(state.cash||0)/burn).toFixed(1)} mois de trésorerie au rythme actuel`:'activité rentable ce mois-ci';return `Situation actuelle : ${cash} de cash, ${rev} de chiffre d’affaires par mois, ${exp} de dépenses par mois, ${situation}.`;}
function rewriteEvent(e){if(!e||typeof e.id!=='string'||!e.id.startsWith('v08-'))return e;const original=normalize(e.title),cat=e.category||'STRATEGY';if(CLEAR_TITLES[original])e.title=CLEAR_TITLES[original];const intro=CLEAR_DESC[cat]||'Une décision importante se présente.';e.description=`${intro} ${clearStats()}`;const labels=CHOICE_LABELS[cat];if(labels&&Array.isArray(e.choices))e.choices.forEach((c,i)=>{if(labels[i])c.label=labels[i];});return e;}
const oldPickForLanguage=pickEvent;pickEvent=function(){return rewriteEvent(oldPickForLanguage())};

let scheduled=false;function refresh(){scheduled=false;decorateLabels();decorateInline();}
const observer=new MutationObserver(()=>{if(!scheduled){scheduled=true;requestAnimationFrame(refresh)}});
queueMicrotask(()=>{document.title='Scale Up — '+VERSION;const badge=document.querySelector('.hero h1')?.nextElementSibling;if(badge)badge.textContent=VERSION;refresh();observer.observe(document.body,{childList:true,subtree:true,characterData:true});document.addEventListener('click',e=>{if(!e.target.closest('.info-dot'))document.querySelectorAll('.info-dot.is-open').forEach(x=>{x.classList.remove('is-open');x.setAttribute('aria-expanded','false')})});document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.info-dot.is-open').forEach(x=>{x.classList.remove('is-open');x.setAttribute('aria-expanded','false')})});console.info('Scale Up '+VERSION+' — glossaire et événements simplifiés');});
})();