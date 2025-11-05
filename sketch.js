// p5.js
// ...existing code...
let questionBank = [
    {id:1, q:"下列哪一個是 HTML 的標記語言？", choices:["Python","HTML","C++","SQL"], answer:1, feedback:"HTML 用來描述網頁結構。"},
    {id:2, q:"哪個標記用於建立超連結？", choices:["<a>","<div>","<img>","<span>"], answer:0, feedback:"<a> 用來建立超連結。"},
    {id:3, q:"CSS 用途為何？", choices:["伺服器端程式","資料庫管理","樣式與版面配置","影像編輯"], answer:2, feedback:"CSS 控制樣式與版面。"},
    {id:4, q:"JS 常用來做什麼？", choices:["資料庫備份","網頁互動","建立樹狀結構","編輯影片"], answer:1, feedback:"JavaScript 常用於網頁互動與行為。"},
    {id:5, q:"下列哪個不是程式語言？", choices:["Ruby","HTML","Go","Rust"], answer:1, feedback:"HTML 是標記語言，不是程式語言。"},
    {id:6, q:"HTTP 的主要用途是？", choices:["傳輸網頁資源","加密硬碟","編譯程式","管理使用者"], answer:0, feedback:"HTTP 是用來傳輸網頁資源的協定。"},
    {id:7, q:"哪一項可以用來建立響應式網頁？", choices:["CSS Media Queries","純 HTML","SQL 語法","Python 模組"], answer:0, feedback:"使用 Media Queries 等技術可實現響應式設計。"},
    {id:8, q:"哪個屬性可改變文字顏色？", choices:["background-color","font-size","color","border"], answer:2, feedback:"color 屬性用於設定文字顏色。"},
    {id:9, q:"課堂上介紹了哪兩種主要的 AI 輔助工具？", choices:["Gemini 與 Copilot","Siri 與 Alexa","ChatGPT 與 DALL-E","僅有 Gemini"], answer:0, feedback:"課堂上主要介紹了 Gemini 與 Copilot 作為 AI 輔助工具。"},
    {id:10, q:"上課需要安裝什麼軟體？", choices:["VScode", "Photoshop", "Excel", "Android Studio"], answer:0, feedback:"VScode 是我們上課主要的程式碼編輯器。"},
    {id:11, q:"上課是用什麼軟體做筆記？", choices:["HackMD", "Notion", "Evernote", "Word"], answer:0, feedback:"HackMD 是我們上課主要的筆記與共筆工具。"},
    {id:12, q:"禮拜幾上程式設計與實習？", choices:["禮拜一", "禮拜二", "禮拜三", "禮拜四"], answer:0, feedback:"程式設計與實習的上課時間是禮拜一。"},
    {id:13, q:"單元一的作品主題是什麼？", choices:["製作圓的特效與聲音", "製作方的特效與聲音", "製作三角的特效與聲音", "僅有圓的特效"], answer:0, feedback:"單元一的作品主題是製作圓的特效與聲音。"},
    {id:14, q:"禮拜一幾點開始上程式設計與實習？", choices:["9:10", "8:10", "10:10", "13:10"], answer:0, feedback:"程式設計與實習的上課時間是禮拜一早上 9:10。"}
];
let showImmediate = false;
let immediateTimer = 0;
let particles = [];
let sparkles = []; // 新增：用於鼓勵畫面的星光粒子
let confetti = [];
let buttons = [];
let exportBtn, startBtn, restartBtn;

// 新增：按鈕座標（用於 mousePressed 判斷）
let choiceRects = []; // 每個選項的座標
let btnX = 0, btnY = 0, btnW = 0, btnH = 0;

// 新增：intro 按鈕座標（全域）
let introBtnX = 0, introBtnY = 0, introBtnW = 0, introBtnH = 0;

// 新增：每題的選項顯示順序（隨機化）
let optionLayout = [];

// 新增：陣列洗牌（Fisher–Yates）
function shuffleArray(arr){
  for(let i = arr.length - 1; i > 0; i--){
    let j = floor(random(i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// 新增：準備當前題目的選項顯示順序（呼叫於 selectRandomQuestions 與換題時）
function prepareOptionLayout(){
  if(!selected || selected.length === 0) {
    optionLayout = [];
    return;
  }
  let q = selected[current];
  optionLayout = [];
  for(let i=0;i<q.choices.length;i++) optionLayout.push(i);
  shuffleArray(optionLayout);
}

// 新增：根據畫布寬度計算響應式文字大小
function getResponsiveTextSize(baseSize) {
  const scaleFactor = min(width / 1200, height / 800);
  const responsiveSize = baseSize * scaleFactor;
  return max(12, responsiveSize); // 確保最小字體不小於 12
}

function setup(){
// ...
    // 改為視窗的 80% 寬、90% 高
    createCanvas(windowWidth * 0.8, windowHeight * 0.9);
    w = width; h = height;

    // 必要的初始化 —— 確保題庫、按鈕與背景粒子被建立
    selectRandomQuestions();
    createButtons();
    for(let i=0;i<80;i++) particles.push(new Particle());
}

// 新增：視窗調整時同步變更畫布大小與儲存尺寸
function windowResized(){
  resizeCanvas(windowWidth * 0.8, windowHeight * 0.9);
  w = width; h = height;
  // 重新定位 DOM 按鈕，避免擋到文字
  updateButtonPositions();
  // 可選：重新產生粒子使分布均勻（不強制）
}

// 修改 createButtons：將按鈕移至 header 下方並移除「開始測驗」DOM按鈕（改由點擊畫面開始）
function createButtons(){
  // Export CSV button (DOM)
  exportBtn = createButton("匯出題庫 CSV");
  exportBtn.mousePressed(exportCSV);

  // Restart button (DOM)
  restartBtn = createButton("重新抽題");
  restartBtn.mousePressed(()=>{ selectRandomQuestions(); });

  // 以 function 控制位置（會在 setup 與 windowResized 呼叫）
  updateButtonPositions();
}

// 新增：將 DOM 按鈕定位在 header 下方右側，避免擋到 header 的文字
function updateButtonPositions(){
  // --- 按鈕響應式設計 ---
  // 基準：按鈕高度為畫布高度的 5%，最小 24px，最大 40px
  const btnH = constrain(height * 0.05, 24, 40);
  // 基準：字體大小為按鈕高度的 40%
  const fontSize = btnH * 0.4;
  // 基準：按鈕寬度根據內容和字體大小估算
  const restartBtnW = fontSize * 7.5;
  const exportBtnW = fontSize * 9;

  // 位置：基於畫布尺寸
  const padding = width * 0.015; // 右邊距
  const btnY = height * 0.08;    // Y 軸位置

  if(restartBtn){
    restartBtn.position(width - restartBtnW - padding, btnY);
    restartBtn.style('font-size', `${fontSize}px`);
    restartBtn.size(restartBtnW, btnH);
  }
  if(exportBtn){
    exportBtn.position(width - restartBtnW - exportBtnW - padding * 2, btnY);
    exportBtn.style('font-size', `${fontSize}px`);
    exportBtn.size(exportBtnW, btnH);
  }
}

// 修改 drawIntro 的說明文字，提示點擊任一位置開始
function drawIntro(){
  // 說明文字
  fill(0);
  textAlign(CENTER);
  textSize(getResponsiveTextSize(22));
  text("每次四題，答完後會顯示成績與回饋。", width/2, height/2 - 90);
  textSize(getResponsiveTextSize(16));
  text("滑鼠移到選項上會有互動效果。", width/2, height/2 - 60);

  // 計算並繪製開始按鈕（置中）
  introBtnW = min(380, width * 0.36);
  introBtnH = 60;
  introBtnX = (width - introBtnW) / 2;
  introBtnY = height/2 - introBtnH/2 + 10;

  // hover 效果
  let hovered = mouseX > introBtnX && mouseX < introBtnX + introBtnW && mouseY > introBtnY && mouseY < introBtnY + introBtnH;
  fill( hovered ? color(50,120,200) : color(60,140,220) );
  noStroke();
  rect(introBtnX, introBtnY, introBtnW, introBtnH, 10);

  fill(255);
  textSize(getResponsiveTextSize(20));
  textAlign(CENTER, CENTER);
  text("開始測驗", introBtnX + introBtnW/2, introBtnY + introBtnH/2);
}

function draw(){
  backgroundGradient();
  for(let p of particles) p.updateDraw();
  drawHeader();

  if(state === "intro"){
    drawIntro();
  } else if(state === "quiz"){
    drawQuestion();
    if(showImmediate){
      immediateTimer--;
      if(immediateTimer<=0) showImmediate=false;
    }
  } else if(state === "feedback"){
    drawFeedback();
  } else if(state === "done"){
    drawResult();
  }

  for(let c of confetti) c.updateDraw();
  confetti = confetti.filter(c=>!c.done);
  for(let s of sparkles) s.updateDraw(); // 繪製星光粒子
  sparkles = sparkles.filter(s=>!s.done); // 過濾已完成的星光粒子
}

function selectRandomQuestions(){
  selected = [];
  let pool = [...questionBank];
  while(selected.length < 4 && pool.length>0){
    let i = floor(random(pool.length));
    selected.push(pool.splice(i,1)[0]);
  }
  current = 0;
  userAnswers = Array(selected.length).fill(null);
  state = "intro";
  // 準備第一題的隨機選項位置
  prepareOptionLayout();
}

function exportCSV(){
  let lines = [];
  lines.push("id,question,choice1,choice2,choice3,choice4,answer,feedback");
  for(let q of questionBank){
    let row = [
      q.id,
      `"${q.q.replace(/"/g,'""')}"`,
      `"${q.choices[0].replace(/"/g,'""')}"`,
      `"${q.choices[1].replace(/"/g,'""')}"`,
      `"${q.choices[2].replace(/"/g,'""')}"`,
      `"${q.choices[3].replace(/"/g,'""')}"`,
      q.answer,
      `"${q.feedback.replace(/"/g,'""')}"`
    ].join(",");
    lines.push(row);
  }
  saveStrings(lines, 'question_bank.csv');
}

function drawHeader(){
  fill(255,255,255,200);
  noStroke();
  rect(0,0,width,70);
  fill(30);  
  textSize(getResponsiveTextSize(22));
  textAlign(LEFT, CENTER);
  text("測驗系統 — 隨機抽題 4 題", 20, 35);
  textAlign(RIGHT, CENTER);
  text(`第 ${current+1} / ${selected.length}`, width-20, 35);
}

function drawQuestion(){
  if(!selected || selected.length === 0) return;
  let q = selected[current];

  // ensure layout exists for current question
  if(!optionLayout || optionLayout.length !== q.choices.length) prepareOptionLayout();

  // 最大可用寬度（題目與選項整體區塊）
  let contentW = min(900, width * 0.78);
  let contentLeft = (width - contentW) / 2;
  let centerX = width / 2;

  // 題目文字（量測高度以支援換行、中文）
  textSize(24);
  textAlign(LEFT, TOP); // 先用 LEFT 來量測與計算
  let questionText = "Q" + (current+1) + ": " + q.q;
  let questionHeight = measureTextHeight(questionText, contentW);

  // 選項 Grid 設定（2 欄）
  let cols = 2;
  let rows = ceil(q.choices.length / cols);
  let gap = 14;
  let optionH = 64;
  let optionW = (contentW - gap) / cols;
  let totalOptionsH = rows * optionH + (rows - 1) * gap;

  // 預留按鈕區高度並計算整體區塊高度
  let btnAreaH = 80;
  let blockH = questionHeight + 20 + totalOptionsH + 20 + btnAreaH;

  // 若整體超出可見高度，調整 optionH
  let availableH = height - 80;
  if(blockH > availableH){
    optionH = max(44, floor((availableH - questionHeight - 20 - btnAreaH - (rows - 1) * gap) / rows));
    totalOptionsH = rows * optionH + (rows - 1) * gap;
    blockH = questionHeight + 20 + totalOptionsH + 20 + btnAreaH;
  }

  // 區塊垂直置中
  let blockTopY = (height - blockH) / 2;
  blockTopY = max(12, blockTopY);
  let questionY = blockTopY;

  // 畫題目：在 content 區塊內水平置中（以 contentW 做換行）
  fill(20);
  textSize(24);
  textAlign(CENTER, TOP);
  text(questionText, contentLeft, questionY, contentW);

  // 畫選項：兩欄、每個選項內文字靠左對齊（靠近按鈕左邊緣）
  let startY = questionY + questionHeight + 20;
  choiceRects = [];
  let optionPadding = 12; // 文字與按鈕左邊距

  // 使用 optionLayout 決定每個顯示格子要放哪個原始選項
  for(let d=0; d<q.choices.length; d++){
    let optionIndex = optionLayout[d]; // 被顯示在第 d 個格子的原始選項索引
    let col = d % cols;
    let row = floor(d / cols);
    let x = contentLeft + col * (optionW + gap);
    let y = startY + row * (optionH + gap);

    let hovered = mouseX > x && mouseX < x + optionW && mouseY > y && mouseY < y + optionH;
    stroke(180);
    strokeWeight(1);
    if(userAnswers[current] !== null){
      if(optionIndex === q.answer){
        fill(100,220,120,200);
      } else if(optionIndex === userAnswers[current]){
        fill(255,150,150,200);
      } else {
        fill(255,255,255,200);
      }
    } else {
      fill(255, hovered ? 240 : 250);
    }
    rect(x, y, optionW, optionH, 8);

    // 選項文字靠左顯示於按鈕內
    noStroke();
    fill(20);
    textSize(16);
    textAlign(LEFT, CENTER);
    text((optionIndex+1) + ". " + q.choices[optionIndex], x + optionPadding, y + optionH/2, optionW - optionPadding*2);

    // choiceRects.index 記錄的是原始選項索引（方便比對答案）
    choiceRects.push({x: x, y: y, wRect: optionW, hRect: optionH, index: optionIndex});
  }

  // 下一題 / 完成 按鈕置中（已作答才顯示）
  if(userAnswers[current] !== null){
    btnW = min(360, width * 0.32);
    btnH = 50;
    btnX = (width - btnW) / 2;
    btnY = startY + totalOptionsH + 18;
    fill(60,140,220);
    rect(btnX, btnY, btnW, btnH, 8);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(16);
    text(current < selected.length-1 ? "下一題" : "完成並看成績", btnX + btnW/2, btnY + btnH/2);
  }

  // 即時回饋文字（顯示於按鈕上方）
  if(showImmediate){
    textAlign(CENTER);
    textSize(16);
    let fb = selected[current].feedback;
    fill(0,160);
    let fbY = (userAnswers[current] !== null) ? (btnY - 36) : (startY + totalOptionsH + 10);
    fbY = min(fbY, height - 80);
    text(fb, centerX, fbY, contentW);
  }
}

// 簡單背景漸層（避免找不到時中斷）
function backgroundGradient(){
  noFill();
  for(let i=0;i<height;i++){
    let inter = map(i,0,height,0,1);
    let c1 = color(245,250,255);
    let c2 = color(230,240,255);
    let c = lerpColor(c1,c2,inter);
    stroke(c);
    line(0,i,width,i);
  }
}

// --- 改寫：更可靠的量測文字高度（支援中文與英文，自動以字元或空白換行） ---
function measureTextHeight(txt, boxW){
  // 使用目前 textSize 與字型，逐字或逐詞組包裝
  let lines = [];
  let line = "";
  // 若文字含有空白，優先以空白斷詞；否則逐字處理（適用中文）
  let hasSpace = /\s/.test(txt);
  if(hasSpace){
    let words = txt.split(/\s+/);
    for(let w of words){
      let test = line ? line + " " + w : w;
      if(textWidth(test) <= boxW){
        line = test;
      } else {
        if(line) lines.push(line);
        line = w;
      }
    }
    if(line) lines.push(line);
  } else {
    // 逐字處理（適合中文沒空格的情況）
    for(let ch of txt){
      let test = line + ch;
      if(textWidth(test) <= boxW){
        line = test;
      } else {
        if(line) lines.push(line);
        line = ch;
      }
    }
    if(line) lines.push(line);
  }
  // 行高估算
  let lineH = (textAscent() + textDescent()) * 1.18;
  return max(1, lines.length) * lineH + 8; // 加少許 padding
}

// 輕量粒子類，用於背景效果（setup 已使用）
class Particle {
  constructor(){
    this.x = random(width);
    this.y = random(height);
    this.r = random(2,6);
    this.vx = random(-0.5,0.5);
    this.vy = random(-0.3,0.3);
    this.c = color(random(120,255), random(120,255), random(120,255), 40);
  }
  updateDraw(){
    // 微小的滑鼠吸引效果
    let dx = mouseX - this.x;
    let dy = mouseY - this.y;
    let d = sqrt(dx*dx + dy*dy);
    if(d < 140){
      this.vx += dx * 0.0006;
      this.vy += dy * 0.0006;
    }
    this.x += this.vx;
    this.y += this.vy;
    if(this.x < -20) this.x = width + 20;
    if(this.x > width + 20) this.x = -20;
    if(this.y < -20) this.y = height + 20;
    if(this.y > height + 20) this.y = -20;
    noStroke();
    fill(this.c);
    circle(this.x, this.y, this.r);
  }
}

function mousePressed(){
  // intro：只有點擊畫面上繪製的「開始測驗」按鈕才開始
  if(state === "intro"){
    if(mouseX > introBtnX && mouseX < introBtnX + introBtnW && mouseY > introBtnY && mouseY < introBtnY + introBtnH){
      state = "quiz";
    }
    return;
  }

  // quiz：處理選項點擊與下一題按鈕
  if(state === "quiz"){
    // 選項點擊
    for(let r of choiceRects){
      if(mouseX > r.x && mouseX < r.x + r.wRect && mouseY > r.y && mouseY < r.y + r.hRect){
        if(userAnswers[current] === null){
          userAnswers[current] = r.index;
          if(r.index === selected[current].answer){
            spawnConfetti(40);
          } else {
            for(let i=0;i<15;i++) confetti.push(new Confetti(mouseX, mouseY, false));
          }
          showImmediate = true;
          immediateTimer = 60;
        }
      }
    }

    // 下一題 / 完成 按鈕（使用 btnX/btnY/btnW/btnH）
    if(userAnswers[current] !== null && mouseX > btnX && mouseX < btnX + btnW && mouseY > btnY && mouseY < btnY + btnH){
      if(current < selected.length-1){
        current++;
        // 換題時重新隨機選項位置
        prepareOptionLayout();
        showImmediate = false;
      } else {
        state = "done";
        produceFinalFeedback();
      }
    }
    return;
  }

  // done：處理重新抽題按鈕（畫面下方） — 使用與 drawResult 相同的計算方式
  if(state === "done"){
    let rbW = min(360, width * 0.36);
    let rbH = 50;
    let rbX = (width - rbW)/2;
    let rbY = height - 110; // 與 drawResult 一致
    if(mouseX > rbX && mouseX < rbX + rbW && mouseY > rbY && mouseY < rbY + rbH){
      selectRandomQuestions();
    }
  }
}

// 計算分數
function computeScore(){
  let s = 0;
  for(let i=0;i<selected.length;i++){
    if(userAnswers[i] === selected[i].answer) s++;
  }
  return s;
}

// 回傳成績文字
function finalMessage(score){
  let rate = score / max(1, selected.length);
  let totalQuestions = selected.length;

  if(rate === 1) return "太棒了！全部答對，表現優異！";
  if(rate >= 0.75) return `表現良好，你真棒！答對了 ${score} 題，繼續保持！`;
  if(rate >= 0.5) return `有進步空間，別灰心，再接再厲！你答對了 ${score} 題。`;
  return "需要多練習！建議復習題庫後再嘗試。";
}

// Confetti 類（簡單彩帶/粒子效果，用於稱讚或提示）
class Confetti {
  constructor(x,y,good=true){
    this.x = x;
    this.y = y;
    this.vx = random(-3,3);
    this.vy = random(-6,-2);
    this.size = random(6,12);
    this.color = good ? color(random(50,255),random(50,255),random(50,255)) : color(220,80,80);
    this.life = 120;
    this.done = false;
  }
  updateDraw(){
    if(this.done) return;
    this.vy += 0.18;
    this.x += this.vx;
    this.y += this.vy;
    push();
    translate(this.x, this.y);
    rotate(frameCount * 0.05);
    noStroke();
    fill(this.color);
    rectMode(CENTER);
    rect(0,0,this.size,this.size/2);
    pop();
    this.life--;
    if(this.life<=0 || this.y > height + 50) this.done = true;
  }
}

// Sparkle 類（用於鼓勵畫面的星光粒子）
class Sparkle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.vx = random(-0.5, 0.5);
    this.vy = random(-2, -0.5); // 向上移動
    this.size = random(3, 7);
    this.color = color;
    this.life = random(60, 120);
    this.done = false;
    this.alpha = 255;
  }

  updateDraw() {
    if (this.done) return;
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 2; // 漸隱
    this.size *= 0.98; // 縮小
    if (this.alpha <= 0 || this.size <= 0.5) {
      this.done = true;
    }

    noStroke();
    fill(red(this.color), green(this.color), blue(this.color), this.alpha);
    ellipse(this.x, this.y, this.size);
  }
}

// 產生 confetti
function spawnConfetti(n){
  for(let i=0;i<n;i++){
    confetti.push(new Confetti(random(width), random(height/3), true));
  }
}
// 根據成績產生最後回饋動畫 (已修改為更精確的參數)
function produceFinalFeedback(){
  let s = computeScore();
  let totalQuestions = selected.length;
  let scoreRate = totalQuestions > 0 ? s / totalQuestions : 0;

  confetti = []; // 清除之前的彩帶
  sparkles = []; // 清除之前的星光

  if(scoreRate === 1){ // 滿分：大量彩色彩帶
    for(let i=0;i<120;i++) confetti.push(new Confetti(random(width), random(height/3), true));
  } else if(scoreRate >= 0.75){ // 良好：中量彩色彩帶
    for(let i=0;i<60;i++) confetti.push(new Confetti(random(width), random(height/3), true));
  } else if(scoreRate >= 0.5){ // 有進步空間：鼓勵星光
    for(let i=0;i<50;i++) sparkles.push(new Sparkle(random(width), random(height * 0.7, height), color(random(100, 200), random(150, 255), 255)));
  } else { // 需要多練習：少量紅色提示粒子
    for(let i=0;i<20;i++) confetti.push(new Confetti(random(width), random(height/2), false));
  }
}

// 顯示成績頁面（若你的專案已有 drawResult，可用互換或合併）
function drawResult(){
  // 背景與粒子維持一致
  backgroundGradient();
  for(let p of particles) p.updateDraw();
  drawHeader();

  // 計分與回饋文字
  let score = computeScore();
  textAlign(CENTER);
  fill(20);  
  textSize(34);
  text(`完成！你的成績： ${score} / ${selected.length}`, width/2, 110);

  textSize(18);
  text(finalMessage(score), width/2, 150);

  // 各題摘要（避開邊界，換行顯示）
  let listX = max(40, width*0.08);
  let listW = min(900, width - listX*2);
  let y = 190;  
  textAlign(LEFT);  
  textSize(16);
  for(let i=0;i<selected.length;i++){
    let q = selected[i];
    let correct = (userAnswers[i] === q.answer);
    fill(correct ? color(30,130,30) : color(180,40,40));
    // 題目（使用換行寬度 listW）
    text(`Q${i+1}: ${q.q}`, listX, y, listW);
    y += measureTextHeight(`Q${i+1}: ${q.q}`, listW);
    // 答案
    fill(0);
    let your = `你的答案：${q.choices[userAnswers[i]] ?? "未作答"}  / 正確：${q.choices[q.answer]}`;
    text(your, listX + 12, y, listW - 12);
    y += measureTextHeight(your, listW) + 12;
  }

  // 重新抽題按鈕（畫布上繪製）
  let rbW = min(360, width * 0.36);
  let rbH = 50;
  let rbX = (width - rbW)/2;
  let rbY = height - 110;
  fill(60,140,220);
  rect(rbX, rbY, rbW, rbH, 10);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(18);
  text("重新抽題並再測一次", rbX + rbW/2, rbY + rbH/2);

  // confetti 和 sparkles 會在 draw() 函數的末尾統一繪製
}