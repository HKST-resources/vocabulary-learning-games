const bulkVocabData = `
水果	哈密瓜	水果/哈密瓜.png
水果	士多啤梨	水果/士多啤梨.png
動物	獅子	動物/獅子.png
動物	老虎	動物/老虎.png
交通	巴士	交通/巴士.png
交通	的士	交通/的士.png
`.trim();

const vocabList = bulkVocabData.split('\n').map((line, i) => {
    const parts = line.split(/[,\t]/);
    return { id: i, category: parts[0]?.trim(), name: parts[1]?.trim(), img: parts[2]?.trim() };
});

let selectedCards = [];
let gameType = 'fixed';

// 1. 初始化預設背景選單
window.onload = () => {
    document.getElementById('bgPicker').value = 'park.jpg';
};

// Background & Slider Logic
document.getElementById('bgPicker').addEventListener('change', (e) => {
    document.body.style.background = e.target.value === 'white' ? "white" : `url('images/${e.target.value}') no-repeat center center fixed`;
    document.body.style.backgroundSize = "cover";
});

document.getElementById('sizeSlider').addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--card-size', `${e.target.value}px`);
});

function toggleTextDisplay() {
    const stage = document.getElementById('game-stage');
    document.getElementById('textToggle').checked ? stage.classList.remove('hide-text') : stage.classList.add('hide-text');
}

// Navigation
function initGame(mode) { 
    if (mode === 'sorting') renderLevelSelect(); 
}

function renderLevelSelect() {
    const stage = document.getElementById('game-stage');
    stage.className = "";
    document.getElementById('current-game-title').innerText = "1. 選擇分類方式";
    stage.innerHTML = `<div style="text-align:center; padding-top:100px; width:100%;">
        <button class="btn-fixed" onclick="startSelection('fixed')">按類別分類</button>
        <button class="btn-free" onclick="startSelection('free')">自由分類</button>
    </div>`;
}

function startSelection(type) {
    gameType = type;
    renderSelectionPage();
}

function renderSelectionPage() {
    const stage = document.getElementById('game-stage');
    stage.className = "";
    document.getElementById('current-game-title').innerText = "2. 選取練習詞彙";
    
    stage.innerHTML = `
        <div class="selection-container">
            <div style="flex-shrink:0;"><button class="back-btn" onclick="renderLevelSelect()">⇠ 返回</button></div>
            <div style="flex-shrink:0;"><input type="text" id="vocabSearch" placeholder="🔍 搜尋名稱..." onkeyup="updateSelectionList(this.value.toLowerCase())"></div>
            <div id="selection-content"></div>
            <div class="selection-footer">
                <button class="nav-btn" style="background:#10AC84; padding:18px 50px; border-radius:18px; font-size:1.4rem;" onclick="proceed()">開始活動 ➔</button>
            </div>
        </div>`;
    updateSelectionList();
    toggleTextDisplay();
}

function updateSelectionList(query = "") {
    const container = document.getElementById('selection-content');
    const cats = [...new Set(vocabList.map(v => v.category))];
    let html = "";
    cats.forEach(cat => {
        const items = vocabList.filter(v => v.category === cat && v.name.toLowerCase().includes(query));
        if (items.length > 0) {
            html += `<div class="category-section"><span class="category-title">${cat}</span><div class="selection-grid">`;
            items.forEach(item => {
                const active = selectedCards.some(c => c.id === item.id) ? 'active' : '';
                html += `<div class="select-item ${active}" onclick="toggleSelect(${item.id})">
                    <img src="images/${item.img}"><p>${item.name}</p></div>`;
            });
            html += `</div></div>`;
        }
    });
    container.innerHTML = html;
}

function toggleSelect(id) {
    const idx = selectedCards.findIndex(c => c.id === id);
    idx > -1 ? selectedCards.splice(idx, 1) : selectedCards.push(vocabList.find(v => v.id === id));
    updateSelectionList(document.getElementById('vocabSearch')?.value.toLowerCase() || "");
}

function proceed() {
    if(selectedCards.length === 0) return alert("請選取卡片");
    gameType === 'free' ? runChallenge() : renderPrep();
}

// 3. 修復：確保 Preparation 頁面按鈕正確顯示並可捲動
function renderPrep() {
    const stage = document.getElementById('game-stage');
    stage.className = "vertical-scroll";
    document.getElementById('current-game-title').innerText = "3. 教學預覽";
    const cats = [...new Set(selectedCards.map(c => c.category))];
    const colors = ["#FF6B6B", "#48DBFB", "#1DD1A1", "#Feca57"];
    
    stage.innerHTML = `
        <div style="flex-shrink:0;"><button class="back-btn" onclick="renderSelectionPage()">⇠ 返回選取</button></div>
        <div class="bin-container" style="margin-top:20px; flex-grow:1;">
            ${cats.map((cat, i) => `
                <div class="bin">
                    <div class="bin-header" style="background:${colors[i%4]}"><img src="images/categories/${cat}.png" onerror="this.style.display='none'"><span>${cat}</span></div>
                    <div class="drop-zone">${selectedCards.filter(c => c.category === cat).map(c => `<div class="card"><img src="images/${c.img}"><p>${c.name}</p></div>`).join('')}</div>
                </div>`).join('')}
        </div>
        <div style="text-align:center; padding:40px; flex-shrink:0;">
            <button class="nav-btn" style="background:#FF9F43; padding:25px 80px; border-radius:25px; font-size:1.8rem;" onclick="runChallenge()">正式開始！🚀</button>
        </div>`;
    toggleTextDisplay();
}

function runChallenge() {
    const stage = document.getElementById('game-stage');
    stage.className = "challenge-layout"; 
    document.getElementById('current-game-title').innerText = "活動進行中";
    
    const cats = gameType === 'fixed' ? [...new Set(selectedCards.map(c => c.category))] : ["籃子 1", "籃子 2"];
    const colors = ["#FF6B6B", "#48DBFB", "#1DD1A1", "#Feca57"];

    stage.innerHTML = `
        <div id="pool" class="challenge-pool"></div>
        <div class="bin-container" style="overflow-y:auto;">
            ${cats.map((cat, i) => `
                <div class="bin" style="${gameType==='free' ? 'border-color:'+colors[i%4] : ''}">
                    ${gameType === 'fixed' ? `<div class="bin-header" style="background:${colors[i%4]}"><img src="images/categories/${cat}.png" onerror="this.style.display='none'"><span>${cat}</span></div>` : ''}
                    <div class="drop-zone" data-cat="${cat}"></div>
                </div>`).join('')}
        </div>
        <div style="position:absolute; bottom:15px; left:15px; z-index:200;"><button class="back-btn" onclick="${gameType==='free'?'renderSelectionPage()':'renderPrep()'}">⇠ 返回</button></div>
        ${gameType==='free' ? '<button class="nav-btn" style="position:absolute; bottom:15px; right:30px; background:#10AC84;" onclick="finish()">完成 ✅</button>' : ''}`;

    const pool = document.getElementById('pool');
    [...selectedCards].sort(()=>0.5-Math.random()).forEach(c => {
        const d = document.createElement('div'); d.className='card'; d.dataset.cat=c.category;
        d.innerHTML=`<img src="images/${c.img}"><p>${c.name}</p>`; pool.appendChild(d);
    });

    [pool, ...document.querySelectorAll('.drop-zone')].forEach(z => {
        new Sortable(z, { 
            group: 'sort', animation: 150, 
            onAdd: (e) => { 
                if (e.to.id !== 'pool') {
                    const isCorrect = (gameType === 'free' || e.item.dataset.cat === e.to.dataset.cat);
                    playFX(e.item, isCorrect); 
                    if (gameType === 'fixed') checkEnd(); 
                }
            } 
        });
    });
    toggleTextDisplay();
}

function playFX(el, ok) {
    const old = el.querySelector('.feedback-star, .feedback-wrong'); if(old) old.remove();
    const fx = document.createElement('div'); 
    fx.className = ok ? 'feedback-star' : 'feedback-wrong';
    fx.innerText = ok ? '⭐' : '❌'; 
    el.appendChild(fx);

    const snd = document.getElementById(ok ? 'snd-star' : 'snd-wrong');
    if(snd) { snd.pause(); snd.currentTime = 0; snd.play(); }
    setTimeout(() => fx.remove(), 800);
}

function checkEnd() {
    const pool = document.getElementById('pool');
    const bins = document.querySelectorAll('.bin .drop-zone');
    let mistakes = 0; let total = 0;
    bins.forEach(bin => {
        const target = bin.dataset.cat;
        bin.querySelectorAll('.card').forEach(card => {
            total++;
            if(card.dataset.cat !== target) mistakes++;
        });
    });
    if(pool.children.length === 0 && mistakes === 0 && total === selectedCards.length) setTimeout(finish, 600);
}

function finish() {
    document.getElementById('snd-hooray').play();
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
}

async function takeScreenshot() {
    const stage = document.getElementById('capture-area');
    const canvas = await html2canvas(stage, { useCORS: true, scale: 2 });
    const link = document.createElement('a'); link.download = `詞彙練習_${new Date().getTime()}.png`; link.href = canvas.toDataURL(); link.click();
}
