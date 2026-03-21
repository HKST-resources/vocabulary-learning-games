/** 1. 數據與變數 **/
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
let gameType = 'fixed'; // 'fixed' (按類別) or 'free' (自由)
let currentStep = 1;

/** 2. 核心控制 **/
document.getElementById('sizeSlider').addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--card-size', `${e.target.value}px`);
});

document.getElementById('bgPicker').addEventListener('change', (e) => {
    const main = document.getElementById('capture-area');
    const val = e.target.value;
    main.style.backgroundImage = (val === 'white' || val === 'video') ? "none" : `url('images/${val}')`;
});

/** 3. 遊戲流程導航 **/
function initGame(mode) {
    if (mode === 'sorting') renderSortingLevelSelect();
    else alert("開發中...");
}

/** 頁面 1: 選擇等級 **/
function renderSortingLevelSelect() {
    currentStep = 1;
    const stage = document.getElementById('game-stage');
    document.getElementById('current-game-title').innerText = "1. 選擇分類方式";
    stage.innerHTML = `
        <div style="text-align:center; padding-top:100px;">
            <button class="action-btn" style="background:var(--color-sorting); margin:20px;" onclick="setSortingType('fixed')">按類別分類</button>
            <button class="action-btn" style="background:#f39c12; margin:20px;" onclick="setSortingType('free')">自由分類</button>
        </div>`;
}

function setSortingType(type) {
    gameType = type;
    renderSelectionPage();
}

/** 頁面 2: 選取詞彙 (分區顯示) **/
function renderSelectionPage() {
    currentStep = 2;
    const stage = document.getElementById('game-stage');
    document.getElementById('current-game-title').innerText = "2. 選取練習詞彙";
    
    const categories = [...new Set(vocabList.map(v => v.category))];
    let html = `<button class="back-btn" onclick="renderSortingLevelSelect()">⇠ 返回</button><br><br>`;
    
    categories.forEach(cat => {
        const items = vocabList.filter(v => v.category === cat);
        html += `
            <div class="category-section">
                <span class="category-title">${cat}</span>
                <div class="selection-grid">
                    ${items.map(item => {
                        const isActive = selectedCards.some(c => c.id === item.id);
                        return `<div class="select-item ${isActive ? 'active' : ''}" id="sel-${item.id}" onclick="toggleSelect(${item.id})">
                            <img src="images/${item.img}"><p>${item.name}</p>
                        </div>`;
                    }).join('')}
                </div>
            </div>`;
    });

    html += `<div style="text-align:right;"><button class="action-btn" style="background:#10AC84" onclick="renderPrepBoard()">繼續 ➔</button></div>`;
    stage.innerHTML = html;
}

function toggleSelect(id) {
    const idx = selectedCards.findIndex(c => c.id === id);
    const item = vocabList.find(v => v.id === id);
    if(idx > -1) selectedCards.splice(idx, 1);
    else selectedCards.push(item);
    document.getElementById(`sel-${id}`).classList.toggle('active');
}

/** 頁面 3: 準備板 **/
function renderPrepBoard() {
    if(selectedCards.length === 0) return alert("請先選取卡片");
    currentStep = 3;
    const stage = document.getElementById('game-stage');
    document.getElementById('current-game-title').innerText = "3. 教學預覽";

    const cats = [...new Set(selectedCards.map(c => c.category))];
    const binColors = ["#FF6B6B", "#48DBFB", "#1DD1A1", "#Feca57"];

    stage.innerHTML = `
        <button class="back-btn" onclick="renderSelectionPage()">⇠ 返回選取</button>
        <div class="bin-container" style="margin-top:20px;">
            ${cats.map((cat, i) => `
                <div class="bin">
                    <div class="bin-header" style="background:${binColors[i%4]}">
                        <img src="images/categories/${cat}.png" onerror="this.style.display='none'">
                        ${cat}
                    </div>
                    <div style="padding:10px; display:flex; flex-wrap:wrap;">
                        ${selectedCards.filter(c => c.category === cat).map(c => `
                            <div class="card" style="width:100px;"><img src="images/${c.img}"><p>${c.name}</p></div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
        <div style="text-align:center; padding:30px;">
            <button class="action-btn" style="background:var(--color-sorting); font-size:1.6rem;" onclick="runSortingChallenge()">開始活動！🚀</button>
        </div>`;
}

/** 頁面 4: 正式挑戰 **/
function runSortingChallenge() {
    currentStep = 4;
    const stage = document.getElementById('game-stage');
    document.getElementById('current-game-title').innerText = "4. 分類挑戰！";

    const cats = gameType === 'fixed' ? [...new Set(selectedCards.map(c => c.category))] : ["組別 A", "組別 B"];
    const binColors = ["#FF6B6B", "#48DBFB", "#1DD1A1", "#Feca57"];

    stage.innerHTML = `
        <button class="back-btn" onclick="renderPrepBoard()">⇠ 返回</button>
        <div id="pool" class="challenge-pool"></div>
        <div class="bin-container">
            ${cats.map((cat, i) => `
                <div class="bin">
                    <div class="bin-header" style="background:${binColors[i%4]}">
                        <img src="images/categories/${cat}.png" onerror="this.style.display='none'">
                        ${gameType === 'fixed' ? cat : '自由分類'}
                    </div>
                    <div class="drop-zone" id="bin-${i}" data-cat="${cat}"></div>
                </div>
            `).join('')}
        </div>
        ${gameType === 'free' ? '<div style="text-align:center; padding:20px;"><button class="action-btn" style="background:#10AC84" onclick="playHooray()">完成 ✅</button></div>' : ''}
    `;

    const pool = document.getElementById('pool');
    [...selectedCards].sort(() => 0.5 - Math.random()).forEach(c => {
        const div = document.createElement('div');
        div.className = 'card';
        div.dataset.cat = c.category;
        div.innerHTML = `<img src="images/${c.img}"><p>${c.name}</p>`;
        pool.appendChild(div);
    });

    [pool, ...document.querySelectorAll('.drop-zone')].forEach(el => {
        new Sortable(el, { 
            group: 'sortGroup', 
            animation: 150,
            onAdd: (evt) => {
                if(gameType === 'fixed') checkMatch(evt);
            }
        });
    });
}

/** 邏輯：檢查正確性 **/
function checkMatch(evt) {
    const itemCat = evt.item.dataset.cat;
    const binCat = evt.to.dataset.cat;

    if(itemCat === binCat) {
        showFeedback(evt.item, 'star');
        playSound('snd-star');
        checkAutoWin();
    } else {
        showFeedback(evt.item, 'wrong');
        playSound('snd-wrong');
        // 自動彈回 pool (可選)
        // document.getElementById('pool').appendChild(evt.item);
    }
}

function checkAutoWin() {
    const poolItems = document.getElementById('pool').children.length;
    if(poolItems === 0) {
        // 檢查是否全部都在正確的 bin
        const allCorrect = Array.from(document.querySelectorAll('.drop-zone')).every(zone => {
            const binCat = zone.dataset.cat;
            return Array.from(zone.children).every(card => card.dataset.cat === binCat);
        });
        if(allCorrect) playHooray();
    }
}

/** 輔助：音效與特效 **/
function playSound(id) {
    const s = document.getElementById(id);
    if(s) { s.currentTime = 0; s.play(); }
}

function playHooray() {
    playSound('snd-hooray');
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
}

function showFeedback(el, type) {
    const rect = el.getBoundingClientRect();
    const effect = document.createElement('div');
    effect.className = type === 'star' ? 'feedback-star' : 'feedback-wrong';
    effect.innerText = type === 'star' ? '⭐' : '❌';
    effect.style.left = rect.left + 'px';
    effect.style.top = rect.top + 'px';
    document.body.appendChild(effect);
    setTimeout(() => effect.remove(), 800);
}

/** 匯出截圖：完整高度版本 **/
function takeScreenshot() {
    const area = document.getElementById('capture-area');
    // 獲取區域的完整滾動高度與寬度
    const fullHeight = area.scrollHeight;
    const fullWidth = area.scrollWidth;

    html2canvas(area, {
        useCORS: true,
        scale: 2,
        height: fullHeight,
        windowHeight: fullHeight,
        width: fullWidth,
        scrollY: 0,
        onclone: (clonedDoc) => {
            // 確保截圖時不顯示滾動條
            clonedDoc.getElementById('game-stage').style.overflow = 'visible';
        }
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `練習記錄_${new Date().toLocaleDateString()}.png`;
        link.href = canvas.toDataURL();
        link.click();
    });
}
