const START = { cash: 1000, users: 0, reputation: 50, valuation: 1000, turn: 1 };
let state = { ...START };
let remainingEvents = [];

const events = [
  {
    title: "Un ami te propose de coder avec toi",
    description: "Il est bon, motivé, et veut 20 % de la boîte. Tu gagnerais énormément de temps, mais tu dilues déjà ton capital.",
    category: "COFONDATEUR", risk: "Risque faible",
    choices: [
      { label: "Accepter", hint: "+ vitesse, + crédibilité", effects: { cash: -100, users: 80, reputation: 8, valuation: 3000 }, log: "Tu embarques un cofondateur. Le produit avance enfin vite." },
      { label: "Refuser", hint: "+ contrôle, - vitesse", effects: { cash: 0, users: 10, reputation: -2, valuation: 400 }, log: "Tu gardes 100 % du capital, mais tu avances seul." }
    ]
  },
  {
    title: "Ton premier produit est prêt",
    description: "Il est loin d’être parfait. Tu peux lancer maintenant ou passer encore du temps à le peaufiner.",
    category: "PRODUIT", risk: "Risque moyen",
    choices: [
      { label: "Lancer maintenant", hint: "+ utilisateurs, risque de mauvaise presse", effects: { cash: -150, users: 300, reputation: -4, valuation: 5000 }, log: "Tu lances vite. Les premiers utilisateurs arrivent malgré les bugs." },
      { label: "Polir encore", hint: "+ réputation, - cash", effects: { cash: -350, users: 120, reputation: 8, valuation: 3500 }, log: "Tu retardes le lancement et gagnes en qualité perçue." }
    ]
  },
  {
    title: "Une vidéo TikTok parle de ton produit",
    description: "Un petit créateur vient de te donner une exposition inattendue. Tu peux surfer sur la vague ou rester concentré sur le produit.",
    category: "VIRAL", risk: "Risque faible",
    choices: [
      { label: "Mettre 400 € en acquisition", hint: "Fort potentiel", effects: { cash: -400, users: 1400, reputation: 4, valuation: 16000 }, log: "Tu amplifies le buzz et dépasses le millier d’utilisateurs." },
      { label: "Ne rien dépenser", hint: "Croissance organique", effects: { cash: 0, users: 650, reputation: 3, valuation: 8000 }, log: "Le bouche-à-oreille fait son travail sans te coûter un euro." }
    ]
  },
  {
    title: "Un investisseur te contacte",
    description: "Il propose 25 000 € contre une grosse part de l’entreprise. Cet argent pourrait changer la trajectoire du projet.",
    category: "FUNDRAISING", risk: "Risque moyen",
    choices: [
      { label: "Prendre l’argent", hint: "+25 000 € cash", effects: { cash: 25000, users: 500, reputation: 6, valuation: 40000 }, log: "Tu lèves ton premier chèque. La pression monte avec les attentes." },
      { label: "Bootstrapper", hint: "+ indépendance, croissance plus lente", effects: { cash: 0, users: 180, reputation: 5, valuation: 7000 }, log: "Tu refuses l’investisseur et gardes ta liberté." }
    ]
  },
  {
    title: "Tes serveurs craquent",
    description: "Le trafic grimpe plus vite que prévu. Tu peux investir dans l’infrastructure ou prendre le risque de continuer ainsi.",
    category: "CRISE", risk: "Risque élevé",
    choices: [
      { label: "Payer l’infrastructure", hint: "-1 500 € mais croissance sécurisée", effects: { cash: -1500, users: 700, reputation: 6, valuation: 12000 }, log: "Tu encaisses le coût mais le service devient solide." },
      { label: "Prendre le risque", hint: "Économique mais dangereux", effects: { cash: 0, users: -180, reputation: -14, valuation: -8000 }, log: "Le service tombe plusieurs heures. Des utilisateurs partent furieux." }
    ]
  },
  {
    title: "Un concurrent copie ton idée",
    description: "Il arrive avec plus de moyens et un produit très similaire. Tu dois choisir entre confrontation et différenciation.",
    category: "CONCURRENCE", risk: "Risque élevé",
    choices: [
      { label: "Baisser les prix", hint: "+ utilisateurs, - cash", effects: { cash: -2500, users: 2200, reputation: -3, valuation: 18000 }, log: "Tu déclenches une guerre des prix et récupères beaucoup de volume." },
      { label: "Monter en gamme", hint: "Moins d’utilisateurs, meilleure image", effects: { cash: -800, users: 700, reputation: 12, valuation: 24000 }, log: "Tu assumes un positionnement premium qui te différencie." }
    ]
  },
  {
    title: "Une grande entreprise veut un partenariat",
    description: "Le deal te donnerait une énorme visibilité, mais tu deviendrais dépendant d’un seul partenaire.",
    category: "DEAL", risk: "Risque moyen",
    choices: [
      { label: "Signer", hint: "+ forte croissance", effects: { cash: 7000, users: 5000, reputation: 10, valuation: 55000 }, log: "Le partenariat te propulse dans une autre dimension." },
      { label: "Rester indépendant", hint: "+ réputation, progression stable", effects: { cash: 1000, users: 1200, reputation: 8, valuation: 18000 }, log: "Tu refuses de dépendre d’un géant et consolides ta marque." }
    ]
  },
  {
    title: "Ton équipe veut recruter",
    description: "Le backlog explose. Recruter accélérerait la croissance, mais ton burn rate grimperait immédiatement.",
    category: "ÉQUIPE", risk: "Risque moyen",
    choices: [
      { label: "Recruter 3 personnes", hint: "-8 000 € / gros effet", effects: { cash: -8000, users: 3500, reputation: 8, valuation: 42000 }, log: "Tu renforces l’équipe et la roadmap accélère brutalement." },
      { label: "Rester petit", hint: "économie de cash", effects: { cash: 0, users: 800, reputation: -1, valuation: 9000 }, log: "Tu gardes une petite équipe et avances plus prudemment." }
    ]
  },
  {
    title: "La presse te propose une interview",
    description: "Tu peux annoncer des objectifs très ambitieux pour faire parler de toi, ou rester volontairement sobre.",
    category: "PRESSE", risk: "Risque moyen",
    choices: [
      { label: "Promettre énorme", hint: "+ buzz, - réputation", effects: { cash: 0, users: 4800, reputation: -9, valuation: 47000 }, log: "Tes déclarations font le tour des réseaux. Tout le monde te regarde désormais." },
      { label: "Rester prudent", hint: "+ réputation", effects: { cash: 0, users: 1100, reputation: 10, valuation: 16000 }, log: "Tu gagnes la confiance de ceux qui apprécient ton approche mesurée." }
    ]
  },
  {
    title: "Une offre de rachat tombe",
    description: "On te propose une somme confortable. Tu peux sécuriser le résultat maintenant ou continuer à viser beaucoup plus haut.",
    category: "EXIT", risk: "Risque élevé",
    choices: [
      { label: "Refuser et continuer", hint: "Tout pour la croissance", effects: { cash: -3000, users: 7000, reputation: 6, valuation: 90000 }, log: "Tu refuses le rachat. La nouvelle fuite et ton ambition impressionne le marché." },
      { label: "Utiliser l’offre comme levier", hint: "+ cash, + valorisation", effects: { cash: 15000, users: 1800, reputation: 3, valuation: 65000 }, log: "Tu ne vends pas, mais utilises l’offre pour négocier de meilleures conditions ailleurs." }
    ]
  },
  {
    title: "Ton produit devient une tendance",
    description: "Des milliers de personnes parlent de toi. Tu peux monétiser vite ou laisser la croissance exploser gratuitement.",
    category: "HYPERGROWTH", risk: "Risque moyen",
    choices: [
      { label: "Monétiser maintenant", hint: "+ beaucoup de cash", effects: { cash: 45000, users: 9000, reputation: -3, valuation: 130000 }, log: "Tu transformes enfin l’audience en revenus significatifs." },
      { label: "Croître gratuitement", hint: "+ utilisateurs, + valorisation", effects: { cash: -5000, users: 24000, reputation: 8, valuation: 170000 }, log: "Tu repousses la monétisation et privilégies une croissance massive." }
    ]
  },
  {
    title: "Le marché s’emballe",
    description: "Les investisseurs paient cher pour la croissance. C’est peut-être le moment de lever gros, ou de profiter seul de la dynamique.",
    category: "MARCHÉ", risk: "Risque élevé",
    choices: [
      { label: "Lever 250 000 €", hint: "Accélération maximale", effects: { cash: 250000, users: 18000, reputation: 10, valuation: 350000 }, log: "Tu boucles une grosse levée et passes dans la cour supérieure." },
      { label: "Continuer sans levée", hint: "Plus lent mais maîtrisé", effects: { cash: 30000, users: 12000, reputation: 8, valuation: 210000 }, log: "Tu génères assez de revenus pour financer ta propre croissance." }
    ]
  },
  {
    title: "Une fonctionnalité explose à l’international",
    description: "Le produit prend soudainement hors de ton marché initial. Tu peux traduire et localiser partout, ou rester concentré.",
    category: "EXPANSION", risk: "Risque moyen",
    choices: [
      { label: "S’étendre partout", hint: "-40 000 € / énorme potentiel", effects: { cash: -40000, users: 50000, reputation: 10, valuation: 300000 }, log: "Tu internationalises agressivement et le nombre d’utilisateurs explose." },
      { label: "Consolider d’abord", hint: "+ cash, + stabilité", effects: { cash: 25000, users: 14000, reputation: 9, valuation: 140000 }, log: "Tu solidifies le marché existant avant d’aller plus loin." }
    ]
  },
  {
    title: "Le board veut accélérer encore",
    description: "Tu es proche du million. Un dernier pari peut te propulser au sommet... ou brûler une énorme partie de ton cash.",
    category: "ALL-IN", risk: "Risque extrême",
    choices: [
      { label: "Tout miser sur la croissance", hint: "Très gros upside", effects: { cash: -90000, users: 80000, reputation: 5, valuation: 500000 }, log: "Tu passes en mode all-in. La croissance devient folle." },
      { label: "Sécuriser les revenus", hint: "+ cash, progression sûre", effects: { cash: 85000, users: 24000, reputation: 8, valuation: 220000 }, log: "Tu privilégies une entreprise rentable plutôt qu’un feu de paille." }
    ]
  }
];

const $ = (id) => document.getElementById(id);
const money = (n) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(Math.max(0, n));
const number = (n) => new Intl.NumberFormat("fr-FR").format(Math.max(0, Math.round(n)));

function resetGame() {
  state = { ...START };
  remainingEvents = [...events].sort(() => Math.random() - 0.5);
  $("start-screen").classList.add("hidden");
  $("end-screen").classList.add("hidden");
  $("game-screen").classList.remove("hidden");
  $("feed").innerHTML = "";
  addFeed("Départ", "Tu crées Scale Labs avec 1 000 € en poche.");
  renderStats();
  showNextEvent();
}

function renderStats() {
  $("cash").textContent = money(state.cash);
  $("users").textContent = number(state.users);
  $("reputation").textContent = Math.max(0, Math.min(100, state.reputation));
  $("valuation").textContent = money(state.valuation);
  $("turn-label").textContent = `Tour ${state.turn}`;
  const pct = Math.min(100, Math.max(0, state.valuation / 1000000 * 100));
  $("progress-bar").style.width = `${pct}%`;
}

function showNextEvent() {
  if (state.cash < 0 || state.reputation <= 0) return endGame(false);
  if (state.valuation >= 1000000) return endGame(true);
  if (!remainingEvents.length) remainingEvents = [...events].sort(() => Math.random() - 0.5);
  const event = remainingEvents.shift();
  $("event-title").textContent = event.title;
  $("event-description").textContent = event.description;
  $("event-category").textContent = event.category;
  $("event-risk").textContent = event.risk;
  $("choices").innerHTML = "";
  event.choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.innerHTML = `<strong>${choice.label}</strong><span>${choice.hint}</span>`;
    btn.addEventListener("click", () => choose(choice));
    $("choices").appendChild(btn);
  });
}

function choose(choice) {
  Object.entries(choice.effects).forEach(([key, value]) => state[key] += value);
  state.users = Math.max(0, state.users);
  state.valuation = Math.max(0, state.valuation);
  state.reputation = Math.max(0, Math.min(100, state.reputation));
  state.turn += 1;

  const multiplier = 0.94 + Math.random() * 0.12;
  state.valuation = Math.round(state.valuation * multiplier);

  addFeed(`Tour ${state.turn - 1}`, choice.log);
  renderStats();
  setTimeout(showNextEvent, 180);
}

function addFeed(label, text) {
  const item = document.createElement("div");
  item.className = "feed-item";
  item.innerHTML = `<b>${label}</b><span>${text}</span>`;
  $("feed").prepend(item);
}

function endGame(won) {
  $("game-screen").classList.add("hidden");
  $("end-screen").classList.remove("hidden");
  $("end-kicker").textContent = won ? "SCALE UP RÉUSSI" : "GAME OVER";
  $("end-title").textContent = won ? "Tu as passé le million." : "La startup n’a pas survécu.";
  $("end-copy").textContent = won
    ? "Ta boîte a franchi le premier cap symbolique. Pour cette V0, c’est la victoire — la prochaine version ira beaucoup plus loin."
    : state.cash < 0
      ? "Tu as brûlé plus de cash que tu n’en avais. Ton burn rate t’a rattrapé."
      : "Ta réputation est tombée à zéro. Plus personne ne te fait confiance.";
  $("end-valuation").textContent = money(state.valuation);
  $("end-users").textContent = number(state.users);
  $("end-turns").textContent = state.turn - 1;
}

$("start-btn").addEventListener("click", resetGame);
$("restart-btn").addEventListener("click", resetGame);
$("play-again-btn").addEventListener("click", resetGame);
