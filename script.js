/** 1. 數據加載 **/
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
let currentMode = '';
let currentStep = 'selection'; 
let gameTimer = null;
let namingScore = 0;
let ranLevel = 1;
let ranStars = { gold: 0, silver: 0 };

/** 2. 全局控制 **/
document.getElementById('sizeSlider').addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--card-size', `${e.target.value}px`);
});

document.getElementById('textToggle').addEventListener('change', (e) => {
    document.getElementById('game-stage').classList.toggle('hide-text', !e.target.checked);
});

document.getElementById('bgPicker').addEventListener('change', (e) => {
    const main = document.getElementById('capture-area');
    const val = e.target.value;
    main.style.backgroundImage = (val === 'white' || val === 'video') ? "none" : `url('images/${val}')`;
    main.style.backgroundSize = "cover";
});

/** 3. 導航 **/
function initGame(mode) {
    currentMode = mode;
    renderSelectionPage();
}

function goBack() {
    if (gameTimer) clearInterval(gameTimer);
    if (currentStep === 'prep') renderSelectionPage();
    else if (currentStep === 'levelSelect') renderPrepPage();
    else if (currentStep === 'game') renderPrepPage();
}

/** --- 階段 1: 選取 (所有遊戲共用) --- **/
function renderSelectionPage() {
    currentStep = 'selection';
    const stage = document.getElementById('game-stage');
    document.getElementById('current-game-title').innerText = "步驟 1: 選取卡片";

    stage.innerHTML = `
        <div style="display:flex; gap:10px; margin-bottom:20px;">
            <input type="text" id="vocabSearch" placeholder="🔍 搜尋名稱..." onkeyup="filterSelection()">
            <select id="categoryFilter" style="width:200px" onchange="filterSelection()">
                <option value="all">所有類別</option>
                ${[...new Set(vocabList.map(v => v.category))].map(c => `<option value="${c}">${c}</option>`).join('')}
            </select>
        </div>
        <div class="selection-grid" id="s-grid"></div>
        <div style="margin-top:30px; text-align:right;">
            <button class="action-btn" style="background:#10AC84" onclick="renderPrepPage()">繼續 ➔</button>
        </div>
    `;
    filterSelection();
}

function filterSelection() {
    const query = document.getElementById('vocabSearch')?.value.toLowerCase() || "";
    const cat = document.getElementById('categoryFilter')?.value || "all";
    const filtered = vocabList.filter(v => v.name.includes(query) && (cat === "all" || v.category === cat));
    const grid = document.getElementById('s-grid');
    grid.innerHTML = "";
    filtered.forEach(item => {
        const isActive = selectedCards.some(c => c.id === item.id);
        const div = document.createElement('div');
        div.className = `select-item ${isActive ? 'active' : ''}`;
        div.innerHTML = `<img src="images/${item.img}"><p>${item.name}</p>`;
        div.onclick = () => {
            div.classList.toggle('active');
            const idx = selectedCards.findIndex(c => c.id === item.id);
            if(idx > -1) selectedCards.splice(idx, 1);
            else selectedCards.push(item);
        };
        grid.appendChild(div);
    });
}

/** --- 階段 2: 教學/準備 (所有遊戲共用) --- **/
function renderPrepPage() {
    if (selectedCards.length === 0) return alert("請先選取卡片");
    currentStep = 'prep';
    const stage = document.getElementById('game-stage');
    document.getElementById('current-game-title').innerText = "步驟 2: 教學與預覽";

    stage.innerHTML = `
        <button class="back-btn" onclick="goBack()">⇠ 返回選取</button>
        <div style="display:flex; flex-wrap:wrap; justify-content:center; flex-grow:1;">
            ${selectedCards.map(c => `<div class="card"><img src="images/${c.img}"><p>${c.name}</p></div>`).join('')}
        </div>
        <div style="text-align:center; padding:30px;">
            <button class="action-btn" style="padding:25px 80px;" onclick="renderLevelSelect()">進入活動 🚀</button>
        </div>
    `;
}

/** --- 階段 3: 等級/設定 (針對不同遊戲) --- **/
function renderLevelSelect() {
    currentStep = 'levelSelect';
    const stage = document.getElementById('game-stage');
    
    if (currentMode === 'sorting') {
        document.getElementById('current-game-title').innerText = "選擇分類等級";
        stage.innerHTML = `
            <button class="back-btn" onclick="goBack()">⇠ 返回教學</button>
            <div style="text-align:center; padding-top:50px;">
                <button class="action-btn" style="display:block; margin:20px auto; width:350px;" onclick="runSorting('fixed')">等級 1: 標準分類 (按類別)</button>
                <button class="action-btn" style="display:block; margin:20px auto; width:350px; background:#f39c12;" onclick="runSorting('free')">等級 2: 自由分類</button>
            </div>`;
    } else if (currentMode === 'naming') {
        document.getElementById('current-game-title').innerText = "設定計時器";
        stage.innerHTML = `
            <button class="back-btn" onclick="goBack()">⇠ 返回教學</button>
            <div style="text-align:center; padding-top:50px;">
                <p style="font-size:1.5rem">選擇練習時間：</p>
                <select id="timerVal" style="width:200px; margin-bottom:30px;">
                    <option value="15">15 秒</option><option value="30" selected>30 秒</option><option value="60">60 秒</option>
                </select>
                <button class="action-btn" style="display:block; margin:20px auto;" onclick="runNaming()">開始命名挑戰 💣</button>
            </div>`;
    } else if (currentMode === 'ran') {
        document.getElementById('current-game-title').innerText = "快速命名準備";
        stage.innerHTML = `
            <button class="back-btn" onclick="goBack()">⇠ 返回教學</button>
            <div style="text-align:center; padding-top:50px;">
                <p style="font-size:1.5rem">準備好進行 10 關挑戰了嗎？</p>
                <button class="action-btn" onclick="runRAN()">開始挑戰 ⭐</button>
            </div>`;
    }
}

/** --- 遊戲 1: 分類遊戲 --- **/
function runSorting(type) {
    currentStep = 'game';
    const stage = document.getElementById('game-stage');
    const cats = type === 'fixed' ? [...new Set(selectedCards.map(c => c.category))] : ["組別 A", "組別 B"];
    const colors = ["#FF6B6B", "#48DBFB", "#1DD1A1", "#Feca57"];

    stage.innerHTML = `
        <button class="back-btn" onclick="goBack()">⇠ 返回</button>
        <div id="pool" class="drop-zone" style="background:rgba(255,255,255,0.4); border:3px solid #ddd; border-radius:20px; margin-bottom:20px;"></div>
        <div class="bin-container">
            ${cats.map((cat, i) => `
                <div class="bin">
                    <div class="bin-header" style="background:${colors[i%4]}">${cat}</div>
                    <div class="drop-zone" id="bin-${i}"></div>
                </div>`).join('')}
        </div>`;
    
    const pool = document.getElementById('pool');
    selectedCards.forEach(c => pool.innerHTML += `<div class="card"><img src="images/${c.img}"><p>${c.name}</p></div>`);
    [pool, ...document.querySelectorAll('.drop-zone')].forEach(z => new Sortable(z, { group: 'sort', animation: 150 }));
}

/** --- 遊戲 2: 擴展性命名 (炸彈計時器) --- **/
function runNaming() {
    currentStep = 'game';
    namingScore = 0;
    const timeLimit = parseInt(document.getElementById('timerVal').value);
    const stage = document.getElementById('game-stage');
    let timeLeft = timeLimit;

    stage.innerHTML = `
        <div class="timer-container"><div id="timer-bar"></div><div class="timer-icon">💣</div></div>
        <div style="text-align:center;">
            <h1 id="scoreDisp" style="font-size:120px; margin:20px;">0</h1>
            <button id="addBtn" style="width:250px; height:250px; border-radius:50%; font-size:50px; background:#10AC84; color:white; border:none; cursor:pointer; box-shadow:0 10px 0 #0d8a6a;">+1</button>
        </div>`;

    const bar = document.getElementById('timer-bar');
    gameTimer = setInterval(() => {
        timeLeft--;
        bar.style.width = (timeLeft/timeLimit * 100) + "%";
        if(timeLeft <= 0) { clearInterval(gameTimer); alert("時間到！💣"); showResult('naming', namingScore); }
    }, 1000);

    document.getElementById('addBtn').onclick = () => { namingScore++; document.getElementById('scoreDisp').innerText = namingScore; };
}

/** --- 遊戲 3: 快速命名 (10 關挑戰) --- **/
function runRAN() {
    currentStep = 'game';
    ranLevel = 1;
    ranStars = { gold: 0, silver: 0 };
    renderRANRound();
}

function renderRANRound() {
    if(ranLevel > 10) return showResult('ran', ranStars);
    const stage = document.getElementById('game-stage');
    let startTime = Date.now();

    stage.innerHTML = `
        <div style="text-align:center;">
            <h2>第 ${ranLevel} / 10 關</h2>
            <div id="ran-grid" style="display:flex; justify-content:center; margin:30px 0;">
                ${[...selectedCards].sort(() => 0.5 - Math.random()).slice(0, 4).map(c => `
                    <div class="card"><img src="images/${c.img}"><p>${c.name}</p></div>`).join('')}
            </div>
            <button class="action-btn" style="background:#EE5253" onclick="finishRANRound(${startTime})">完成命名！✅</button>
        </div>`;
}

function finishRANRound(start) {
    let duration = (Date.now() - start) / 1000;
    if(duration < 5) ranStars.gold++; else ranStars.silver++;
    ranLevel++;
    renderRANRound();
}

/** --- 結果與導出 --- **/
function showResult(type, data) {
    const stage = document.getElementById('game-stage');
    let content = type === 'naming' ? `<h2>總得分：${data} 分</h2>` : `<h2>挑戰完成！</h2><p>金星: ${data.gold} | 銀星: ${data.silver}</p>`;
    
    stage.innerHTML = `
        <div style="text-align:center; padding:50px; background:white; border-radius:30px; border:5px solid #2d3436;">
            <h1>🎉 練習完成！</h1>
            ${content}
            <div style="display:flex; flex-wrap:wrap; justify-content:center; margin-top:30px;">
                ${selectedCards.map(c => `<div style="margin:5px"><img src="images/${c.img}" width="60"><p style="font-size:12px">${c.name}</p></div>`).join('')}
            </div>
            <button class="action-btn" style="margin-top:30px;" onclick="initGame('${currentMode}')">再玩一次</button>
        </div>`;
}

function takeScreenshot() {
    html2canvas(document.getElementById('capture-area'), {scale: 2}).then(canvas => {
        const link = document.createElement('a');
        link.download = `練習記錄_${new Date().toLocaleDateString()}.png`;
        link.href = canvas.toDataURL();
        link.click();
    });
}
