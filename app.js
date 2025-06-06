let questions = [];
let qcmQuestions = [];
let userAnswers = [];
const QCM_SIZE = 60;

async function startQCM() {
  document.getElementById('app').innerHTML = "<div class='center'>Chargement des questions...</div>";
  if (questions.length === 0) {
    try {
      const res = await fetch('questions.json?v=' + Date.now());
      questions = await res.json();
    } catch (e) {
      document.getElementById('app').innerHTML = "<div class='center bad'>Erreur de chargement du fichier questions.json</div>";
      return;
    }
  }
  // Mélange et sélection des questions
  qcmQuestions = [...questions].sort(() => Math.random() - 0.5).slice(0, QCM_SIZE);
  userAnswers = Array(QCM_SIZE).fill(null);

  renderQuestion(0);
}

function renderQuestion(idx) {
  const q = qcmQuestions[idx];
  let html = `<div class="question-block">
    <b>Question ${idx+1} / ${QCM_SIZE}</b><br><br>${q.question}
    <div class="choices">`;

  for (const key of Object.keys(q.choix)) {
    html += `<label style="display:block;margin-bottom:5px;">
      <input type="radio" name="ans" value="${key}" ${userAnswers[idx]===key?'checked':''}> ${key}. ${q.choix[key]}
    </label>`;
  }
  html += `</div>
    <div class="center" style="margin-top:10px;">
      ${idx > 0 ? `<button onclick="saveAndRender(${idx-1})">← Précédent</button>` : ''}
      ${idx < QCM_SIZE-1 ? `<button onclick="saveAndRender(${idx+1})">Suivant →</button>` : ''}
      ${idx === QCM_SIZE-1 ? `<button onclick="saveAndRender('corr')">Corriger</button>` : ''}
    </div>
  </div>`;
  document.getElementById('app').innerHTML = html;
  const radios = document.getElementsByName('ans');
  radios.forEach(r => r.onclick = () => userAnswers[idx] = r.value);
}

function saveAndRender(idx) {
  const checked = document.querySelector('input[name=ans]:checked');
  if (checked) userAnswers[Number(document.querySelector('.question-block b').textContent.split(' ')[1])-1] = checked.value;
  if (idx === 'corr') renderCorrection();
  else renderQuestion(idx);
}

function renderCorrection() {
  let html = `<div class="question-block"><b>Correction</b><br>`;
  let score = 0;
  qcmQuestions.forEach((q, i) => {
    const good = q.bonne_reponse;
    const user = userAnswers[i];
    if (user === good) score++;
  });
  html += `<div class="center" style="font-size:1.2em;margin-bottom:10px;"><b>Score : ${score} / ${QCM_SIZE}</b></div>`;
  qcmQuestions.forEach((q, i) => {
    const good = q.bonne_reponse;
    const user = userAnswers[i];
    html += `<div class="correction ${user===good?'good':'bad'}"><b>Q${i+1}.</b> ${q.question}<br>`;
    for (const key of Object.keys(q.choix)) {
      let styl = '';
      if (key === good) styl = 'font-weight:bold;text-decoration:underline;';
      if (key === user && user !== good) styl += 'color:#be1818;';
      html += `<div style="${styl}">${key}. ${q.choix[key]}</div>`;
    }
    html += `<div style="margin-top:6px;"><b>Ta réponse :</b> ${user ? user+'. '+q.choix[user] : "<i>Non répondu</i>"}</div>`;
    if (user !== good) html += `<div><b>Bonne réponse :</b> ${good}. ${q.choix[good]}</div>`;
    html += `</div>`;
  });
  html += `<div class="center"><button onclick="startQCM()">↺ Recommencer un QCM</button></div></div>`;
  document.getElementById('app').innerHTML = html;
}

