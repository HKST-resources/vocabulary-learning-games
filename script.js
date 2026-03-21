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

// --- 1. 背景與 Slider 控制 ---
document.getElementById('bgPicker').addEventListener('change', (e) => {
    const main = document.getElementById('capture-area');
    const bgVideo = document.getElementById('bg-video');
    const val = e.target.value;
    main.style.backgroundImage = "none";
    bgVideo.style.display = "none";
    bgVideo.pause();

    if (val === 'white') main.style.backgroundColor = "white";
    else if (val.endsWith('.mp4')) {
        bgVideo.src = `video/${val}`;
        bgVideo.style.display = "block";
        bgVideo.muted = true; 
        bgVideo.play().catch(err => console.log("Video play blocked"));
    } else {
        main.style.backgroundImage = `url('images/${val}')`;
        main.style.backgroundColor = "transparent";
    }
});

document.getElementById('sizeSlider').addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--card-size', `${e.target.value}px`);
});

function toggleTextDisplay() {
    const isChecked = document.getElementById('textToggle').checked;
    const stage = document.getElementById('game-stage');
    if (isChecked) stage.classList.remove('hide-text');
    else stage.classList.add('hide-text');
}

// --- 2. 遊戲核心流程 ---
function initGame(mode) {
    if (mode === 'sorting') renderLevelSelect();
}

function renderLevelSelect() {
    const stage = document.getElementById('game-stage');
    document.getElementById('current-game-title').innerText = "1. 選擇分類方式";
    stage.innerHTML = `
        <div style="text-align:center; padding-top:100px;">
            <button class="action-btn btn-fixed" style="margin:20px;" onclick="startSelection('fixed')">按類別分類</button>
            <button class="action-btn btn-free" style="margin:20px;" onclick="startSelection('free')">自由分類</button>
        </div>`;
}

function startSelection(type) {
    gameType = type;
    renderSelectionPage();
}

function renderSelectionPage() {
    const stage = document.getElementById('game-stage');
    document.getElementById('current-game-title').innerText = "2. 選取練習詞彙";
    stage.innerHTML = `
        <button class="back-btn" onclick="renderLevelSelect()">⇠ 返回</button>
        <div class="search-bar-container"><input type="text" id="vocabSearch" placeholder="🔍 搜尋..." onkeyup="filterVocabs()"></div>
        <div id="selection-content"></div>
        <div style="text-align:right; margin-top:20px;"><button class="action-btn" style="background:#10AC84; padding:15px 30px; border-radius:15px;" onclick="proceed()">開始活動 ➔</button></div>`;
    updateSelectionList();
}

function filterVocabs() {
    updateSelectionList(document.getElementById('vocabSearch').value.toLowerCase());
}

function updateSelectionList(query = "") {
    const container = document.getElementById('selection-content');
    const categories = [...new Set(vocabList.map(v => v.category))];
    let html = "";
    categories.forEach(cat => {
        const items = vocabList.filter(v => v.category === cat && v.name.toLowerCase().includes(query));
        if (items.length > 0) {
            html += `<div class="category-section"><span class="category-title">${cat}</span><div class="selection-grid">`;
            items.forEach(item => {
                const active = selectedCards.some(c => c.id === item.id) ? 'active' : '';
                html += `<div class="select-item ${active}" id="sel-${item.id}" onclick="toggleSelect(${item.id})">
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
    document.getElementById(`sel-${id}`).classList.toggle('active');
}

function proceed() {
    if(selectedCards.length === 0) return alert("請先選取卡片");
    if(gameType === 'free') runChallenge(); else renderPrep();
}

function renderPrep() {
    const stage = document.getElementById('game-stage');
    document.getElementById('current-game-title').innerText = "3. 教學預覽";
    const cats = [...new Set(selectedCards.map(c => c.category))];
    const colors = ["#FF6B6B", "#48DBFB", "#1DD1A1", "#Feca57"];
    stage.innerHTML = `
        <button class="back-btn" onclick="renderSelectionPage()">⇠ 返回選取</button>
        <div class="bin-container">
            ${cats.map((cat, i) => `
                <div class="bin"><div class="bin-header" style="background:${colors[i%4]}"><img src="images/categories/${cat}.png" onerror="this.style.display='none'">${cat}</div>
                <div class="drop-zone">${selectedCards.filter(c => c.category === cat).map(c => `<div class="card"><img src="images/${c.img}"><p>${c.name}</p></div>`).join('')}</div></div>`).join('')}
        </div>
        <div style="text-align:center;"><button class="action-btn" style="background:#FF9F43; padding:20px 40px; border-radius:20px;" onclick="runChallenge()">正式開始！🚀</button></div>`;
}

function runChallenge() {
    const stage = document.getElementById('game-stage');
    document.getElementById('current-game-title').innerText = "活動進行中";
    const cats = gameType === 'fixed' ? [...new Set(selectedCards.map(c => c.category))] : ["Box1", "Box2"];
    const colors = ["#FF6B6B", "#48DBFB", "#1DD1A1", "#Feca57"];

    stage.innerHTML = `
        <button class="back-btn" onclick="${gameType==='free'?'renderSelectionPage()':'renderPrep()'}">⇠ 返回</button>
        <div id="pool" class="challenge-pool"></div>
        <div class="bin-container">
            ${cats.map((cat, i) => `<div class="bin" style="${gameType==='free'?'border-color:'+colors[i%4]:''}">
                ${gameType==='fixed'?`<div class="bin-header" style="background:${colors[i%4]}"><img src="images/categories/${cat}.png" onerror="this.style.display='none'">${cat}</div>`:''}
                <div class="drop-zone" data-cat="${cat}"></div></div>`).join('')}
        </div>
        ${gameType==='free'?'<button class="action-btn" style="background:#10AC84; margin:20px auto; display:block; padding:15px 40px; border-radius:20px;" onclick="finish()">完成 ✅</button>':''}`;

    toggleTextDisplay();
    const pool = document.getElementById('pool');
    [...selectedCards].sort(()=>0.5-Math.random()).forEach(c => {
        const d = document.createElement('div'); d.className='card'; d.dataset.cat=c.category;
        d.innerHTML=`<img src="images/${c.img}"><p>${c.name}</p>`; pool.appendChild(d);
    });

    [pool, ...document.querySelectorAll('.drop-zone')].forEach(z => {
        new Sortable(z, { group:'sort', animation:150, onAdd: (e) => { if(gameType==='fixed') check(); else if(e.to.id !== 'pool') playSound('snd-star'); } });
    });
}

function check() {
    const pool = document.getElementById('pool');
    const allBins = document.querySelectorAll('.bin .drop-zone');
    let mistakes = 0;
    let placedCards = 0;

    allBins.forEach(bin => {
        const target = bin.dataset.cat;
        bin.querySelectorAll('.card').forEach(card => {
            placedCards++;
            const correct = card.dataset.cat === target;
            showFX(card, correct);
            if(!correct) mistakes++;
        });
    });

    if(pool.children.length === 0 && mistakes === 0 && placedCards === selectedCards.length) finish();
}

function showFX(el, ok) {
    const old = el.querySelector('.feedback-star, .feedback-wrong'); if(old) old.remove();
    const fx = document.createElement('div'); fx.className = ok ? 'feedback-star' : 'feedback-wrong';
    fx.innerText = ok ? '⭐' : '❌'; el.appendChild(fx);
    playSound(ok ? 'snd-star' : 'snd-wrong');
    setTimeout(() => fx.remove(), 800);
}

function playSound(id) { const s = document.getElementById(id); if(s){ s.currentTime=0; s.play(); } }

function finish() { playSound('snd-hooray'); confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } }); }

async function takeScreenshot() {
    const stage = document.getElementById('game-stage');
    const originalStyle = stage.style.overflowY;
    stage.style.overflowY = 'visible';
    const canvas = await html2canvas(document.getElementById('capture-area'), {
        useCORS: true, scale: 2, scrollY: -window.scrollY,
        height: document.getElementById('capture-area').scrollHeight,
        windowHeight: document.getElementById('capture-area').scrollHeight
    });
    stage.style.overflowY = originalStyle;
    const link = document.createElement('a');
    link.download = `練習記錄_${new Date().toISOString().slice(0,10)}.png`;
    link.href = canvas.toDataURL(); link.click();
}
