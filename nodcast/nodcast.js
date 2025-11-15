// config
const YAML_FILENAMES = ["README.yaml", "intro.yaml", "default.yaml"];
const STORAGE_KEY = 'nodcast-selections-v1';

// fallback YAML (embedded)
const fallbackYAML = `title: 'Introducing NodCast: A Text-Based Reading Experience'
sections:
- title: Introduction
  fragments:
  - id: ''
    sents:
    - id: ''
      text: Before reading the document, press h to learn how to move between segments.
        Navigation mainly uses the arrow keys.
      nods:
        affirmative:
        - '@okay'
        - I see!
        reflective: []
      questions:
      - '@What is NodCast?'
`;

// app state
let doc = null;
let flat = [];
let idx = 0;

// interactionMode: 'view' | 'nod' | 'questions'
let interactionMode = 'view';
let focusedNodIndex = -1;
let focusedQuestionIndex = -1;

// utilities
function flattenDocument(d){
  const out = [];
  if(!d || !d.sections) return out;
  d.sections.forEach((sec, si) => {
    (sec.fragments || []).forEach((frag, fi) => {
      (frag.sents || []).forEach((s, sti) => {
        out.push({
          sectionTitle: sec.title || `Section ${si+1}`,
          sectionIndex: si,
          fragIndex: fi,
          sentIndex: sti,
          text: (s.text || '').replace(/\n\s+/g, ' ').trim(),
          nods: s.nods || {affirmative: [], reflective: []},
          questions: s.questions || [],
          id: s.id || `${si}-${fi}-${sti}`,
          comments: s.comments || [],
          selectedAffirm: null,
          selectedRefl: null
        });
      });
    });
  });
  return out;
}

function loadSelections(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return {};
    return JSON.parse(raw);
  }catch(e){ return {}; }
}

function saveSelections(obj){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); }catch(e){}
}

// yaml loader
async function tryFetchYAML(filename){
  try{
    const resp = await fetch(filename, {cache: "no-store"});
    if(!resp.ok) return null;
    const txt = await resp.text();
    return jsyaml.load(txt);
  } catch(e){ return null; }
}

async function loadDefaultYAML(){
  for(const fname of YAML_FILENAMES){
    const d = await tryFetchYAML(fname);
    if(d) return d;
  }
  return jsyaml.load(fallbackYAML);
}

// rendering
function renderSentenceBlock(i){
  const s = flat[i];
  const secBlock = document.createElement('div');
  secBlock.className = 'sentence selected';
  secBlock.id = `sent-${i}`;
  secBlock.style.textAlign = 'center';

  const p = document.createElement('p');
  p.textContent = s.text;
  secBlock.appendChild(p);

  // nod chips
  const nodContainer = document.createElement('div');
  nodContainer.className = 'nodelist';
  const allNods = [...(s.nods.affirmative || []), ...(s.nods.reflective || [])];
  allNods.forEach((n, ni) => {
    const type = s.nods.affirmative.includes(n) ? 'affirm' : 'refl';
    const chip = document.createElement('div');
    chip.className = 'chip ' + type;
    chip.textContent = n;
    chip.dataset.index = ni;
    chip.dataset.type = type;
    chip.dataset.value = n;
    chip.addEventListener('click', ()=> selectNod(i, type, n));
    if((type==='affirm' && s.selectedAffirm===n) || (type==='refl' && s.selectedRefl===n)) chip.classList.add('selected');
    if(interactionMode==='nod' && focusedNodIndex===ni) chip.classList.add('focused');
    nodContainer.appendChild(chip);
  });
  secBlock.appendChild(nodContainer);

  // questions
  const qList = document.createElement('div');
  qList.className = 'question-list';
  (s.questions || []).forEach((q, qi) => {
    const qiEl = document.createElement('div');
    qiEl.className = 'question';
    qiEl.textContent = q;
    qiEl.dataset.index = qi;
    if(interactionMode==='questions' && focusedQuestionIndex===qi) qiEl.classList.add('focused');
    qList.appendChild(qiEl);
  });
  secBlock.appendChild(qList);

  return secBlock;
}

function renderMain(){
  const root = document.getElementById('contentRoot');
  root.innerHTML = '';
  if(flat.length===0){ root.textContent='No content.'; return; }
  const block = renderSentenceBlock(idx);
  root.appendChild(block);
}

function highlightSentence(i){
  if(flat.length===0) return;
  if(i<0) i=0;
  if(i>=flat.length) i=flat.length-1;
  const wrapper = document.getElementById('contentRoot');
  wrapper.style.opacity = 0;
  wrapper.style.transform = 'translateY(6px)';
  setTimeout(()=> {
    idx=i;
    interactionMode='view';
    focusedNodIndex=-1;
    focusedQuestionIndex=-1;
    renderMain();
    wrapper.style.opacity = 1;
    wrapper.style.transform = 'translateY(0)';
  },140);
}

function selectNod(sentenceIndex,type,value){
  const s = flat[sentenceIndex];
  if(type==='affirm'){ s.selectedAffirm=(s.selectedAffirm===value?null:value); if(s.selectedAffirm) s.selectedRefl=null; }
  else{ s.selectedRefl=(s.selectedRefl===value?null:value); if(s.selectedRefl) s.selectedAffirm=null; }
  persistSentence(s);
  renderMain();
}

function persistSentence(s){
  const stored = loadSelections();
  stored[s.id]={affirm:s.selectedAffirm||null, refl:s.selectedRefl||null, comments:s.comments||[], questions:s.questions||[]};
  saveSelections(stored);
}

function attachKeyboard(){
  window.addEventListener('keydown', ev=>{
    const tag = document.activeElement?.tagName;
    if(tag==='INPUT'||tag==='TEXTAREA') return;

    if(ev.key==='Escape'){
      interactionMode='view';
      focusedNodIndex=-1;
      focusedQuestionIndex=-1;
      renderMain();
      return;
    }

    if(ev.key==='ArrowDown'){
      ev.preventDefault();
      if(interactionMode==='view'){
        // go to nods
        interactionMode='nod';
        focusedNodIndex = flat[idx].nods.affirmative.concat(flat[idx].nods.reflective).length>0?0:-1;
        renderMain();
      } else if(interactionMode==='nod'){
        // go to questions
        interactionMode='questions';
        focusedQuestionIndex = flat[idx].questions.length>0?0:-1;
        focusedNodIndex=-1;
        renderMain();
      } else if(interactionMode==='questions'){
        // move to next segment
        highlightNextSegment();
      }
      return;
    }

    if(ev.key==='ArrowUp'){
      ev.preventDefault();
      interactionMode='view';
      focusedNodIndex=-1;
      focusedQuestionIndex=-1;
      highlightSentence(idx-1);
      return;
    }

    if(ev.key==='ArrowRight'||ev.key==='ArrowLeft'){
      ev.preventDefault();
      const dir = ev.key==='ArrowRight'?1:-1;

      if(interactionMode==='nod'){
        const s = flat[idx];
        const allNods = [...(s.nods.affirmative||[]), ...(s.nods.reflective||[])];
        if(allNods.length===0) return;
        let cur = focusedNodIndex;
        if(cur===-1) cur = dir===1?0:allNods.length-1;
        else cur = (cur+dir+allNods.length)%allNods.length;
        focusedNodIndex=cur;
        renderMain();
      } else if(interactionMode==='questions'){
        const qarr = flat[idx].questions || [];
        if(qarr.length===0) return;
        let cur = focusedQuestionIndex;
        if(cur===-1) cur = dir===1?0:qarr.length-1;
        else cur = (cur+dir+qarr.length)%qarr.length;
        focusedQuestionIndex = cur;
        renderMain();
      }
    }

    if(ev.key==='Enter'||ev.key===' '){
      if(interactionMode==='nod' && focusedNodIndex!==-1){
        const s = flat[idx];
        const allNods = [...(s.nods.affirmative||[]), ...(s.nods.reflective||[])];
        const val = allNods[focusedNodIndex];
        if(val){
          const type = s.nods.affirmative.includes(val)?'affirm':'refl';
          selectNod(idx,type,val);
        }
      } else if(interactionMode==='questions'){
        // treat as button click
        if(focusedQuestionIndex!==-1){
          const q = flat[idx].questions[focusedQuestionIndex];
          if(q) alert("Question: "+q);
        }
        // move to next segment
        highlightNextSegment();
      }
    }

    if(ev.key===':'){ ev.preventDefault(); promptComment(idx); }
    if(ev.key==='q'||ev.key==='Q'){ ev.preventDefault(); promptQuestion(idx); }
    if(ev.key==='h'||ev.key==='H'){ ev.preventDefault(); alert("Navigation help:\n↓ view → nods → questions → next\n→ / ← cycles nods or questions\nEnter/Space selects nod or question\nEsc cancels interaction\n↑ previous sentence"); }
  });
}

function highlightNextSegment(){
  // move idx to first sentence of next segment
  const currentSec = flat[idx].sectionIndex;
  let nextIdx = flat.findIndex(s=>s.sectionIndex>currentSec);
  if(nextIdx===-1) nextIdx=flat.length-1; // stay on last
  interactionMode='questions';
  focusedQuestionIndex = 0;
  focusedNodIndex = -1;
  highlightSentence(nextIdx);
}

// render questions as buttons
function renderSentenceBlock(i){
  const s = flat[i];
  const secBlock = document.createElement('div');
  secBlock.className = 'sentence selected';
  secBlock.id = `sent-${i}`;
  secBlock.style.textAlign = 'center';

  const p = document.createElement('p');
  p.textContent = s.text;
  secBlock.appendChild(p);

  // nods
  const nodContainer = document.createElement('div');
  nodContainer.className = 'nodelist';
  const allNods = [...(s.nods.affirmative || []), ...(s.nods.reflective || [])];
  allNods.forEach((n, ni) => {
    const type = s.nods.affirmative.includes(n) ? 'affirm' : 'refl';
    const chip = document.createElement('button');
    chip.className = 'chip ' + type;
    chip.textContent = n;
    chip.dataset.index = ni;
    chip.dataset.type = type;
    chip.dataset.value = n;
    chip.addEventListener('click', ()=> selectNod(i, type, n));
    if((type==='affirm' && s.selectedAffirm===n) || (type==='refl' && s.selectedRefl===n)) chip.classList.add('selected');
    if(interactionMode==='nod' && focusedNodIndex===ni) chip.classList.add('focused');
    nodContainer.appendChild(chip);
  });
  secBlock.appendChild(nodContainer);

  // questions
  const qList = document.createElement('div');
  qList.className = 'question-list';
  (s.questions || []).forEach((q, qi) => {
    const qiEl = document.createElement('button');
    qiEl.className = 'question';
    qiEl.textContent = q;
    qiEl.dataset.index = qi;
    qiEl.addEventListener('click', ()=> {
      alert("Question: "+q);
      highlightNextSegment();
    });
    if(interactionMode==='questions' && focusedQuestionIndex===qi) qiEl.classList.add('focused');
    qList.appendChild(qiEl);
  });
  secBlock.appendChild(qList);

  return secBlock;
}


function promptComment(i){
  const txt = prompt('Add a comment to this sentence (single line):');
  if(txt?.trim()){
    flat[i].comments = flat[i].comments||[];
    flat[i].comments.push(txt.trim());
    persistSentence(flat[i]);
    renderMain();
  }
}

function promptQuestion(i){
  const txt = prompt('Add a question (single line):');
  if(txt?.trim()){
    flat[i].questions = flat[i].questions||[];
    flat[i].questions.push(txt.trim());
    persistSentence(flat[i]);
    renderMain();
  }
}

// init
async function init(){
  doc = await loadDefaultYAML();
  if(!doc){ document.getElementById('contentRoot').innerText='Failed to parse document'; return; }
  document.getElementById('title').innerText=doc.title||'NodCast';
  flat = flattenDocument(doc);

  const stored = loadSelections();
  flat.forEach(item=>{
    const key=item.id;
    item.selectedAffirm = stored[key]?.affirm || null;
    item.selectedRefl = stored[key]?.refl || null;
    item.comments = stored[key]?.comments || [];
    item.questions = stored[key]?.questions || item.questions || [];
  });

  renderMain();
  attachKeyboard();

  const toggle=document.getElementById('toggleDrawer');
  toggle.addEventListener('click', ()=> {
    document.getElementById('sidebar').classList.toggle('closed');
  });

  // show first sentence with small animation
  const wrapper = document.getElementById('contentRoot');
  wrapper.style.opacity=0;
  wrapper.style.transform='translateY(6px)';
  setTimeout(()=> highlightSentence(0), 10);
}

// start
init();

