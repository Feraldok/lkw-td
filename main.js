/// <reference path="./p5.global-mode.d.ts" />

const UI_WIDTH = 175;
const GRID_NUMBER = 20;

let GRID_SIZE;

let money = 200;
let lifes = 10;
let win = false;
let time = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);

  const fieldSize = min(windowHeight, windowWidth - UI_WIDTH);
  GRID_SIZE = fieldSize / GRID_NUMBER;

  trainPos = createVector(UI_WIDTH + GRID_SIZE * 19.5, GRID_SIZE * 1.5);
  checkpoints.push(createVector(UI_WIDTH + GRID_SIZE * 3.5, -(GRID_SIZE / 2)));
  checkpoints.push(createVector(UI_WIDTH + GRID_SIZE * 3.5, GRID_SIZE * 14.5));
  checkpoints.push(createVector(UI_WIDTH + GRID_SIZE * 8.5, GRID_SIZE * 14.5));
  checkpoints.push(createVector(UI_WIDTH + GRID_SIZE * 8.5, GRID_SIZE * 7.5));
  checkpoints.push(createVector(UI_WIDTH + GRID_SIZE * 18.5, GRID_SIZE * 7.5));
  checkpoints.push(createVector(UI_WIDTH + GRID_SIZE * 18.5, GRID_SIZE * 20.5));

  for (let i = 0; i < 4; i++) {
    wagons.push(new Wagon(trainPos.x, trainPos.y + (i + 1) * GRID_SIZE));
  }
}

function draw() {
  if (lifes <= 0) {
    background(0);
    fill(255, 0, 0);
    textSize(70);
    textAlign(CENTER, CENTER);
    text('Game Over', windowWidth / 2, windowHeight / 2 - 50);
    textSize(35);
    text(`Wave: ${waveIndex + 1}`, windowWidth / 2, windowHeight / 2 + 20);
  } else if (waveIndex >= WAVES.length && enemies.size === 0) {
    background(255);
    textSize(70);
    textAlign(CENTER, CENTER);
    fill(0);
    text('You win', windowWidth / 2, windowHeight / 2);
  } else {
    time++;

    drawWorld();
    drawUI();
    drawTrain();

    towers.forEach((t) => t.update());
    enemies.forEach((e) => e.update());

    drawTowerCursor();
    spawnEnemies();
    checkMoveTrain();
  }
}

function drawWorld() {
  background(255);
  stroke(0);
  for (let i = 0; i < GRID_NUMBER + 1; i++) {
    line(UI_WIDTH, i * GRID_SIZE, UI_WIDTH + GRID_NUMBER * GRID_SIZE, i * GRID_SIZE);
    line(UI_WIDTH + i * GRID_SIZE, 0, UI_WIDTH + i * GRID_SIZE, GRID_NUMBER * GRID_SIZE);
  }

  strokeWeight(GRID_SIZE / 5);
  for (let i = 0; i < checkpoints.length - 1; i++) {
    line(checkpoints[i].x, checkpoints[i].y, checkpoints[i + 1].x, checkpoints[i + 1].y);
  }
}

function drawUI() {
  fill(150);
  stroke(0);
  strokeWeight(1);
  rect(0, 0, UI_WIDTH, windowHeight);
  fill(255, 255, 0);

  textAlign(LEFT, TOP);

  // Money
  textSize(35);
  text(money + '$', 15, 15);

  // HP
  textSize(25);
  fill(255, 0, 0);
  text('HP: ' + lifes, 15, 60);

  // Wave index
  fill(0, 0, 255);
  text('Wave: ' + (waveIndex + 1), 15, 90);

  const clickX = int((mouseX - UI_WIDTH) / GRID_SIZE) * GRID_SIZE + GRID_SIZE / 2 + UI_WIDTH;
  const clickY = int(mouseY / GRID_SIZE) * GRID_SIZE + GRID_SIZE / 2;
  const clickPos = createVector(clickX, clickY);
  let selectedTower = null;

  for (const tower of towers) {
    if (tower.pos.dist(clickPos) <= 1) {
      selectedTower = tower;
      tower.selected = true;
    } else {
      tower.selected = false;
    }
  }

  const towerOptions = [];
  let selectedOption;

  if (selectedTower === null) {
    selectedOption = selectedTowerType;

    for (const i in TOWER_TYPES) {
      const type = TOWER_TYPES[i];
      towerOptions.push({
        level: i,
        color: type.color[0],
        size: type.size[0],
        cost: 100,
        damage: type.damage[0],
        reload: type.reload[0],
        range: type.range[0],
        barrelWidth: type.barrelWidth,
        barrelHeight: type.barrelHeight,
      });
    }
  } else {
    selectedOption = selectedTower.level;
    const type = selectedTower.type;

    for (const i in selectedTower.type.damage) {
      towerOptions.push({
        level: i,
        color: type.color[i],
        size: type.size[i],
        cost: i == 0 ? 100 : 100 * 2 ** (i - 1),
        damage: type.damage[i],
        reload: type.reload[i],
        range: type.range[i],
        barrelWidth: type.barrelWidth,
        barrelHeight: type.barrelHeight,
      });
    }
  }

  for (let i = 0; i < towerOptions.length; i++) {
    const offset = 170 + 140 * i;
    const option = towerOptions[i];
    const size = option.size * GRID_SIZE;
    const barrelW = size / option.barrelWidth;
    const barrelH = size * option.barrelHeight;

    if (selectedOption === i) {
      fill(200);
      rect(5, offset - 30, 165, 120);
    }

    fill(option.color);
    rect(50 - barrelW / 2, offset + 10, barrelW, barrelH);
    circle(50, offset + 10, size);
    fill(50);
    textSize(15);
    text(i + 1, 15, offset - 20);
    fill(255, 255, 0);
    textSize(25);
    text(option.cost + '$', 80, offset - 20);
    fill(255, 0, 0);
    text(option.damage + 'd', 80, offset + 10);
    fill(0, 0, 255);
    text(round((60 / option.reload) * 10) / 10 + 'B/s', 80, offset + 40);
    fill(0, 255, 0);
    textSize(20);
    text(option.range + 'm', 15, offset + 45);
  }
}

function drawTowerCursor() {
  const clickX = int((mouseX - UI_WIDTH) / GRID_SIZE) * GRID_SIZE + GRID_SIZE / 2 + UI_WIDTH;
  const clickY = int(mouseY / GRID_SIZE) * GRID_SIZE + GRID_SIZE / 2;
  const clickPos = createVector(clickX, clickY);

  for (let tower of towers) {
    if (tower.pos.dist(clickPos) <= 1) return;
  }

  let isOnTrain = false;
  for (let wagon of wagons) {
    if (wagon.pos.dist(clickPos) <= 1) {
      isOnTrain = true;
      break;
    }
  }

  const type = TOWER_TYPES[selectedTowerType];

  stroke(0);
  fill(type.color[0]);
  if (mouseX > GRID_SIZE * 2 && money >= 100 && isOnTrain) {
    circle(clickX, clickY, type.size[0] * GRID_SIZE);
    noFill();
    stroke(230);
    circle(clickX, clickY, (type.range[0] * GRID_SIZE + 0.5 * GRID_SIZE) * 2);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

////////////////////////////
//           IO           //
////////////////////////////

const keys = {};

function keyPressed() {
  keys[key] = true;

  if (key === '1') selectedTowerType = 0;
  else if (key === '2') selectedTowerType = 1;
  else if (key === '3') selectedTowerType = 2;
  else if (key === ' ') {
    pauseWave = false;
    nextEnemyTime = time + WAVES[waveIndex].cooldown;
  }
}

function keyReleased() {
  keys[key] = false;
}

function mouseClicked() {
  const clickX = int((mouseX - UI_WIDTH) / GRID_SIZE) * GRID_SIZE + GRID_SIZE / 2 + UI_WIDTH;
  const clickY = int(mouseY / GRID_SIZE) * GRID_SIZE + GRID_SIZE / 2;
  const clickPos = createVector(clickX, clickY);

  for (let tower of towers) {
    if (tower.pos.dist(clickPos) <= 1) {
      const cost = 100 * 2 ** tower.level;
      if (tower.level < 3 && money >= cost) {
        money -= cost;
        tower.upgrade();
      }
      return;
    }
  }

  if (money < 100) return;

  let wagonIndex = -1;
  for (let i in wagons) {
    if (wagons[i].pos.dist(clickPos) <= 1) {
      wagonIndex = i;
      break;
    }
  }
  if (wagonIndex >= 0) {
    towers.add(new Tower(clickX, clickY, selectedTowerType, wagonIndex));
    money -= 100;
  }
}
