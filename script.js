/** 1. DATA LOADER **/
const bulkVocabData = `
水果,蘋果,apple.png
水果,香蕉,banana.png
水果,橙,orange.png
動物,獅子,lion.png
動物,老虎,tiger.png
動物,大象,elephant.png
交通,巴士,bus.png
交通,的士,taxi.png
`.trim();

const vocabList = bulkVocabData.split('\n').map((line, i) => {
    const [category, name, img] = line.split(',');
    return { id: i, category, name, img };
});

let selectedCards = [];
let currentTimer = null;
let namingCount = 0;

/** 2. GLOBAL CONTROLS **/
document.getElementById('sizeSlider').addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--card-size', `${e.target.value}px`);
});

document.getElementById('textToggle').addEventListener('change', (e) => {
    document.getElementById('game-stage').classList.toggle('hide-text', !e.target.checked);
});

document.getElementById('bgPicker').addEventListener('change', (e) => {
    const main = document.getElementById('capture-area');
    const video = document.getElementById('bg-video');
    main.className = ""; video.style.display = "none";
    if(e.target.value === 'theme') main.classList.add('bg-theme');
    if(e.target.value === 'video') { video.style.display = "block"; video.src = "images/distraction.mp4"; }
});

/** 3. NAVIGATION **/
function initGame(type) {
    selectedCards = [];
    const stage = document.getElementById('game-stage');
    const title = document.getElementById('current-game-title');
    stage.innerHTML = "";
    
    if(type === 'sorting') { title.innerText = "分類遊戲"; renderSelection(stage, 'sorting'); }
    if(type === 'naming') { title.innerText = "擴展性命名"; renderSelection(stage, 'naming'); }
    if(type === 'ran') { title.innerText = "快速命名"; renderSelection(stage, 'ran'); }
}

/** 4. SELECTION PHASE **/
function renderSelection(stage, gameMode) {
    stage.innerHTML = `
        <div class="setup-header">
            <h3>請選取目標詞彙 (點擊圖片):</h3>
            <div class="selection-grid" id="s-grid"></div>
            <div class="selection-controls">
                ${gameMode !== 'sorting' ? '<label>計時秒數: <select id="timerVal"><option value="10">10s</option><option value="20">20s</option><option value="30" selected>30s</option></select></label>' : ''}
                <button onclick="startGame('${gameMode}')" style="background:#28a745">開始活動</button>
            </div>
        </div>
    `;
    const grid = document.getElementById('s-grid');
    vocabList.forEach(item => {
        const div = document.createElement('div');
        div.className = "select-item";
        div.innerHTML = `<img src="images/${item.img}" style="width:100px"><p>${item.name}</p>`;
        div.onclick = () => {
            div.classList.toggle('active');
            const idx = selectedCards.findIndex(c => c.id === item.id);
            if(idx > -1) selectedCards.splice(idx, 1);
            else selectedCards.push({...item, freq: 1});
        };
        grid.appendChild(div);
    });
}

/** 5. GAME START LOGIC **/
function startGame(mode) {
    const stage = document.getElementById('game-stage');
    if(selectedCards.length === 0) return alert("請先選取詞彙");

    if(mode === 'sorting') runSorting(stage);
    if(mode === 'naming') runNaming(stage);
    if(mode === 'ran') runRAN(stage);
}

/** --- GAME 1: SORTING --- **/
function runSorting(stage) {
    const categories = [...new Set(selectedCards.map(c => c.category))];
    stage.innerHTML = `
        <div class="sorting-wrapper">
            <div id="pool" class="pool"></div>
            <div class="bin-container">
                ${categories.map(cat => `
                    <div class="bin">
                        <div class="bin-header">${cat}</div>
                        <div class="drop-zone" id="bin-${cat}"></div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    const pool = document.getElementById('pool');
    selectedCards.forEach(c => {
        pool.innerHTML += `<div class="card"><img src="images/${c.img}"><p class="card-p">${c.name}</p></div>`;
    });

    [pool, ...document.querySelectorAll('.drop-zone')].forEach(el => {
        new Sortable(el, { group: 'sortGroup', animation: 150 });
    });
}

/** --- GAME 2: NAMING --- **/
function runNaming(stage) {
    const timeLimit = parseInt(document.getElementById('timerVal').value);
    namingCount = 0;
    stage.innerHTML = `
        <div class="prep-screen">
            <div class="card-container">${selectedCards.map(c => `<div class="card"><img src="images/${c.img}"><p class="card-p">${c.name}</p></div>`).join('')}</div>
            <button onclick="startNamingTimer(${timeLimit})">開始計時</button>
        </div>
    `;
}

function startNamingTimer(sec) {
    const stage = document.getElementById('game-stage');
    stage.innerHTML = `
        <div id="timer-container"><div id="timer-bar"></div><div class="bomb-icon">💣</div></div>
        <h1 style="font-size:80px">${namingCount}</h1>
        <button onclick="namingCount++; startNamingTimer(${sec})" style="width:200px; height:200px; border-radius:50%; font-size:30px">計分 (+1)</button>
    `;
    // Timer Logic...
    let remaining = sec;
    const bar = document.getElementById('timer-bar');
    const interval = setInterval(() => {
        remaining--;
        bar.style.width = (remaining/sec * 100) + "%";
        if(remaining <= 0) {
            clearInterval(interval);
            showResult('naming', namingCount, sec);
        }
    }, 1000);
}

/** --- GAME 3: RAN --- **/
function runRAN(stage) {
    let level = 1;
    let stars = { bright: 0, dull: 0 };
    function renderRANLevel() {
        if(level > 10) return showResult('ran', stars);
        stage.innerHTML = `<h3>Level ${level} / 10</h3><div class="card-container" id="ran-box"></div><button id="nextRAN">完成 (Next)</button>`;
        const box = document.getElementById('ran-box');
        const shuffle = [...selectedCards].sort(() => 0.5 - Math.random()).slice(0, 4);
        shuffle.forEach(c => box.innerHTML += `<div class="card"><img src="images/${c.img}"><p class="card-p">${c.name}</p></div>`);
        
        document.getElementById('nextRAN').onclick = () => { level++; stars.bright++; renderRANLevel(); };
    }
    renderRANLevel();
}

/** RESULTS & EXPORT **/
function showResult(game, score, time) {
    const stage = document.getElementById('game-stage');
    stage.innerHTML = `
        <div class="result-page">
            <h2>活動完畢！</h2>
            <p>模式: ${game === 'naming' ? '擴展性命名' : '快速命名'}</p>
            <p>結果: ${score} 次</p>
            <hr>
            <h3>複習詞彙:</h3>
            <div class="card-container">${selectedCards.map(c => `<div class="card" style="width:100px"><img src="images/${c.img}"><p>${c.name}</p></div>`).join('')}</div>
        </div>
    `;
}

function takeScreenshot() {
    html2canvas(document.getElementById('capture-area')).then(canvas => {
        const link = document.createElement('a');
        link.download = `HK_Speech_HomePractice.png`;
        link.href = canvas.toDataURL();
        link.click();
    });
}
