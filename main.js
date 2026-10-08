const state = {
  goal: 'hypertrophy', level: 'intermediate', days: 4, equipment: 'full_gym', duration: 60,
  focus: 'Corpo inteiro', limitations: '', activeDay: 0, completed: {}
};

const labels = { hypertrophy: 'Hipertrofia', strength: 'Força', fat_loss: 'Emagrecimento', conditioning: 'Condicionamento', beginner: 'Iniciante', intermediate: 'Intermediário', advanced: 'Avançado' };
const splits = { 2: ['Full body', ['Corpo inteiro', 'Corpo inteiro']], 3: ['Full body', ['Corpo inteiro', 'Corpo inteiro', 'Corpo inteiro']], 4: ['Upper / Lower', ['Superior', 'Inferior', 'Superior', 'Inferior']], 5: ['Push / Pull / Legs', ['Push', 'Pull', 'Legs', 'Upper', 'Lower']], 6: ['Push / Pull / Legs', ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs']] };
const catalog = {
  Peito: [['Supino reto com barra', 'Peito', 'Mantenha as escápulas apoiadas e desça com controle.'], ['Crucifixo na máquina', 'Peito', 'Pense em aproximar os cotovelos, não as mãos.']],
  Costas: [['Puxada alta pronada', 'Costas', 'Inicie o movimento deprimindo as escápulas.'], ['Remada baixa', 'Costas', 'Evite embalar o tronco na volta.']],
  Pernas: [['Agachamento livre', 'Quadríceps', 'Desça até onde mantém a lombar neutra.'], ['Leg press 45°', 'Pernas', 'Não trave os joelhos no topo.']],
  Ombros: [['Desenvolvimento com halteres', 'Ombros', 'Suba sem perder a linha dos punhos.'], ['Elevação lateral', 'Ombros', 'Pare quando os cotovelos chegarem à altura dos ombros.']],
  Braços: [['Rosca direta', 'Bíceps', 'Mantenha os cotovelos fixos ao lado do corpo.'], ['Tríceps na polia', 'Tríceps', 'Finalize estendendo sem abrir os cotovelos.']]
};
const muscleMap = { Push: ['Peito', 'Ombros'], Pull: ['Costas', 'Braços'], Legs: ['Pernas'], Upper: ['Peito', 'Costas'], Lower: ['Pernas'], Superior: ['Peito', 'Costas'], Inferior: ['Pernas'], 'Corpo inteiro': ['Peito', 'Costas', 'Pernas'] };

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
function toast(message) { const el = $('#toast'); el.textContent = message; el.classList.add('show'); clearTimeout(window.toastTimer); window.toastTimer = setTimeout(() => el.classList.remove('show'), 2600); }
function scrollToTarget(event) { const target = $(event.currentTarget.dataset.scroll); if (target) target.scrollIntoView({ behavior: 'smooth' }); }
function makePlan() {
  const [split, focuses] = splits[state.days];
  const goalReps = state.goal === 'strength' ? '3–5' : state.goal === 'hypertrophy' ? '8–12' : '10–15';
  const sets = state.goal === 'strength' ? 4 : 3;
  return { title: `Plano ${labels[state.goal].toLowerCase()} · ${state.days} dias`, split, goal: labels[state.goal], level: labels[state.level], duration: state.duration, days: focuses.map((focus, dayIndex) => ({ label: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][dayIndex], focus, exercises: (muscleMap[focus] || ['Peito', 'Costas']).flatMap((muscle) => catalog[muscle].slice(0, muscle === 'Pernas' ? 1 : 2).map(([name, group, tip], index) => ({ id: `${dayIndex}-${muscle}-${index}`, name, group, tip, sets, reps: goalReps, rest: state.goal === 'strength' ? 150 : 90, rpe: state.level === 'beginner' ? 'RPE 8' : 'RPE 8–9' }))) })) };
}
let plan = makePlan();
function renderPlan() {
  $('#plan-title').textContent = plan.title;
  $('#plan-summary').textContent = `Plano gerado para ${plan.goal.toLowerCase()}, ${plan.days.length} dias por semana, com foco em ${state.focus.toLowerCase()}.${state.limitations ? ` Ajuste: ${state.limitations}.` : ''}`;
  $('#metric-split').textContent = plan.split; $('#metric-time').textContent = `${plan.duration} min`; $('#metric-level').textContent = plan.level; $('#metric-exercises').textContent = `${plan.days.reduce((sum, day) => sum + day.exercises.length, 0)} ativos`;
  $('#day-tabs').innerHTML = plan.days.map((day, index) => `<button type="button" class="day-tab ${index === state.activeDay ? 'active' : ''}" data-day="${index}" data-testid="weekly-day-tab-${day.label.toLowerCase()}"><b>${day.label.slice(0, 3)}</b><small>${day.focus}</small></button>`).join('');
  $$('.day-tab').forEach((button) => button.addEventListener('click', () => { state.activeDay = Number(button.dataset.day); renderPlan(); }));
  const day = plan.days[state.activeDay];
  $('#day-content').innerHTML = `<div class="planner-day-head"><div><h3>${day.label} · ${day.focus}</h3><p>⏱ ${plan.duration} min · ${day.exercises.length} exercícios</p></div><button class="rest-button" id="rest-button" data-testid="rest-timer-toggle-btn">◷</button></div><div class="exercise-list">${day.exercises.map((exercise, index) => `<article class="exercise ${state.completed[exercise.id] ? 'done' : ''}" data-testid="exercise-card-${exercise.id}"><input class="exercise-check" type="checkbox" ${state.completed[exercise.id] ? 'checked' : ''} data-exercise="${exercise.id}" data-testid="exercise-complete-${exercise.id}" /><div class="exercise-main"><div class="exercise-title-row"><div><span class="exercise-muscle">${String(index + 1).padStart(2, '0')} · ${exercise.group}</span><h4 data-testid="exercise-name-${exercise.id}">${exercise.name}</h4></div><div class="exercise-actions"><button class="icon-button swap-button" data-exercise="${exercise.id}" data-testid="swap-exercise-btn-${exercise.id}" aria-label="Trocar exercício">↻</button></div></div><div class="exercise-stats"><span>${exercise.sets} séries</span><span>${exercise.reps} reps</span><span>${Math.floor(exercise.rest / 60)}:${String(exercise.rest % 60).padStart(2, '0')} pausa</span><span class="rpe">${exercise.rpe}</span></div><p class="exercise-tip">${exercise.tip}</p></div></article>`).join('')}</div>`;
  $$('.exercise-check').forEach((checkbox) => checkbox.addEventListener('change', () => { state.completed[checkbox.dataset.exercise] = checkbox.checked; renderPlan(); }));
  $$('.swap-button').forEach((button) => button.addEventListener('click', () => { const item = plan.days[state.activeDay].exercises.find((exercise) => exercise.id === button.dataset.exercise); if (item) { item.name = item.name.includes('halteres') ? 'Supino reto com barra' : 'Supino com halteres'; renderPlan(); toast('Exercício alternativo aplicado'); } }));
  $('#rest-button').addEventListener('click', () => { let seconds = 90; const button = $('#rest-button'); button.textContent = '1:30'; const timer = setInterval(() => { seconds -= 1; button.textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`; if (seconds <= 0) { clearInterval(timer); button.textContent = '◷'; toast('Pausa finalizada'); } }, 1000); });
  const completed = day.exercises.filter((exercise) => state.completed[exercise.id]).length; $('#progress-text').textContent = `${completed}/${day.exercises.length}`; $('#progress-bar').style.width = `${day.exercises.length ? completed / day.exercises.length * 100 : 0}%`;
}

$$('[data-scroll]').forEach((button) => button.addEventListener('click', scrollToTarget));
$$('[data-choice]').forEach((button) => button.addEventListener('click', () => { state[button.dataset.choice] = button.dataset.value; $$(`[data-choice="${button.dataset.choice}"]`).forEach((item) => item.classList.remove('selected', 'selected-cyan', 'selected-orange')); button.classList.add(button.dataset.choice === 'level' ? 'selected-cyan' : button.dataset.choice === 'equipment' ? 'selected-orange' : 'selected'); }));
$('#days').addEventListener('input', (event) => { state.days = Number(event.target.value); $('#days-output').textContent = state.days; });
$$('[data-duration]').forEach((button) => button.addEventListener('click', () => { state.duration = Number(button.dataset.duration); $$('.duration').forEach((item) => item.classList.remove('selected-duration')); button.classList.add('selected-duration'); }));
$('#workout-form').addEventListener('submit', (event) => { event.preventDefault(); state.focus = $('#focus').value || 'Corpo inteiro'; state.limitations = $('#limitations').value; state.activeDay = 0; state.completed = {}; plan = makePlan(); renderPlan(); toast('Plano criado. Bora treinar!'); $('#plano').scrollIntoView({ behavior: 'smooth' }); });
$('#active-button').addEventListener('click', () => { $('#plano').scrollIntoView({ behavior: 'smooth' }); toast('Modo treino ativado — marque cada exercício ao concluir'); });
$('#export-button').addEventListener('click', () => { window.print(); });
renderPlan();
