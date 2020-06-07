/// <reference path="./p5.global-mode.d.ts" />
const GRID_NUMBER = 20;
let GRID_WIDTH;
let GRID_HEIGHT;
let enemys = [];
let towers = [];
let checkpoints = [];
let wagons = [];
let money = 200;
let number = 0;
let prices = [100, 100, 100];
let spawnX;
let spawnY;
let lifes = 10;
let waveNumber = 0;
let GS = 1;
let pause = true;
let trainSpeed = 10;
let trainCooldown = 0;
let free = true;
let same = true;

//

let trainX;
let trainY;
let train_X;
let train_Y;

//

let waveMoney = [100, 200, 400, 400, 400, 0];
let enemyType = [0, 0, 1, 2, 0, 3];
let waves = [10, 20, 40, 20, 150, 1];
let intervalls = [60, 15, 15, 45, 5, 600];
let intervall = intervalls[0];

function setup() {
  createCanvas(windowWidth, windowHeight);
  GRID_WIDTH = windowWidth / GRID_NUMBER;
  GRID_HEIGHT = windowHeight / GRID_NUMBER;
  spawnX = GRID_WIDTH * 3.5;
  spawnY = -(GRID_HEIGHT / 2);
  trainX = GRID_WIDTH * 19.5;
  trainY = GRID_HEIGHT * 1.5;
  train_X = trainX;
  train_Y = trainY;
  checkpoints.push(new Checkpoint(spawnX, spawnY, "s"));
  checkpoints.push(new Checkpoint(GRID_WIDTH * 3.5, GRID_HEIGHT * 14.5, "d"));
  checkpoints.push(new Checkpoint(GRID_WIDTH * 8.5, GRID_HEIGHT * 14.5, "w"));
  checkpoints.push(new Checkpoint(GRID_WIDTH * 8.5, GRID_HEIGHT * 7.5, "d"));
  checkpoints.push(new Checkpoint(GRID_WIDTH * 18.5, GRID_HEIGHT * 7.5, "s"));
  checkpoints.push(new Checkpoint(GRID_WIDTH * 18.5, GRID_HEIGHT * 20.5, "s"));
  for (let i = 0; i < 4; i++) {
    wagons.push(new Wagon(trainX, trainY + (i + 1) * GRID_HEIGHT));
  }
}

//
//
//
//
//

function draw() {
  if (lifes > 0) {
    world();

    for (let i in enemys) {
      enemys[i].update(i);
    }

    for (let wagon of wagons) {
      wagon.draw();
    }

    drawTrain();

    for (let tower of towers) {
      tower.update();
    }

    numberChosen();
    tower();
    spawn();
    if (keyIsPressed && trainCooldown <= 0) {
      if (keys.w || keys.a || keys.s || keys.d) {
        move();
        trainCooldown = trainSpeed;
      }
    }
    trainCooldown -= 1;

    fill(0, 0, 255);
  } else {
    background(0);
    fill(255, 0, 0);
  }
  stroke(0);
  textSize(GRID_HEIGHT);
  text(waveNumber + 1, GRID_WIDTH / 5, GRID_HEIGHT * 3);
}

//
//
//
//
//

function world() {
  background(255);
  stroke(0);
  for (let i = 0; i < GRID_NUMBER + 1; i++) {
    line(0, i * GRID_HEIGHT, windowWidth, i * GRID_HEIGHT);
    line(i * GRID_WIDTH, 0, i * GRID_WIDTH, windowHeight);
  }

  fill(150);
  stroke(0);
  rect(0, 0, GRID_WIDTH * 2, windowHeight);
  fill(255, 255, 0);
  if (money >= 10000) {
    textSize(GRID_HEIGHT * 0.64);
  } else if (money >= 1000) {
    textSize(GRID_HEIGHT * 0.8);
  } else {
    textSize(GRID_HEIGHT);
  }
  text(money + "$", GRID_WIDTH / 5, GRID_HEIGHT);
  strokeWeight(GRID_HEIGHT / 5);
  for (let i = 0; i < checkpoints.length - 1; i++) {
    line(
      checkpoints[i].pos.x,
      checkpoints[i].pos.y,
      checkpoints[i + 1].pos.x,
      checkpoints[i + 1].pos.y
    );
  }
  strokeWeight(1);
  fill(255, 0, 0);
  textSize(GRID_HEIGHT);
  text(lifes, GRID_WIDTH / 5, GRID_HEIGHT * 2);

  //

  clickX = int(mouseX / GRID_WIDTH) * GRID_WIDTH + GRID_WIDTH / 2;
  clickY = int(mouseY / GRID_HEIGHT) * GRID_HEIGHT + GRID_HEIGHT / 2;
  towerIsOn = false;
  towerNumber = 0;
  for (let tower of towers) {
    if ((tower.pos.x - clickX) ** 2 + (tower.pos.y - clickY) ** 2 <= 1) {
      towerIsOn = true;
      tower.stroke = 250;
      towerNumber = tower.type;
      fill(230);
      textSize(GRID_HEIGHT);
      text(tower.level + 1, GRID_WIDTH / 5, GRID_HEIGHT * 4);
    } else {
      tower.stroke = 0;
    }
  }
  if (towerIsOn != true) {
    for (let i = 0; i < TOWER_DAMAGE.length; i++) {
      field = GRID_HEIGHT * 4 * (i + 1);
      fill(TOWER_COLOR[i]);
      stroke(0);
      rect(
        GRID_WIDTH / 2 -
          (TOWER_SIZE[i] * GRID_HEIGHT) / TOWER_BARREL_WIDTH[i] / 2,
        field + GRID_HEIGHT * 1.5,
        (TOWER_SIZE[i] * GRID_HEIGHT) / TOWER_BARREL_WIDTH[i],
        TOWER_SIZE[i] * GRID_HEIGHT * (TOWER_BARREL_Height[i] / 10)
      );
      circle(
        GRID_WIDTH / 2,
        field + GRID_HEIGHT * 1.5,
        TOWER_SIZE[i] * GRID_HEIGHT
      );
      fill(50);
      textSize(GRID_HEIGHT * 0.4);
      text(i + 1, GRID_WIDTH * 0.1, field + GRID_HEIGHT);
      fill(255, 255, 0);
      textSize(GRID_HEIGHT * 0.6);
      text(prices[i] + "$", GRID_WIDTH * 0.9, field + GRID_HEIGHT * 1.8);
      fill(255, 0, 0);
      textSize(GRID_HEIGHT * 0.6);
      text(TOWER_DAMAGE[i] + "d", GRID_WIDTH * 0.9, field + GRID_HEIGHT * 2.8);
      fill(0, 0, 255);
      textSize(GRID_HEIGHT * 0.6);
      text(
        round((60 / TOWER_RELOAD[i]) * 10) / 10 + "B/s",
        GRID_WIDTH * 0.75,
        field + GRID_HEIGHT * 3.8
      );
      fill(0, 255, 0);
      textSize(GRID_HEIGHT * 0.6);
      text(TOWER_RANGE[i], GRID_WIDTH * 0.05, field + GRID_HEIGHT * 3.8);
      fill(230);
      textSize(GRID_HEIGHT);
      text(number + 1, GRID_WIDTH / 5, GRID_HEIGHT * 4);
    }
  } else if (towerNumber === 0) {
    for (let i = 0; i < TOWER_0_DAMAGE.length; i++) {
      field = GRID_HEIGHT * 4 * (i + 1);
      fill(TOWER_0_COLOR[i]);
      stroke(0);
      rect(
        GRID_WIDTH / 2 -
          (TOWER_0_SIZE[i] * GRID_HEIGHT) / TOWER_BARREL_WIDTH[0] / 2,
        field + GRID_HEIGHT * 1.5,
        (TOWER_0_SIZE[i] * GRID_HEIGHT) / TOWER_BARREL_WIDTH[0],
        TOWER_0_SIZE[i] * GRID_HEIGHT * (TOWER_BARREL_Height[0] / 10)
      );
      circle(
        GRID_WIDTH / 2,
        field + GRID_HEIGHT * 1.5,
        TOWER_0_SIZE[i] * GRID_HEIGHT
      );
      fill(50);
      textSize(GRID_HEIGHT * 0.4);
      text(i + 2, GRID_WIDTH * 0.1, field + GRID_HEIGHT);
      fill(255, 255, 0);
      textSize(GRID_HEIGHT * 0.6);
      text(
        prices[0] * 2 ** i + "$",
        GRID_WIDTH * 0.9,
        field + GRID_HEIGHT * 1.8
      );
      fill(255, 0, 0);
      textSize(GRID_HEIGHT * 0.6);
      text(
        TOWER_0_DAMAGE[i] + "d",
        GRID_WIDTH * 0.9,
        field + GRID_HEIGHT * 2.8
      );
      fill(0, 0, 255);
      textSize(GRID_HEIGHT * 0.6);
      text(
        round((60 / TOWER_0_RELOAD[i]) * 10) / 10 + "B/s",
        GRID_WIDTH * 0.75,
        field + GRID_HEIGHT * 3.8
      );
      fill(0, 255, 0);
      textSize(GRID_HEIGHT * 0.6);
      text(TOWER_0_RANGE[i], GRID_WIDTH * 0.05, field + GRID_HEIGHT * 3.8);
    }
  } else if (towerNumber === 1) {
    for (let i = 0; i < TOWER_1_DAMAGE.length; i++) {
      field = GRID_HEIGHT * 4 * (i + 1);
      fill(TOWER_1_COLOR[i]);
      stroke(0);
      rect(
        GRID_WIDTH / 2 -
          (TOWER_1_SIZE[i] * GRID_HEIGHT) / TOWER_BARREL_WIDTH[1] / 2,
        field + GRID_HEIGHT * 1.5,
        (TOWER_1_SIZE[i] * GRID_HEIGHT) / TOWER_BARREL_WIDTH[1],
        TOWER_1_SIZE[i] * GRID_HEIGHT * (TOWER_BARREL_Height[1] / 10)
      );
      circle(
        GRID_WIDTH / 2,
        field + GRID_HEIGHT * 1.5,
        TOWER_1_SIZE[i] * GRID_HEIGHT
      );
      fill(50);
      textSize(GRID_HEIGHT * 0.4);
      text(i + 2, GRID_WIDTH * 0.1, field + GRID_HEIGHT);
      fill(255, 255, 0);
      textSize(GRID_HEIGHT * 0.6);
      text(
        prices[1] * 2 ** i + "$",
        GRID_WIDTH * 0.9,
        field + GRID_HEIGHT * 1.8
      );
      fill(255, 0, 0);
      textSize(GRID_HEIGHT * 0.6);
      text(
        TOWER_1_DAMAGE[i] + "d",
        GRID_WIDTH * 0.9,
        field + GRID_HEIGHT * 2.8
      );
      fill(0, 0, 255);
      textSize(GRID_HEIGHT * 0.6);
      text(
        round((60 / TOWER_1_RELOAD[i]) * 10) / 10 + "B/s",
        GRID_WIDTH * 0.75,
        field + GRID_HEIGHT * 3.8
      );
      fill(0, 255, 0);
      textSize(GRID_HEIGHT * 0.6);
      text(TOWER_1_RANGE[i], GRID_WIDTH * 0.05, field + GRID_HEIGHT * 3.8);
    }
  } else if (towerNumber === 2) {
    for (let i = 0; i < TOWER_1_DAMAGE.length; i++) {
      field = GRID_HEIGHT * 4 * (i + 1);
      fill(TOWER_2_COLOR[i]);
      stroke(0);
      rect(
        GRID_WIDTH / 2 -
          (TOWER_2_SIZE[i] * GRID_HEIGHT) / TOWER_BARREL_WIDTH[2] / 2,
        field + GRID_HEIGHT * 1.5,
        (TOWER_2_SIZE[i] * GRID_HEIGHT) / TOWER_BARREL_WIDTH[2],
        TOWER_2_SIZE[i] * GRID_HEIGHT * (TOWER_BARREL_Height[2] / 10)
      );
      circle(
        GRID_WIDTH / 2,
        field + GRID_HEIGHT * 1.5,
        TOWER_2_SIZE[i] * GRID_HEIGHT
      );
      fill(50);
      textSize(GRID_HEIGHT * 0.4);
      text(i + 2, GRID_WIDTH * 0.1, field + GRID_HEIGHT);
      fill(255, 255, 0);
      textSize(GRID_HEIGHT * 0.6);
      text(
        prices[2] * 2 ** i + "$",
        GRID_WIDTH * 0.9,
        field + GRID_HEIGHT * 1.8
      );
      fill(255, 0, 0);
      textSize(GRID_HEIGHT * 0.6);
      text(
        TOWER_2_DAMAGE[i] + "d",
        GRID_WIDTH * 0.9,
        field + GRID_HEIGHT * 2.8
      );
      fill(0, 0, 255);
      textSize(GRID_HEIGHT * 0.6);
      text(
        round((60 / TOWER_2_RELOAD[i]) * 10) / 10 + "B/s",
        GRID_WIDTH * 0.75,
        field + GRID_HEIGHT * 3.8
      );
      fill(0, 255, 0);
      textSize(GRID_HEIGHT * 0.6);
      text(TOWER_2_RANGE[i], GRID_WIDTH * 0.05, field + GRID_HEIGHT * 3.8);
    }
  }
}

//
//
//
//
//

let keys = {};
function keyPressed() {
  keys[key] = true;
}

function keyReleased() {
  keys[key] = false;
}

//
//
//
//
//

function numberChosen() {
  if (keyIsPressed) {
    if (key === "1") {
      number = 0;
    }
    if (key === "2") {
      number = 1;
    }
    if (key === "3") {
      number = 2;
    }
  }
}

//
//
//
//
//

function move() {
  if (keys.w) {
    train_Y = trainY - GRID_HEIGHT;
  } else if (keys.a) {
    train_X = trainX - GRID_WIDTH;
  } else if (keys.s) {
    train_Y = trainY + GRID_HEIGHT;
  } else if (keys.d) {
    train_X = trainX + GRID_WIDTH;
  }
  for (let wagon of wagons) {
    if (train_Y === wagon.pos.y && train_X === wagon.pos.x) {
      free = false;
    }
  }
  if (
    free &&
    train_X > GRID_WIDTH * 2 &&
    train_X < windowWidth &&
    train_Y > 0 &&
    train_Y < windowHeight
  ) {
    for (let i in wagons) {
      if (i < wagons.length - 1) {
        wagons[wagons.length - 1 - i].pos.x =
          wagons[wagons.length - 2 - i].pos.x;
        wagons[wagons.length - 1 - i].pos.y =
          wagons[wagons.length - 2 - i].pos.y;
      }
    }
    wagons[0].pos.x = trainX;
    wagons[0].pos.y = trainY;
    trainX = train_X;
    trainY = train_Y;
  } else {
    train_X = trainX;
    train_Y = trainY;
    free = true;
  }
  for (let i in towers) {
    towers[i].pos.x = wagons[i].pos.x;
    towers[i].pos.y = wagons[i].pos.y;
  }
}

//
//
//
//
//

function tower() {
  clickX = int(mouseX / GRID_WIDTH) * GRID_WIDTH + GRID_WIDTH / 2;
  clickY = int(mouseY / GRID_HEIGHT) * GRID_HEIGHT + GRID_HEIGHT / 2;
  for (let tower of towers) {
    if ((tower.pos.x - clickX) ** 2 + (tower.pos.y - clickY) ** 2 <= 1) {
      return;
    }
  }
  let isOnTrain = false;
  for (let wagon of wagons) {
    if ((wagon.pos.x - clickX) ** 2 + (wagon.pos.y - clickY) ** 2 <= 1) {
      isOnTrain = true;
      break;
    }
  }
  stroke(0);
  fill(TOWER_COLOR[number]);
  if (mouseX > GRID_WIDTH * 2 && money >= prices[number] && isOnTrain) {
    circle(clickX, clickY, TOWER_SIZE[number] * GRID_HEIGHT);
    noFill();
    stroke(230);
    if (mouseX > GRID_WIDTH * 2) {
    }
    circle(
      clickX,
      clickY,
      (TOWER_RANGE[number] * GRID_HEIGHT + 0.5 * GRID_HEIGHT) * 2
    );
  }
}

//
//
//
//
//

function spawn() {
  if (intervall <= 0 && pause === false) {
    enemys.push(new Enemy(enemyType[waveNumber]));
    intervall = intervalls[waveNumber];
    waves[waveNumber] -= 1;
  }
  if (waves[waveNumber] <= 0) {
    money += waveMoney[waveNumber];
    waveNumber += 1;
    pause = true;
  }
  intervall -= 1;
  if (keyIsPressed) {
    if (key === " ") {
      pause = false;
    }
  }
}

//
//
//
//
//

function drawTrain() {
  fill(0);
  stroke(0);
  rect(
    trainX - (GRID_WIDTH * 0.7) / 2,
    trainY - (GRID_HEIGHT * 0.7) / 2,
    GRID_WIDTH * 0.7,
    GRID_HEIGHT * 0.7
  );
}

//
//
//
//
//

function mouseClicked() {
  clickX = int(mouseX / GRID_WIDTH) * GRID_WIDTH + GRID_WIDTH / 2;
  clickY = int(mouseY / GRID_HEIGHT) * GRID_HEIGHT + GRID_HEIGHT / 2;
  for (let tower of towers) {
    if (
      (tower.pos.x - clickX) ** 2 + (tower.pos.y - clickY) ** 2 <= 1 &&
      tower.level < 3 &&
      money >= tower.cost
    ) {
      money -= tower.cost;
      tower.upgrade();
      return;
    }
  }
  for (let tower of towers) {
    if ((tower.pos.x - clickX) ** 2 + (tower.pos.y - clickY) ** 2 <= 1) {
      return;
    }
  }
  let isOnTrain = false;
  for (let wagon of wagons) {
    if ((wagon.pos.x - clickX) ** 2 + (wagon.pos.y - clickY) ** 2 <= 1) {
      isOnTrain = true;
      break;
    }
  }
  if (money >= prices[number] && isOnTrain) {
    towers.push(new Tower(clickX, clickY, number));
    money -= prices[number];
    return;
  }
  same = true;
}

//
//
//
//
//

const TOWER_DAMAGE = [4, 10, 2];
const TOWER_RANGE = [3, 5, 4];
const TOWER_RELOAD = [16, 32, 20];
const TOWER_SIZE = [0.7, 0.6, 0.65];
const TOWER_COLOR = [150, 145, 90];
const TOWER_FLAECHE = [1, 1, 4];

const TOWER_BARREL_WIDTH = [4.5, 5, 3];
const TOWER_BARREL_Height = [9, 12.5, 0];
const TOWER_COST = [prices[0], prices[1], [prices[2]]];

//

const TOWER_0_DAMAGE = [4, 4, 2];
const TOWER_0_RANGE = [3.5, 4, 4.5];
const TOWER_0_RELOAD = [8, 4, 1];
const TOWER_0_SIZE = [0.8, 0.9, 1];
const TOWER_0_COLOR = [135, 120, 105];
const TOWER_0_FLAECHE = [1, 1, 1];

const TOWER_1_DAMAGE = [20, 30, 60];
const TOWER_1_RANGE = [6, 7, 8];
const TOWER_1_RELOAD = [32, 24, 24];
const TOWER_1_SIZE = [0.7, 0.8, 0.9];
const TOWER_1_COLOR = [160, 185, 200];
const TOWER_1_FLAECHE = [1, 1, 1];

const TOWER_2_DAMAGE = [4, 8, 16];
const TOWER_2_RANGE = [4.3, 4.6, 5];
const TOWER_2_RELOAD = [18, 16, 14];
const TOWER_2_SIZE = [0.7, 0.75, 0.8];
const TOWER_2_COLOR = [75, 60, 45];
const TOWER_2_FLAECHE = [5, 6, 7];

//
//
//
//
//

class Tower {
  constructor(x, y, towerType) {
    this.pos = createVector(x, y);
    this.size = TOWER_SIZE[towerType] * GRID_HEIGHT;
    this.color = TOWER_COLOR[towerType];
    this.reload = TOWER_RELOAD[towerType];
    this.maxReload = TOWER_RELOAD[towerType];
    this.barrelW = this.size / TOWER_BARREL_WIDTH[towerType];
    this.barrelH = this.size * (TOWER_BARREL_Height[towerType] / 10);
    this.range = (TOWER_RANGE[towerType] * GRID_HEIGHT + 0.5 * GRID_HEIGHT) * 2;
    this.damage = TOWER_DAMAGE[towerType];
    this.flaeche = TOWER_FLAECHE[towerType];
    this.max_flaeche = this.flaeche;
    this.enemyX = this.pos.x;
    this.enemyY = this.pos.y + 1000000000000000;
    this.cost = TOWER_COST[towerType];
    this.type = towerType;
    this.level = 0;
    this.stroke = 0;
  }

  draw() {
    stroke(this.stroke);
    fill(this.color);
    push();
    translate(this.pos.x, this.pos.y);
    const angle = atan2(this.enemyX - this.pos.x, this.enemyY - this.pos.y);
    rotate(-angle);
    rect(-this.barrelW / 2, 0, this.barrelW, this.barrelH);
    pop();
    circle(this.pos.x, this.pos.y, this.size);
    noFill();
    stroke(230);
    circle(this.pos.x, this.pos.y, this.range);
  }

  shot() {
    this.reload -= 1;
    if (this.reload > 0) {
      return;
    }
    if (this.reload <= 0) {
      for (let enemy of enemys) {
        if (
          (this.pos.x - enemy.pos.x) ** 2 + (this.pos.y - enemy.pos.y) ** 2 <
            (this.range / 2 + enemy.size / 2) ** 2 &&
          enemy.health > 0 &&
          this.flaeche >= 1
        ) {
          enemy.health -= this.damage;
          this.enemyX = enemy.pos.x;
          this.enemyY = enemy.pos.y;
          stroke(255, 255, 0);
          strokeWeight(this.barrelW / 2);
          line(this.pos.x, this.pos.y, this.enemyX, this.enemyY);
          strokeWeight(1);
          this.flaeche -= 1;
        }
      }
      this.reload = this.maxReload;
      this.flaeche = this.max_flaeche;
    }
  }

  upgrade() {
    if (this.type === 0) {
      this.damage = TOWER_0_DAMAGE[this.level];
      this.maxReload = TOWER_0_RELOAD[this.level];
      this.range =
        (TOWER_0_RANGE[this.level] * GRID_HEIGHT + 0.5 * GRID_HEIGHT) * 2;
      this.size = TOWER_0_SIZE[this.level] * GRID_HEIGHT;
      this.cost = this.cost * 2;
      this.color = TOWER_0_COLOR[this.level];
      this.barrelW = this.size / TOWER_BARREL_WIDTH[this.type];
      this.barrelH = this.size * (TOWER_BARREL_Height[this.type] / 10);
      this.level += 1;
    }

    if (this.type === 1) {
      this.damage = TOWER_1_DAMAGE[this.level];
      this.maxReload = TOWER_1_RELOAD[this.level];
      this.range =
        (TOWER_1_RANGE[this.level] * GRID_HEIGHT + 0.5 * GRID_HEIGHT) * 2;
      this.size = TOWER_1_SIZE[this.level] * GRID_HEIGHT;
      this.cost = this.cost * 2;
      this.color = TOWER_1_COLOR[this.level];
      this.barrelW = this.size / TOWER_BARREL_WIDTH[this.type];
      this.barrelH = this.size * (TOWER_BARREL_Height[this.type] / 10);
      this.level += 1;
    }

    if (this.type === 2) {
      this.damage = TOWER_2_DAMAGE[this.level];
      this.maxReload = TOWER_2_RELOAD[this.level];
      this.range =
        (TOWER_2_RANGE[this.level] * GRID_HEIGHT + 0.5 * GRID_HEIGHT) * 2;
      this.size = TOWER_2_SIZE[this.level] * GRID_HEIGHT;
      this.cost = this.cost * 2;
      this.color = TOWER_2_COLOR[this.level];
      this.barrelW = this.size / TOWER_BARREL_WIDTH[this.type];
      this.barrelH = this.size * (TOWER_BARREL_Height[this.type] / 10);
      this.level += 1;
    }
  }

  update() {
    this.shot();
    this.draw();
  }
}

//
//
//
//
//

const ENEMY_SIZE = [0.85, 0.7, 1, 1.5];
const ENEMY_COLOR = [35, 70, 0, 0];
const ENEMY_SPEED = [600, 1200, 600, 300];
const ENEMY_HEALTH = [16, 16, 96, 1440];
const ENEMY_MONEY = [10, 15, 30, 300];
const ENEMY_LOST = [1, 1, 3, 10];

class Enemy {
  constructor(enemyType = 0) {
    this.pos = createVector(spawnX, spawnY);
    this.size = ENEMY_SIZE[enemyType] * GRID_HEIGHT;
    this.color = ENEMY_COLOR[enemyType];
    this.speed = ENEMY_SPEED[enemyType];
    this.health = ENEMY_HEALTH[enemyType];
    this.life = ENEMY_HEALTH[enemyType];
    this.money = ENEMY_MONEY[enemyType];
    this.richtung = "s";
    this.lost = ENEMY_LOST[enemyType];
  }
  draw(x) {
    for (let i = 0; i < this.speed; i++) {
      for (let c of checkpoints) {
        if (
          (this.pos.x - c.pos.x) ** 2 + (this.pos.y - c.pos.y) ** 2 <=
          0.01 ** 2
        ) {
          this.richtung = c.richtung;
        }
      }
      if (this.richtung === "s") {
        this.pos.y += 0.01;
      } else if (this.richtung === "d") {
        this.pos.x += 0.01;
      } else if (this.richtung === "w") {
        this.pos.y -= 0.01;
      } else if (this.richtung === "a") {
        this.pos.x -= 0.01;
      }
      if (
        (this.pos.x - checkpoints[checkpoints.length - 1].pos.x) ** 2 +
          (this.pos.y - checkpoints[checkpoints.length - 1].pos.y) ** 2 <=
        0.01 ** 2
      ) {
        enemys.splice(x, 1);
        lifes -= this.lost;
        return;
      }
    }
    stroke(0);
    fill(this.color);
    circle(this.pos.x, this.pos.y, this.size);
    fill(255);
    rect(
      this.pos.x - this.size / 2,
      this.pos.y - this.size / 2 - 10,
      this.size,
      6
    );
    fill(255, 0, 0);
    rect(
      this.pos.x - this.size / 2,
      this.pos.y - this.size / 2 - 10,
      (this.size / this.life) * this.health,
      6
    );
  }
  die(x) {
    enemys.splice(x, 1);
  }
  checkTouch(x) {
    if (
      (this.pos.x - trainX) ** 2 + (this.pos.y - trainY) ** 2 <
      (this.size / 2 + (GRID_HEIGHT * 0.7) / 2) ** 2
    ) {
      enemys.splice(x, 1);
      lifes -= this.lost;
      return;
    }
    for (let wagon of wagons) {
      if (
        (this.pos.x - wagon.pos.x) ** 2 + (this.pos.y - wagon.pos.y) ** 2 <
        (this.size / 2 + wagon.size / 2) ** 2
      ) {
        enemys.splice(x, 1);
        lifes -= this.lost;
        return;
      }
    }
  }
  update(x) {
    if (this.health <= 0) {
      this.die(x);
      return;
    }
    this.draw(x);
    this.checkTouch(x);
  }
}

class Wagon {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.size = GRID_HEIGHT * 0.9;
  }
  draw() {
    stroke(0);
    fill(0);
    rect(
      this.pos.x - (GRID_WIDTH * 0.9) / 2,
      this.pos.y - (GRID_HEIGHT * 0.9) / 2,
      GRID_WIDTH * 0.9,
      GRID_HEIGHT * 0.9
    );
  }
}

class Checkpoint {
  constructor(x, y, richtung) {
    this.pos = createVector(x, y);
    this.richtung = richtung;
  }
}
