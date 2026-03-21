/** 1. DATA LOADER (Example with your 200 items) **/
const bulkVocabData = `
水果,蘋果,fruits/蘋果.png
水果,香蕉,fruits/香蕉.png
動物,獅子,animals/獅子.png
動物,老虎,animals/老虎.png
交通,巴士,transport/巴士.png
`.trim();

const vocabList = bulkVocabData.split('\n').map((line, i) => {
    const [category, name, path] = line.split(',');
    return { id: i, category: category.trim(), name: name.trim(), img: path.trim() };
});

let selectedCards = [];
let namingCount = 0;

/** 2. DYNAMIC SETTINGS **/
document.getElementById('sizeSlider').addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--card-size', `${e.target.value}px`);
});

document.getElementById('textToggle').addEventListener('change', (e) => {
    document.getElementById('game-stage').classList.toggle('hide-text', !e.target.checked);
});

// UPDATED: Handles any image filename you put in the <option> value
document.getElementById('bgPicker').addEventListener('change', (e) => {
    const main = document.getElementById('capture-area');
    const video = document.getElementById('bg-video');
    const val = e.target.value;

    // Reset
    main.style.backgroundImage = "none";
    video.style.display = "none";

    if (val === "white") {
        main.style.backgroundColor = "white";
    } else if (val === "video") {
        video.style.display = "block";
        video.src = "images/distraction.mp4";
    } else {
        // Sets background to the filename provided in the dropdown
        main.style.backgroundImage = `url('images/${val}')`;
        main.style.backgroundSize = "cover";
        main.style.backgroundPosition = "center";
    }
});

/** 3. NAVIGATION & SELECTION (With Search/Filter) **/
function initGame(type) {
    selectedCards = [];
    renderSelectionPage(type);
}

function renderSelectionPage(gameMode) {
    const stage = document.getElementById('game-stage');
    document.getElementById('current-game-title').innerText = "選取詞彙";

    stage.innerHTML = `
        <div class="selection-controls-top">
            <input type="text" id="vocabSearch" placeholder="搜尋詞彙..." onkeyup="filterSelection()">
            <select id="categoryFilter" onchange="filterSelection()">
                <option value="all">所有類別</option>
                ${[...new Set(vocabList.map(v => v.category))].map(c => `<option value="${c}">${c}</option>`).join('')}
            </select>
        </div>
        <div class="selection-grid" id="s-grid"></div>
        <div class="footer-controls">
            ${gameMode !== 'sorting' ? '<label>計時: <input type="number" id="timerVal" value="30" style="width:50px">s</label>' : ''}
            <button onclick="startGame('${gameMode}')" class="start-btn">開始活動</button>
        </div>
    `;
    renderGrid(vocabList);
}

function renderGrid(list) {
    const grid = document.getElementById('s-grid');
    grid.innerHTML = "";
    list.forEach(item => {
        const isSelected = selectedCards.some(c => c.id === item.id);
        const div = document.createElement('div');
        div.className = `select-item ${isSelected ? 'active' : ''}`;
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

function filterSelection() {
    const query = document.getElementById('vocabSearch').value.toLowerCase();
    const cat = document.getElementById('categoryFilter').value;
    const filtered = vocabList.filter(v => {
        const matchSearch = v.name.includes(query);
        const matchCat = (cat === "all" || v.category === cat);
        return matchSearch && matchCat;
    });
    renderGrid(filtered);
}

/** 4. GAME LOGIC (Integrated Versions) **/
function startGame(mode) {
    if(selectedCards.length === 0) return alert("請先選擇卡片！");
    const stage = document.getElementById('game-stage');
    if(mode === 'sorting') runSorting(stage);
    if(mode === 'naming') runNaming(stage);
    if(mode === 'ran') runRAN(stage);
}

function runSorting(stage) {
    const cats = [...new Set(selectedCards.map(c => c.category))];
    stage.innerHTML = `
        <div id="pool" class="drop-zone pool"></div>
        <div class="bin-container">
            ${cats.map(c => `<div class="bin"><div class="bin-header">${c}</div><div class="drop-zone" id="bin-${c}"></div></div>`).join('')}
        </div>
    `;
    const pool = document.getElementById('pool');
    selectedCards.forEach(c => pool.innerHTML += `<div class="card"><img src="images/${c.img}"><p class="card-p">${c.name}</p></div>`);
    [pool, ...document.querySelectorAll('.drop-zone')].forEach(el => new Sortable(el, { group: 'sort', animation: 150 }));
}

function runNaming(stage) {
    const sec = parseInt(document.getElementById('timerVal').value) || 30;
    namingCount = 0;
    stage.innerHTML = `
        <div class="card-container">${selectedCards.map(c => `<div class="card"><img src="images/${c.img}"><p class="card-p">${c.name}</p></div>`).join('')}</div>
        <button onclick="startNamingCounter(${sec})" class="start-btn">開始計時</button>
    `;
}

function startNamingCounter(sec) {
    const stage = document.getElementById('game-stage');
    let timeLeft = sec;
    stage.innerHTML = `
        <div class="timer-wrapper"><div id="timer-bar"></div></div>
        <h1 id="countDisp" style="font-size:100px">0</h1>
        <button id="addBtn" class="big-counter-btn">+1</button>
    `;
    const bar = document.getElementById('timer-bar');
    const interval = setInterval(() => {
        timeLeft--;
        bar.style.width = (timeLeft/sec * 100) + "%";
        if(timeLeft <= 0) { clearInterval(interval); showResult('naming', namingCount, sec); }
    }, 1000);
    document.getElementById('addBtn').onclick = () => { namingCount++; document.getElementById('countDisp').innerText = namingCount; };
}

function runRAN(stage) {
    let level = 1;
    let stars = { bright: 0, dull: 0 };
    const sec = parseInt(document.getElementById('timerVal').value) || 10;

    function nextRAN() {
        if(level > 10) return showResult('ran', stars);
        let timeLeft = sec;
        stage.innerHTML = `<h3>Level ${level}/10</h3><div class="card-container" id="ran-box"></div><button id="done">完成</button>`;
        const box = document.getElementById('ran-box');
        [...selectedCards].sort(() => 0.5 - Math.random()).slice(0, 4).forEach(c => {
            box.innerHTML += `<div class="card"><img src="images/${c.img}"><p class="card-p">${c.name}</p></div>`;
        });
        const timer = setInterval(() => timeLeft--, 1000);
        document.getElementById('done').onclick = () => {
            clearInterval(timer);
            if(timeLeft > 0) stars.bright++; else stars.dull++;
            level++; nextRAN();
        };
    }
    nextRAN();
}

function showResult(game, score, time) {
    const stage = document.getElementById('game-stage');
    stage.innerHTML = `
        <div class="result-page">
            <h2>練習完畢</h2>
            <p>模式: ${game.toUpperCase()}</p>
            <div class="card-container">${selectedCards.map(c => `<div class="card" style="width:80px"><img src="images/${c.img}"><p>${c.name}</p></div>`).join('')}</div>
        </div>
    `;
}

function takeScreenshot() {
    html2canvas(document.getElementById('capture-area')).then(canvas => {
        const link = document.createElement('a');
        link.download = `練習結果.png`;
        link.href = canvas.toDataURL();
        link.click();
    });
}
