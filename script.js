const bulkVocabData = `
水果	哈密瓜	水果/哈密瓜.png
水果	士多啤梨	水果/士多啤梨.png
水果	奇異果	水果/奇異果.png
水果	提子	水果/提子.png
水果	木瓜	水果/木瓜.png
水果	楊桃	水果/楊桃.png
水果	榴槤	水果/榴槤.png
水果	橙	水果/橙.png
水果	檸檬	水果/檸檬.png
水果	火龍果	水果/火龍果.png
水果	牛油果	水果/牛油果.png
水果	芒果	水果/芒果.png
水果	荔枝	水果/荔枝.png
水果	菠蘿	水果/菠蘿.png
水果	藍莓	水果/藍莓.png
水果	蘋果	水果/蘋果.png
水果	西瓜	水果/西瓜.png
水果	車厘子	水果/車厘子.png
水果	香蕉	水果/香蕉.png
水果	龍眼	水果/龍眼.png
蔬菜	南瓜	蔬菜/南瓜.png
蔬菜	娃娃菜	蔬菜/娃娃菜.png
蔬菜	椰菜	蔬菜/椰菜.png
蔬菜	椰菜花	蔬菜/椰菜花.png
蔬菜	洋蔥	蔬菜/洋蔥.png
蔬菜	生菜	蔬菜/生菜.png
蔬菜	番薯	蔬菜/番薯.png
蔬菜	白菜	蔬菜/白菜.png
蔬菜	粟米	蔬菜/粟米.png
蔬菜	紅椒	蔬菜/紅椒.png
蔬菜	紅蘿蔔	蔬菜/紅蘿蔔.png
蔬菜	茄子	蔬菜/茄子.png
蔬菜	菜心	蔬菜/菜心.png
蔬菜	菠菜	蔬菜/菠菜.png
蔬菜	蕃茄	蔬菜/蕃茄.png
蔬菜	薯仔	蔬菜/薯仔.png
蔬菜	蘑菇	蔬菜/蘑菇.png
蔬菜	蘿蔔	蔬菜/蘿蔔.png
蔬菜	西蘭花	蔬菜/西蘭花.png
蔬菜	辣椒	蔬菜/辣椒.png
蔬菜	青椒	蔬菜/青椒.png
蔬菜	青瓜	蔬菜/青瓜.png
蔬菜	青豆	蔬菜/青豆.png
蔬菜	黃椒	蔬菜/黃椒.png
`.trim();

const vocabList = bulkVocabData.split('\n').map((line, i) => {
    const parts = line.split(/[,\t]/);
    return { id: i, category: parts[0]?.trim(), name: parts[1]?.trim(), img: parts[2]?.trim() };
});

let selectedCards = [];
let gameType = 'fixed';

// Background & Slider
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
function initGame(mode) { if (mode === 'sorting') renderLevelSelect(); }

function renderLevelSelect() {
    const stage = document.getElementById('game-stage');
    stage.className = "vertical-layout";
    document.getElementById('current-game-title').innerText = "1. 選擇分類方式";
    stage.innerHTML = `<div style="text-align:center; padding-top:80px; width:100%;">
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
    stage.className = "vertical-layout";
    document.getElementById('current-game-title').innerText = "2. 選取練習詞彙";
    stage.innerHTML = `
        <button class="back-btn" onclick="renderLevelSelect()">⇠ 返回</button>
        <input type="text" id="vocabSearch" placeholder="🔍 搜尋詞彙..." onkeyup="updateSelectionList(this.value.toLowerCase())">
        <div id="selection-content"></div>
        <div style="text-align:right; margin-top:20px;"><button class="nav-btn" style="background:#10AC84; padding:15px 40px; border-radius:15px;" onclick="proceed()">開始活動 ➔</button></div>`;
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

function renderPrep() {
    const stage = document.getElementById('game-stage');
    stage.className = "vertical-layout";
    document.getElementById('current-game-title').innerText = "3. 教學預覽";
    const cats = [...new Set(selectedCards.map(c => c.category))];
    const colors = ["#FF6B6B", "#48DBFB", "#1DD1A1", "#Feca57"];
    stage.innerHTML = `
        <button class="back-btn" onclick="renderSelectionPage()">⇠ 返回選取</button>
        <div class="bin-container">
            ${cats.map((cat, i) => `
                <div class="bin">
                    <div class="bin-header" style="background:${colors[i%4]}"><img src="images/categories/${cat}.png" onerror="this.style.display='none'"><span>${cat}</span></div>
                    <div class="drop-zone">${selectedCards.filter(c => c.category === cat).map(c => `<div class="card"><img src="images/${c.img}"><p>${c.name}</p></div>`).join('')}</div>
                </div>`).join('')}
        </div>
        <div style="text-align:center; padding:20px;"><button class="nav-btn" style="background:#FF9F43; padding:20px 50px; border-radius:20px; font-size:1.5rem;" onclick="runChallenge()">正式開始遊戲！🚀</button></div>`;
    toggleTextDisplay();
}

// --- Challenge Logic (The Split Layout) ---
function runChallenge() {
    const stage = document.getElementById('game-stage');
    stage.className = "challenge-layout"; // Switch to horizontal split
    document.getElementById('current-game-title').innerText = "活動進行中";
    
    const cats = gameType === 'fixed' ? [...new Set(selectedCards.map(c => c.category))] : ["籃子 1", "籃子 2"];
    const colors = ["#FF6B6B", "#48DBFB", "#1DD1A1", "#Feca57"];

    stage.innerHTML = `
        <div id="pool" class="challenge-pool"></div>
        <div class="bin-container">
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
                // Only handle sound for the specific card just moved
                if (e.to.id !== 'pool') {
                    const isCorrect = (gameType === 'free' || e.item.dataset.cat === e.to.dataset.cat);
                    showSingleFX(e.item, isCorrect); 
                    if (gameType === 'fixed') checkSilence(); // Check game end without extra sounds
                }
            } 
        });
    });
    toggleTextDisplay();
}

// --- Sound Logic Fix: Handle only the moved card ---
function showSingleFX(el, ok) {
    const old = el.querySelector('.feedback-star, .feedback-wrong'); if(old) old.remove();
    const fx = document.createElement('div'); 
    fx.className = ok ? 'feedback-star' : 'feedback-wrong';
    fx.innerText = ok ? '⭐' : '❌'; 
    el.appendChild(fx);

    const sndId = ok ? 'snd-star' : 'snd-wrong';
    const snd = document.getElementById(sndId);
    if(snd) {
        snd.pause(); // Kill existing sound to prevent overlapping
        snd.currentTime = 0; 
        snd.play(); 
    }
    setTimeout(() => fx.remove(), 800);
}

function checkSilence() {
    const pool = document.getElementById('pool');
    const bins = document.querySelectorAll('.bin .drop-zone');
    let mistakes = 0; let placed = 0;
    bins.forEach(bin => {
        const target = bin.dataset.cat;
        bin.querySelectorAll('.card').forEach(card => {
            placed++;
            if(card.dataset.cat !== target) mistakes++;
        });
    });
    // Trigger celebration only if everything is perfect
    if(pool.children.length === 0 && mistakes === 0 && placed === selectedCards.length) setTimeout(finish, 600);
}

function finish() {
    document.getElementById('snd-hooray').play();
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
}

async function takeScreenshot() {
    const stage = document.getElementById('game-stage');
    const old = stage.style.overflowY; stage.style.overflowY = 'visible';
    const canvas = await html2canvas(document.getElementById('capture-area'), { useCORS: true, scale: 2 });
    stage.style.overflowY = old;
    const link = document.createElement('a'); link.download = `練習記錄.png`; link.href = canvas.toDataURL(); link.click();
}
