/* Advanced Calculator JS */
/* Uses math.js (loaded from CDN) for safe parsing and evaluation
   Features:
   - Build expression from buttons & keyboard
   - Memory functions (MC, MR, M+, M-)
   - ANS key stores last result
   - History display
   - Basic error handling
*/

(function(){
  const displayEl = document.getElementById('display');
  const historyEl = document.getElementById('history');
  const buttons = Array.from(document.querySelectorAll('.btn'));
  const equalsBtn = document.getElementById('equals');
  const clearBtn = document.getElementById('clear');
  const backBtn = document.getElementById('backspace');
  const ansBtn = document.getElementById('ans');
  const themeToggle = document.getElementById('themeToggle');

  let expression = '';
  let memory = 0;
  let lastAns = '';
  const maxHistory = 6;
  const history = [];

  function updateDisplay(){
    displayEl.value = expression || '0';
  }

  function pushHistory(item){
    history.unshift(item);
    if(history.length > maxHistory) history.pop();
    historyEl.textContent = history.join(' \n ');
  }

  function safeEvaluate(expr){
    try{
      // Use math.js evaluate - support functions like sin, cos, log, ln, sqrt
      // Map ln -> log for natural log
      const mapped = expr.replace(/\bln\(/g, 'log(');
      const result = math.evaluate(mapped);
      if (typeof result === 'function') throw new Error('Invalid expression');
      return result;
    }catch(e){
      throw e;
    }
  }

  // Button click handling
  buttons.forEach(btn=>{
    btn.addEventListener('click', e=>{
      const v = btn.dataset.value;
      if(v){
        expression += v;
        updateDisplay();
      }
    });
  });

  // Equals
  equalsBtn.addEventListener('click', ()=>{
    if(!expression) return;
    try{
      const res = safeEvaluate(expression);
      const resStr = (Number.isFinite(res) && Math.abs(res) < 1e15) ? String(res) : String(res);
      pushHistory(expression + ' = ' + resStr);
      lastAns = resStr;
      expression = resStr;
      updateDisplay();
    }catch(err){
      expression = '';
      displayEl.value = 'Error';
      setTimeout(()=>{ updateDisplay(); }, 900);
    }
  });

  // Clear
  clearBtn.addEventListener('click', ()=>{
    expression = '';
    updateDisplay();
  });

  // Backspace
  backBtn.addEventListener('click', ()=>{
    expression = expression.slice(0,-1);
    updateDisplay();
  });

  // ANS
  ansBtn.addEventListener('click', ()=>{
    if(lastAns) expression += lastAns;
    updateDisplay();
  });

  // Memory functions
  document.getElementById('mc').addEventListener('click', ()=>{ memory = 0; });
  document.getElementById('mr').addEventListener('click', ()=>{ expression += String(memory); updateDisplay(); });
  document.getElementById('mPlus').addEventListener('click', ()=>{
    try{
      const val = safeEvaluate(expression || lastAns || '0');
      memory = Number(memory) + Number(val || 0);
      expression = '';
      updateDisplay();
    }catch(e){
      displayEl.value = 'Error';
      expression = '';
      setTimeout(()=>updateDisplay(),800);
    }
  });
  document.getElementById('mMinus').addEventListener('click', ()=>{
    try{
      const val = safeEvaluate(expression || lastAns || '0');
      memory = Number(memory) - Number(val || 0);
      expression = '';
      updateDisplay();
    }catch(e){
      displayEl.value = 'Error';
      expression = '';
      setTimeout(()=>updateDisplay(),800);
    }
  });

  // Keyboard support
  window.addEventListener('keydown', (ev)=>{
    const k = ev.key;
    if((/^[0-9]$/.test(k)) || ['+','-','*','/','^','.','(',')'].includes(k)){
      expression += k;
      updateDisplay();
      ev.preventDefault();
    } else if(k === 'Enter' || k === '='){
      ev.preventDefault();
      equalsBtn.click();
    } else if(k === 'Backspace'){
      ev.preventDefault();
      backBtn.click();
    } else if(k.toLowerCase() === 'c'){
      clearBtn.click();
    }
  });

  // Theme toggle
  function setTheme(dark){
    document.body.classList.toggle('dark', !!dark);
    themeToggle.textContent = dark ? '☀️' : '🌙';
  }
  themeToggle.addEventListener('click', ()=>{
    const isDark = !document.body.classList.contains('dark');
    setTheme(isDark);
    try{ localStorage.setItem('calcThemeDark', isDark ? '1' : '0'); }catch(e){}
  });
  // load theme pref
  try{
    const pref = localStorage.getItem('calcThemeDark');
    setTheme(pref === '1');
  }catch(e){}

  // Initialize display
  updateDisplay();

})();
