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

// 背景切換 (僅保留圖片)
document.getElementById('bgPicker').addEventListener('change', (e) => {
    const val = e.target.value;
    const body = document.body;
    if (val === 'white') body.style.background = "white";
    else body.style.background = `url('images/${val}') no-repeat center center fixed`;
    body.style.backgroundSize = "cover";
});

document.getElementById('sizeSlider').addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--card-size', `${e.target.value}px`);
});

function toggleTextDisplay() {
    const stage = document.getElementById('game-stage');
    document.getElementById('textToggle').checked ? stage.classList.remove('hide-text') : stage.classList.add('hide-text');
}

// 遊戲導航
function initGame(mode) { if (mode === 'sorting') renderLevelSelect(); }

function renderLevelSelect() {
    const stage = document.getElementById('game-stage');
    document.getElementById('current-game-title').innerText = "1. 選擇分類方式";
    stage.innerHTML = `
        <div style="text-align:center; padding-top:100px;">
            <button class="btn-fixed" onclick="startSelection('fixed')">按類別分類</button>
            <button class="btn-free" onclick="startSelection('free')">自由分類</button>
        </div>`;
}

function startSelection(type) {
    gameType = type;
    renderSelectionPage();
}

function renderSelectionPage() {
    document.getElementById('current-game-title').innerText = "2. 選取練習詞彙";
    const stage = document.getElementById('game-stage');
    stage.innerHTML = `
        <button class="back-btn" onclick="renderLevelSelect()">⇠ 返回</button>
        <div class="search-bar-container"><input type="text" id="vocabSearch" placeholder="🔍 搜尋..." onkeyup="updateSelectionList(this.value.toLowerCase())"></div>
        <div id="selection-content"></div>
        <div style="text-align:right; margin-top:20px;"><button class="action-btn" style="background:#10AC84; padding:15px 35px; border-radius:15px; font-size:1.2rem;" onclick="proceed()">開始活動 ➔</button></div>`;
    updateSelectionList();
}

// 1. 修復點擊失效：確保 toggleSelect 被正確呼叫
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
                // 這裡必須使用 onclick 直接綁定到 HTML 確保 iPad 點擊靈敏
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
    if(idx > -1) selectedCards.splice(idx, 1);
    else selectedCards.push(vocabList.find(v => v.id === id));
    // 重新渲染清單以顯示 active 狀態
    const query = document.getElementById('vocabSearch')?.value.toLowerCase() || "";
    updateSelectionList(query);
}

function proceed() {
    if(selectedCards.length === 0) return alert("請先選取卡片");
    gameType === 'free' ? runChallenge() : renderPrep();
}

function renderPrep() {
    document.getElementById('current-game-title').innerText = "3. 教學預覽";
    const stage = document.getElementById('game-stage');
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
        <div style="text-align:center;"><button class="action-btn" style="background:#FF9F43; padding:20px 40px; border-radius:20px; font-size:1.3rem;" onclick="runChallenge()">正式開始遊戲！🚀</button></div>`;
}

function runChallenge() {
    document.getElementById('current-game-title').innerText = "活動進行中";
    const stage = document.getElementById('game-stage');
    const cats = gameType === 'fixed' ? [...new Set(selectedCards.map(c => c.category))] : ["盒子1", "盒子2"];
    const colors = ["#FF6B6B", "#48DBFB", "#1DD1A1", "#Feca57"];

    stage.innerHTML = `
        <button class="back-btn" onclick="${gameType==='free'?'renderSelectionPage()':'renderPrep()'}">⇠ 返回</button>
        <div id="pool" class="challenge-pool"></div>
        <div class="bin-container">
            ${cats.map((cat, i) => `
                <div class="bin" style="${gameType==='free' ? 'border-color:'+colors[i%4] : ''}">
                    ${gameType === 'fixed' ? `<div class="bin-header" style="background:${colors[i%4]}"><img src="images/categories/${cat}.png" onerror="this.style.display='none'"><span>${cat}</span></div>` : ''}
                    <div class="drop-zone" data-cat="${cat}"></div>
                </div>`).join('')}
        </div>
        ${gameType==='free' ? '<button class="action-btn" style="background:#10AC84; margin:20px auto; display:block; padding:15px 40px; border-radius:20px; font-size:1.2rem;" onclick="finish()">完成活動 ✅</button>' : ''}`;

    toggleTextDisplay();
    const pool = document.getElementById('pool');
    [...selectedCards].sort(()=>0.5-Math.random()).forEach(c => {
        const d = document.createElement('div'); d.className='card'; d.dataset.cat=c.category;
        d.innerHTML=`<img src="images/${c.img}"><p>${c.name}</p>`; pool.appendChild(d);
    });

    [pool, ...document.querySelectorAll('.drop-zone')].forEach(z => {
        new Sortable(z, { group:'sort', animation:150, onAdd: (e) => { if(gameType==='fixed') check(); else showFX(e.item, true); } });
    });
}

function check() {
    const pool = document.getElementById('pool');
    const bins = document.querySelectorAll('.bin .drop-zone');
    let mistakes = 0; let placed = 0;
    bins.forEach(bin => {
        const target = bin.dataset.cat;
        bin.querySelectorAll('.card').forEach(card => {
            placed++;
            const ok = card.dataset.cat === target;
            showFX(card, ok);
            if(!ok) mistakes++;
        });
    });
    if(pool.children.length === 0 && mistakes === 0 && placed === selectedCards.length) finish();
}

function showFX(el, ok) {
    const old = el.querySelector('.feedback-star, .feedback-wrong'); if(old) old.remove();
    const fx = document.createElement('div'); fx.className = ok ? 'feedback-star' : 'feedback-wrong';
    fx.innerText = ok ? '⭐' : '❌'; el.appendChild(fx);
    const snd = document.getElementById(ok ? 'snd-star' : 'snd-wrong');
    if(snd){ snd.currentTime=0; snd.play(); }
    setTimeout(() => fx.remove(), 800);
}

function finish() {
    const s = document.getElementById('snd-hooray'); if(s) s.play();
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
}

async function takeScreenshot() {
    const stage = document.getElementById('game-stage');
    const old = stage.style.overflowY; stage.style.overflowY = 'visible';
    const canvas = await html2canvas(document.getElementById('capture-area'), { useCORS: true, scale: 2 });
    stage.style.overflowY = old;
    const link = document.createElement('a'); link.download = `練習記錄.png`; link.href = canvas.toDataURL(); link.click();
}
