const enemies = new Set();

let checkpoints = [];
let nextEnemyTime;
let pauseWave = true;
let waveIndex = 0;

class Wave {
  constructor(type, count, money, cooldown) {
    this.type = type;
    this.count = count;
    this.money = money;
    this.cooldown = cooldown;
  }
}

const WAVES = [
  new Wave(0, 10, 100, 60),
  new Wave(0, 20, 200, 15),
  new Wave(1, 40, 400, 15),
  new Wave(2, 20, 400, 45),
  new Wave(0, 150, 400, 5),
  new Wave(3, 1, 0, 0),
];

const ENEMY_SIZE = [0.85, 0.7, 1, 1.5];
const ENEMY_COLOR = [35, 70, 0, 0];
const ENEMY_SPEED = [6, 12, 6, 3];
const ENEMY_HEALTH = [16, 16, 96, 1440];
const ENEMY_MONEY = [10, 15, 30, 300];
const ENEMY_DAMAGE = [1, 1, 3, 10];

class Enemy {
  constructor(enemyType = 0) {
    this.pos = checkpoints[0].copy();
    this.size = ENEMY_SIZE[enemyType] * GRID_SIZE;
    this.color = ENEMY_COLOR[enemyType];
    this.speed = ENEMY_SPEED[enemyType];
    this.health = ENEMY_HEALTH[enemyType];
    this.life = ENEMY_HEALTH[enemyType];
    this.money = ENEMY_MONEY[enemyType];
    this.checkpointIndex = 1;
    this.damage = ENEMY_DAMAGE[enemyType];
  }

  draw() {
    stroke(0);
    fill(this.color);
    circle(this.pos.x, this.pos.y, this.size);
    fill(255);
    rect(this.pos.x - this.size / 2, this.pos.y - this.size / 2 - 10, this.size, 6);
    fill(255, 0, 0);
    rect(
      this.pos.x - this.size / 2,
      this.pos.y - this.size / 2 - 10,
      (this.size / this.life) * this.health,
      6
    );
  }

  die() {
    enemies.delete(this);
  }

  checkCollision() {
    if (trainPos.dist(this.pos) < this.size / 2 + (GRID_SIZE * 0.7) / 2) {
      this.dieDamage();
      return;
    }
    for (let wagon of wagons) {
      if (wagon.pos.dist(this.pos) < this.size / 2 + wagon.size / 2) {
        this.dieDamage();
        return;
      }
    }
  }

  move() {
    const dir = p5.Vector.sub(checkpoints[this.checkpointIndex], this.pos);
    const speed = this.speed;

    if (dir.mag() > speed) {
      dir.normalize();
      dir.mult(speed);
    }

    this.pos.add(dir);

    if (checkpoints[this.checkpointIndex].dist(this.pos) <= 0.05) {
      this.checkpointIndex++;
      if (this.checkpointIndex >= checkpoints.length) {
        this.dieDamage();
      }
    }
  }

  dieDamage() {
    this.die();
    lifes -= this.damage;
  }

  update() {
    if (this.health <= 0) {
      this.die();
      return;
    }
    this.move();
    this.checkCollision();
    this.draw();
  }
}

function spawnEnemies() {
  if (waveIndex >= WAVES.length) return;

  const wave = WAVES[waveIndex];

  if (nextEnemyTime <= time && !pauseWave) {
    enemies.add(new Enemy(wave.type));
    nextEnemyTime = time + wave.cooldown;
    wave.count--;
  }

  if (wave.count <= 0) {
    money += wave.money;
    pauseWave = true;
    waveIndex++;
  }
}
