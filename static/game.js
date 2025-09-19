const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let W, H;
function resize(){ W = canvas.width = innerWidth; H = canvas.height = innerHeight; }
addEventListener('resize', resize); resize();

let playing = false;
let player = { x: W/2, y: H - 120, w: 48, h: 48, speed: 6 };
let bullets = [];
let mobs = [];
let hearts = 5;
let wave = 0;
let spawnCount = 1;
let score = 0;

const heartsEl = document.getElementById('hearts');
const waveEl = document.getElementById('wave');
const scoreEl = document.getElementById('score');
const progressBarContainer = document.getElementById('progressBarContainer');
const progressBar = document.getElementById('progressBar');

let left=false,right=false,shooting=false;
addEventListener('keydown', e=>{ if(e.key==='ArrowLeft') left=true; if(e.key==='ArrowRight') right=true; if(e.key===' ') shooting=true; });
addEventListener('keyup', e=>{ if(e.key==='ArrowLeft') left=false; if(e.key==='ArrowRight') right=false; if(e.key===' ') shooting=false; });

const touchControls = document.getElementById('touchControls');
if('ontouchstart' in window){ touchControls.style.display = 'flex';
  document.getElementById('left').addEventListener('touchstart', ()=>left=true); document.getElementById('left').addEventListener('touchend', ()=>left=false);
  document.getElementById('right').addEventListener('touchstart', ()=>right=true); document.getElementById('right').addEventListener('touchend', ()=>right=false);
  document.getElementById('shoot').addEventListener('touchstart', ()=>shooting=true); document.getElementById('shoot').addEventListener('touchend', ()=>shooting=false);
}

document.getElementById('playBtn').addEventListener('click', ()=>{
  if(!playing){ startGame(); document.getElementById('playBtn').innerText='RESTART' }
  else { resetGame(); }
});

function startGame(){ playing=true; wave=0; score=0; spawnNextWave(); loop(); }
function resetGame(){ playing=false; bullets=[]; mobs=[]; hearts=5; wave=0; spawnCount=1; score=0; updateHUD(); progressBarContainer.style.display='none'; }

function spawnNextWave(){
  wave++; if(wave>100){ alert('You win! All 100 waves cleared'); playing=false; return };
  spawnCount = 1 + Math.floor((wave-1)*2);
  for(let i=0;i<spawnCount;i++){
    mobs.push({x: Math.random()*(W-60)+30, y: -Math.random()*300 - 40, w:36, h:36, speed: 1 + wave*0.05});
  }
  updateHUD();
}

function updateHUD(){
  heartsEl.innerText = '❤'.repeat(Math.max(0,hearts));
  waveEl.innerText = `Wave: ${wave} / 100`;
  scoreEl.innerText = `Score: ${score}`;
}

function loop(){ if(!playing) return; update(); draw(); requestAnimationFrame(loop); }

let shootTimer = 0;
function update(){
  if(left) player.x -= player.speed; if(right) player.x += player.speed;
  player.x = Math.max(20, Math.min(W-20, player.x));

  shootTimer++; if((shooting || Math.random()<0.01) && shootTimer>10){ bullets.push({x:player.x,y:player.y-24,dy:-10}); shootTimer=0 }

  bullets.forEach(b=>{ b.y += b.dy }); bullets = bullets.filter(b=>b.y> -50);

  mobs.forEach(m=>{ m.y += m.speed; if(Math.random()<0.01) m.x += (Math.random()-0.5)*5; });

  for(let i=mobs.length-1;i>=0;i--){
    for(let j=bullets.length-1;j>=0;j--){
      if(collide(mobs[i], bullets[j])){
        mobs.splice(i,1); bullets.splice(j,1);
        score += 10;
        updateHUD();
        break;
      }
    }
  }

  for(let i=mobs.length-1;i>=0;i--){ if(mobs[i].y > H - 60){ mobs.splice(i,1); hearts--; updateHUD(); if(hearts<=0){ playing=false; alert('Game Over'); } } }

  if(mobs.length===0){ showProgressBar(() => spawnNextWave()); }
}

function collide(a,b){ return a.x - a.w/2 < b.x && a.x + a.w/2 > b.x && a.y - a.h/2 < b.y && a.y + a.h/2 > b.y }

function draw(){
  ctx.fillStyle = '#000'; ctx.fillRect(0,0,W,H);
  for(let i=0;i<80;i++){ ctx.fillStyle = `rgba(255,255,255,${Math.random()*0.6})`; ctx.fillRect(Math.random()*W, Math.random()*H, 1,1) }

  ctx.fillStyle = '#6cf'; ctx.beginPath(); ctx.arc(player.x, player.y, 20, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#ff3'; bullets.forEach(b=>{ ctx.fillRect(b.x-3,b.y-8,6,12) })
  ctx.fillStyle = '#f66'; mobs.forEach(m=>{ ctx.fillRect(m.x-m.w/2, m.y-m.h/2, m.w, m.h) })
}

function showProgressBar(callback){
  progressBarContainer.style.display = 'block';
  progressBar.style.width = '0%';
  let progress = 0;
  let interval = setInterval(()=>{
    progress += 10;
    progressBar.style.width = progress + '%';
    if(progress >= 100){
      clearInterval(interval);
      progressBarContainer.style.display='none';
      callback();
    }
  }, 200);
}
