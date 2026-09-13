(function(){
'use strict';
const VERSION='V0.9.6';
const SIMPLE={
PRODUCT:{
'offre devenue trop complexe':['Ton offre devient trop compliquée','Des clients disent qu’ils ne comprennent plus clairement ce que tu vends. Trop d’options et de fonctionnalités compliquent l’achat.'],
'fonction clé très demandée':['Tes clients réclament la même nouveauté','Plusieurs clients demandent la même fonctionnalité. La développer peut améliorer les ventes, mais elle prendra du temps et de l’argent.'],
'parcours client trop long':['Les clients abandonnent avant d’acheter','Il faut trop d’étapes pour passer de la découverte à l’achat. Une partie des clients abandonne avant de payer.'],
'bugs après une mise à jour':['Une mise à jour provoque des problèmes','Depuis la dernière modification de ton produit, plusieurs clients rencontrent des bugs. Il faut décider jusqu’où investir pour les corriger.'],
'innovation devenue attendue':['Les clients attendent une amélioration importante','Une nouveauté qui était autrefois facultative devient maintenant attendue par le marché. Sans elle, ton offre risque de paraître dépassée.'],
'offre gratuite trop généreuse':['Trop de clients utilisent gratuitement ton offre','La version gratuite satisfait tellement de personnes que peu passent à l’offre payante. Il faut décider si tu réduis ce qui est offert gratuitement.'],
'dette produit qui ralentit tout':['Les anciens choix techniques te ralentissent','Des solutions rapides prises plus tôt rendent chaque nouvelle amélioration plus lente et plus risquée.'],
'expérience mobile insuffisante':['Ton expérience mobile fait perdre des clients','Une part croissante de tes visiteurs utilise un téléphone, mais l’expérience y est moins bonne et réduit les ventes.']},
SALES:{
'gros prospect qui exige une remise':['Un gros client veut une forte remise','Un prospect important est prêt à signer, mais seulement si tu baisses fortement ton prix. Le contrat apporterait du revenu, mais réduirait ta marge.'],
'essai gratuit très long':['Un prospect veut tester gratuitement plus longtemps','Un client potentiel demande une longue période d’essai avant de payer. Tu peux accepter, négocier une durée plus courte ou refuser.'],
'contrat annuel payé d’avance':['Un client propose de payer un an d’avance','Un client veut s’engager pour douze mois et payer immédiatement, en échange d’une réduction. Cela améliorerait fortement ta trésorerie.'],
'prospect étranger prêt à signer':['Un client étranger veut acheter ton offre','Une entreprise située à l’étranger est prête à signer. Le contrat peut ouvrir un nouveau marché, mais ajoute de la complexité.'],
'client qui demande une exclusivité':['Un gros client veut être le seul à profiter de ton offre','Un client important demande une exclusivité. Il paierait davantage, mais tu ne pourrais plus vendre la même offre à certains concurrents.'],
'personnalisation lourde pour un grand compte':['Un gros client veut une version faite sur mesure','Un grand compte est prêt à payer, mais demande beaucoup de modifications spécifiques qui pourraient détourner ton équipe du produit principal.'],
'partenaire qui veut revendre ton offre':['Une entreprise veut revendre ton produit','Une entreprise te propose de vendre ton produit à ses propres clients. Elle apporterait de nouvelles ventes, mais veut garder une commission sur chaque vente.'],
'client stratégique tenté par un rival':['Un client important pense partir chez un concurrent','Un de tes meilleurs clients compare sérieusement ton offre avec celle d’un concurrent. Tu dois décider jusqu’où aller pour le garder.']},
MARKETING:{
'publicités devenues trop chères':['Tes publicités coûtent de plus en plus cher','Le prix des publicités augmente et chaque nouveau client te coûte davantage. Continuer sans changement risque de réduire fortement ta marge.'],
'campagne qui devient virale':['Une campagne commence à devenir virale','Une publication attire soudainement beaucoup plus de monde que prévu. Tu peux investir pour profiter du pic ou rester prudent.'],
'créateur qui parle de toi':['Un créateur de contenu veut parler de ton entreprise','Une personne suivie par ton public propose de présenter ton offre. Cela peut apporter beaucoup de visibilité, mais sans garantie de ventes.'],
'article seo qui décolle':['Un article attire soudainement beaucoup de visiteurs','Une page de ton site remonte fortement dans les recherches et commence à attirer gratuitement de nouveaux visiteurs.'],
'newsletter très ciblée':['Une campagne e-mail semble très prometteuse','Tu as identifié une liste de prospects très proches de tes meilleurs clients. Une campagne ciblée pourrait générer rapidement des ventes.'],
'salon professionnel imminent':['Un salon professionnel approche','Un événement fréquenté par de nombreux clients potentiels a lieu bientôt. Participer coûte cher, mais peut générer des contrats.'],
'programme de parrainage demandé':['Tes clients veulent pouvoir te recommander','Plusieurs clients demandent un système de parrainage. Récompenser les recommandations peut accélérer l’acquisition.'],
'canal social qui convertit mieux que prévu':['Un réseau social t’apporte de bons clients','Un canal social génère soudainement des clients à un coût inférieur aux autres. Tu dois décider si tu augmentes rapidement le budget.']},
TEAM:{
'profil senior disponible':['Un profil expérimenté est prêt à te rejoindre','Une personne très expérimentée est disponible. Son salaire est élevé, mais elle pourrait résoudre plusieurs problèmes plus vite.'],
'commercial expérimenté intéressé':['Un bon commercial veut rejoindre ton équipe','Un commercial expérimenté pense pouvoir accélérer tes ventes. L’embauche augmente cependant tes coûts fixes chaque mois.'],
'support client débordé':['Ton équipe n’arrive plus à répondre aux clients','Les demandes clients s’accumulent et les temps de réponse augmentent. La satisfaction commence à en souffrir.'],
'cofondateur potentiel':['Quelqu’un veut devenir ton associé','Une personne complémentaire veut s’impliquer fortement dans l’entreprise. Elle demande en échange une vraie place dans les décisions.'],
'freelance expert disponible':['Un expert indépendant peut t’aider immédiatement','Un spécialiste peut intervenir rapidement sur un problème précis sans devenir salarié. La mission reste toutefois coûteuse.'],
'manager externe proposé':['Tu peux recruter un manager expérimenté','L’équipe grandit et tu passes de plus en plus de temps à organiser le travail. Un manager pourrait reprendre une partie de cette charge.'],
'salarié performant qui demande une hausse':['Un excellent salarié demande une augmentation','Une personne importante de l’équipe estime que son salaire ne reflète plus sa contribution. La perdre pourrait coûter cher.'],
'départ inattendu dans l’équipe':['Une personne importante quitte l’entreprise','Un membre clé annonce son départ. Il faut choisir entre recruter vite, répartir son travail ou ralentir temporairement.']},
FINANCE:{
'investisseur qui veut entrer':['Un investisseur veut financer ton entreprise','Un investisseur propose d’injecter de l’argent en échange d’une part de la société. Cela augmente ton cash mais réduit ton pourcentage de propriété.'],
'banque qui propose un financement':['Une banque te propose un prêt','Tu peux obtenir de l’argent sans céder de parts, mais tu devras rembourser le prêt avec des intérêts.'],
'fonds qui te contacte':['Un fonds d’investissement veut te rencontrer','Un fonds pense que ton entreprise peut grandir rapidement. Il propose du capital, mais attendra une forte croissance en retour.'],
'bridge possible en urgence':['Tu peux obtenir un financement d’urgence','Ta trésorerie devient tendue. Un financement court terme peut te donner quelques mois de plus, mais les conditions sont moins favorables.'],
'aide publique accessible':['Ton entreprise peut recevoir une aide publique','Tu es éligible à une aide financière. Le dossier prend du temps, mais l’argent reçu ne diluerait pas ta part.'],
'clients qui paient en retard':['Plusieurs clients te paient en retard','Les ventes existent, mais l’argent arrive trop lentement sur ton compte. Cela crée un problème de trésorerie malgré un chiffre d’affaires correct.'],
'grosse échéance qui arrive':['Une grosse facture doit être payée bientôt','Une dépense importante arrive dans peu de temps. Il faut t’assurer que ta trésorerie pourra l’absorber.'],
'levée plus grosse mais plus dilutive':['On te propose plus d’argent contre plus de parts','Tu peux lever davantage de capital que prévu, mais tu devras céder une part plus importante de l’entreprise.']},
COMPETITION:{
'concurrent qui copie ton offre':['Un concurrent copie une partie de ton offre','Une entreprise concurrente vient de lancer une proposition très proche de la tienne. Certains clients commencent à comparer les deux.'],
'rival qui baisse ses prix':['Un concurrent casse ses prix','Un rival vient de réduire fortement ses tarifs. Tu dois décider si tu réponds sur le prix ou si tu défends ta différence.'],
'startup financée qui attaque ta niche':['Une startup bien financée arrive sur ton marché','Un nouvel acteur dispose de beaucoup de capital et vise exactement tes clients. Il peut dépenser davantage que toi pour grandir vite.'],
'acteur étranger qui arrive':['Un concurrent étranger arrive sur ton marché','Une entreprise étrangère commence à vendre dans ta zone. Elle apporte une nouvelle pression sur les prix et la visibilité.'],
'nouvel entrant gratuit':['Un concurrent lance une offre gratuite','Un nouvel acteur propose gratuitement une partie de ce que tu factures aujourd’hui. Tes clients commencent à se poser des questions.'],
'grand groupe qui lance une offre proche':['Un grand groupe lance une offre concurrente','Une entreprise beaucoup plus grande arrive avec une offre proche et une marque déjà connue.'],
'comparatif public défavorable':['Un comparatif place ton concurrent devant toi','Un site visible compare plusieurs offres et te classe derrière un rival. Cela peut influencer de futurs clients.'],
'rival qui débauche un client':['Un concurrent essaie de récupérer un de tes gros clients','Un rival propose de meilleures conditions à un client important. Tu dois choisir entre défendre le compte ou laisser partir un client peu rentable.']},
INFRA:{
'capacité qui approche de la limite':['Ton système approche de sa limite','La croissance augmente la charge sur tes outils et ton infrastructure. Une nouvelle hausse d’activité pourrait provoquer des ralentissements.'],
'fournisseur technique qui augmente ses tarifs':['Un fournisseur technique augmente fortement ses prix','Un service indispensable devient plus cher. Changer de fournisseur coûterait du temps, mais rester réduira ta marge.'],
'paiements qui échouent':['Des clients n’arrivent plus à payer','Une partie des paiements échoue à cause d’un problème technique. Chaque heure sans correction peut faire perdre des ventes.'],
'système lent aux heures de pointe':['Ton service ralentit quand il y a beaucoup de monde','Aux heures chargées, les clients subissent des lenteurs. Cela commence à dégrader leur expérience.'],
'sauvegardes jamais testées':['Tu découvres que tes sauvegardes ne sont pas fiables','Tes données sont sauvegardées, mais personne n’a vérifié récemment qu’elles peuvent réellement être restaurées.'],
'dépendance critique à un fournisseur':['Ton activité dépend trop d’un seul fournisseur technique','Si ce fournisseur tombe en panne ou change ses conditions, une grande partie de ton activité pourrait être bloquée.'],
'risque de sécurité découvert':['Une faille de sécurité potentielle est découverte','Un problème pourrait permettre un accès non autorisé à certaines données. Il n’y a pas encore d’incident, mais le risque est réel.'],
'migration technique devenue inévitable':['Ton ancien système doit être remplacé','L’outil principal ne suit plus la croissance. Continuer à le réparer devient presque aussi coûteux que le remplacer.']},
REPUTATION:{
'avis négatif très visible':['Un avis négatif devient très visible','Un client mécontent publie un commentaire qui reçoit beaucoup d’attention. De nouveaux prospects peuvent le voir avant d’acheter.'],
'journaliste qui veut t’interviewer':['Un journaliste veut parler de ton entreprise','Un média te propose une interview. Cela peut améliorer ta visibilité, mais une mauvaise communication peut aussi créer des problèmes.'],
'expert qui critique ton offre':['Un expert critique publiquement ton produit','Une personne reconnue dans ton secteur pointe plusieurs défauts de ton offre. Ses commentaires commencent à circuler.'],
'client mécontent très visible':['Un gros client se plaint publiquement','Un client important raconte publiquement une mauvaise expérience. D’autres clients commencent à réagir.'],
'communauté sceptique':['Une partie de ton public commence à douter','Des discussions négatives apparaissent autour de ton entreprise. Le problème reste limité, mais peut grandir si tu ne réponds pas.'],
'ancien salarié qui critique':['Un ancien salarié critique l’entreprise publiquement','Une ancienne personne de l’équipe publie un message négatif sur ton organisation. Cela peut affecter clients et recrutements.'],
'hausse de prix mal reçue':['Ta hausse de prix provoque des réactions négatives','Plusieurs clients trouvent le nouveau tarif trop élevé et menacent de partir.'],
'incident partagé massivement':['Un incident devient viral','Un problème client est largement partagé en ligne. Il faut agir vite pour éviter une crise de confiance.']},
LEGAL:{
'conformité qui bloque une vente':['Un problème juridique bloque un contrat','Un gros client refuse de signer tant qu’un point de conformité n’est pas réglé.'],
'conditions générales obsolètes':['Tes conditions générales ne sont plus à jour','Tes documents juridiques ne correspondent plus complètement à ton activité actuelle. Cela crée un risque en cas de litige.'],
'licence ou contrat ambigu':['Un contrat important est trop flou','Une clause peut être interprétée de plusieurs façons. Si le désaccord grandit, cela pourrait coûter cher.'],
'propriété intellectuelle mal documentée':['Tu n’as pas bien sécurisé la propriété de certains éléments','Certains contenus, codes ou créations utilisés par l’entreprise ne sont pas clairement attribués juridiquement.'],
'fiscalité internationale complexe':['Vendre à l’étranger complique tes impôts','Ton développement international crée de nouvelles obligations fiscales que tu maîtrises mal.'],
'sla avec pénalités':['Un grand client veut des garanties avec pénalités','Le contrat prévoit que tu devras rembourser ou indemniser le client si ton service n’atteint pas certains niveaux.'],
'marque trop proche d’un concurrent':['Ta marque ressemble trop à celle d’un concurrent','Une autre entreprise affirme que ton nom ou ton identité peut créer de la confusion.'],
'nouveau règlement sectoriel':['Une nouvelle règle touche ton activité','Une réglementation va bientôt entrer en vigueur et impose des changements à ton entreprise.']},
STRATEGY:{
'niche qui convertit deux fois mieux':['Un type de client achète beaucoup plus que les autres','Un segment précis convertit presque deux fois mieux que le reste. Tu peux concentrer davantage de ressources sur lui.'],
'nouveau pays avec traction':['Des clients arrivent spontanément d’un nouveau pays','Sans vraie campagne, tu commences à recevoir des ventes venant d’un pays où tu n’es pas encore présent.'],
'offre annuelle plus rentable':['Les contrats annuels semblent plus rentables','Les clients qui paient pour un an restent plus longtemps et coûtent moins cher à gérer. Tu peux pousser davantage cette formule.'],
'segment premium qui accélère':['Les clients haut de gamme répondent très bien','Les offres les plus chères se vendent mieux que prévu auprès d’un certain type de client.'],
'marketplace ou plateforme possible':['Ton activité pourrait devenir une plateforme','Tu pourrais permettre à d’autres vendeurs ou partenaires de passer par ton entreprise, au lieu de tout vendre toi-même.'],
'offre freemium à tester':['Tu peux lancer une version gratuite limitée','Une offre gratuite pourrait attirer beaucoup plus de monde, mais une partie des utilisateurs ne paiera jamais.'],
'acquéreur potentiel qui approche':['Une entreprise pense à te racheter','Un acteur plus grand montre un intérêt sérieux pour ton entreprise. Tu dois décider si tu explores cette possibilité ou si tu continues seul.'],
'pivot vers une industrie précise':['Un secteur répond beaucoup mieux à ton offre','Les résultats sont nettement meilleurs dans une industrie précise. Tu peux te spécialiser davantage pour accélérer.']},
OPERATIONS:{
'délais qui s’allongent':['Tes délais deviennent trop longs','Les clients attendent de plus en plus avant d’être servis ou livrés. Le problème vient de ton organisation interne.'],
'erreurs manuelles répétées':['Ton équipe répète les mêmes erreurs','Plusieurs tâches faites à la main provoquent régulièrement des erreurs et des retards.'],
'procédure interne trop lente':['Une procédure interne ralentit tout le monde','Une tâche simple passe par trop d’étapes et prend beaucoup plus de temps qu’elle ne devrait.'],
'coût de service qui augmente':['Servir chaque client te coûte de plus en plus cher','Les coûts nécessaires pour livrer ou accompagner les clients augmentent plus vite que les revenus.'],
'outil interne qui ne suit plus':['Ton outil principal ne suit plus la croissance','Un logiciel ou processus interne devient un frein à mesure que le volume augmente.'],
'responsabilités mal réparties':['Personne ne sait clairement qui décide quoi','Plusieurs problèmes restent sans réponse parce que les responsabilités sont mal définies dans l’équipe.'],
'activité très saisonnière':['Tes ventes dépendent fortement de la saison','Une grande partie de ton chiffre d’affaires se concentre sur quelques périodes de l’année. Il faut mieux préparer les mois faibles.'],
'organisation dépendante d’une seule personne':['Une seule personne connaît un processus essentiel','Si cette personne est absente ou part, une partie importante de l’activité peut être bloquée.']},
CUSTOMER:{
'clients qui demandent plus de support':['Les clients demandent beaucoup plus d’aide','Le volume de questions augmente et ton équipe passe davantage de temps à aider les clients après l’achat.'],
'hausse des annulations':['De plus en plus de clients partent','Le nombre de clients qui annulent ou ne renouvellent pas augmente. Il faut comprendre pourquoi avant que cela pèse trop sur la croissance.'],
'demandes de remboursement':['Les demandes de remboursement augmentent','Davantage de clients demandent à récupérer leur argent. Cela peut signaler un problème de qualité ou de promesse commerciale.'],
'satisfaction qui baisse':['La satisfaction de tes clients diminue','Les retours récents sont moins bons qu’avant. Le problème n’est pas encore critique, mais la tendance est claire.'],
'groupe de clients très fidèle':['Un groupe de clients adore ton offre','Certains clients achètent souvent, recommandent ton entreprise et semblent prêts à payer davantage pour plus de valeur.'],
'segment qui coûte trop cher à servir':['Certains clients te coûtent plus qu’ils ne rapportent','Un type de client demande beaucoup de support et de travail pour peu de marge.'],
'baisse de fréquence d’achat':['Tes clients achètent moins souvent','Le nombre de clients reste stable, mais chacun revient moins souvent qu’avant.'],
'besoin de fidélisation':['Tu dois donner une raison aux clients de revenir','Beaucoup de clients achètent une fois puis disparaissent. Un programme de fidélité pourrait augmenter les achats répétés.']},
SUPPLY:{
'fournisseur principal qui augmente ses prix':['Ton fournisseur principal augmente ses prix','Le coût de ce que tu achètes augmente brutalement. Accepter réduit ta marge, mais changer de fournisseur comporte aussi des risques.'],
'rupture de stock ou de capacité':['Tu risques de ne plus pouvoir servir certains clients','Le stock ou la capacité disponible devient insuffisant pour répondre à la demande actuelle.'],
'nouveau fournisseur moins cher':['Un nouveau fournisseur propose des prix plus bas','Tu peux réduire tes coûts en changeant de fournisseur, mais tu ne connais pas encore bien sa fiabilité.'],
'partenaire logistique en retard':['Ton partenaire de livraison accumule les retards','Les commandes arrivent plus tard chez les clients et les plaintes commencent à augmenter.'],
'qualité variable des approvisionnements':['La qualité de tes approvisionnements devient irrégulière','Certains lots sont corrects et d’autres beaucoup moins bons. Cela commence à toucher l’expérience client.'],
'stock dormant trop important':['Trop d’argent est bloqué dans du stock qui ne se vend pas','Une partie de ton stock reste longtemps sans acheteur. Ton cash est immobilisé dans des produits qui tournent mal.'],
'coût de livraison en hausse':['Les frais de livraison augmentent','Expédier chaque commande coûte davantage. Tu dois choisir entre absorber la hausse ou la répercuter.'],
'dépendance à un seul fournisseur':['Tu dépends trop d’un seul fournisseur','Si ton fournisseur principal a un problème, une grande partie de ton activité peut s’arrêter.']},
EXPANSION:{
'deuxième implantation possible':['Tu peux ouvrir un deuxième point de vente','Un nouvel emplacement intéressant se libère. Il peut accélérer la croissance, mais demande un investissement important.'],
'nouveau quartier ou marché à tester':['Une nouvelle zone semble prometteuse','Des clients potentiels apparaissent dans une zone où tu n’es pas encore présent. Tu peux la tester avant de t’y installer vraiment.'],
'franchise proposée':['Quelqu’un veut ouvrir une franchise avec ta marque','Un entrepreneur veut utiliser ta marque et ton modèle pour ouvrir sa propre implantation. Tu gagnerais des revenus, mais contrôlerais moins l’exécution.'],
'local plus grand disponible':['Un local plus grand devient disponible','Tu peux augmenter ta capacité et accueillir plus de clients, mais tes coûts fixes augmenteront aussi.'],
'acquisition d’un petit concurrent':['Tu peux racheter un petit concurrent','Une entreprise plus petite est à vendre. L’acheter peut apporter des clients et des compétences, mais demande beaucoup de cash.'],
'ouverture à l'étranger':['Tu peux ouvrir ton premier marché à l’étranger','Des signaux montrent qu’un autre pays pourrait bien répondre à ton offre. L’expansion ajoute cependant de nouveaux coûts et risques.'],
'nouvelle catégorie à lancer':['Tu peux lancer une nouvelle gamme','Tes clients semblent intéressés par une catégorie proche de ton activité actuelle. Cela peut augmenter les ventes mais disperser ton attention.'],
'grand distributeur intéressé':['Un grand distributeur veut vendre ton offre','Une enseigne importante propose de distribuer ton produit à grande échelle. Elle peut apporter beaucoup de volume mais demandera de bonnes conditions.']}
};
const CHOICES={
PRODUCT:['Corriger complètement','Tester une amélioration limitée','Attendre encore'],SALES:['Accepter avec des limites','Négocier de meilleures conditions','Refuser'],MARKETING:['Investir davantage','Tester avec un petit budget','Ne pas investir pour l’instant'],TEAM:['Renforcer l’équipe maintenant','Prendre une aide temporaire','Faire avec l’équipe actuelle'],FINANCE:['Lever des fonds','Emprunter','Réduire les dépenses'],COMPETITION:['Réagir fortement','Adapter ton offre','Ne pas changer de stratégie'],INFRA:['Corriger le problème maintenant','Faire une amélioration ciblée','Attendre'],REPUTATION:['Répondre publiquement','Régler le problème directement','Ne pas répondre'],LEGAL:['Tout mettre en règle','Corriger seulement le point urgent','Reporter'],STRATEGY:['Miser fortement sur cette piste','Faire un test limité','Continuer comme avant'],OPERATIONS:['Revoir complètement le fonctionnement','Corriger le principal problème','Continuer comme aujourd’hui'],CUSTOMER:['Traiter le problème à fond','Faire une correction ciblée','Attendre davantage de preuves'],SUPPLY:['Sécuriser une solution maintenant','Tester une deuxième option','Ne rien changer'],EXPANSION:['Se lancer maintenant','Tester à petite échelle','Attendre avant de grandir']};
function keyTitle(t){return (t||'').trim().toLowerCase();}
function statLine(){
  const cash=fmtMoney(Math.round(state.cash||0)),rev=fmtMoney(Math.round(state.revenue||0)),exp=fmtMoney(Math.round(state.expenses||0));
  const burn=Math.max(0,(state.expenses||0)-(state.revenue||0));
  const runway=burn>0?`${Math.max(0,(state.cash||0)/burn).toFixed(1)} mois de trésorerie au rythme actuel`:'activité rentable ce mois-ci';
  return `Aujourd’hui : ${cash} de cash, ${rev} de chiffre d’affaires mensuel, ${exp} de dépenses mensuelles, ${runway}.`;
}
function rewrite(e){
  if(!e||typeof e.id!=='string'||!e.id.startsWith('v08-'))return e;
  const cat=e.category||'STRATEGY',entry=SIMPLE[cat]?.[keyTitle(e.title)];
  if(entry){e.title=entry[0];e.description=`${entry[1]} ${statLine()}`;}
  else{e.description=`Une situation importante demande une décision claire. ${statLine()}`;}
  const labels=CHOICES[cat];if(labels&&Array.isArray(e.choices))e.choices.forEach((c,i)=>{if(labels[i])c.label=labels[i];});
  return e;
}
const previousPickEvent=pickEvent;
pickEvent=function(){return rewrite(previousPickEvent())};
queueMicrotask(()=>{
  document.title='Scale Up — '+VERSION;
  const badge=document.querySelector('.hero h1')?.nextElementSibling;if(badge)badge.textContent=VERSION;
  console.info('Scale Up '+VERSION+' — rédaction des événements simplifiée');
});
})();