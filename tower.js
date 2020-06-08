const towers = new Set();

let selectedTowerType = 0;

const TOWER_TYPES = [
  {
    damage: [4, 4, 4, 2],
    range: [3, 3.5, 4, 4.5],
    reload: [16, 8, 4, 1],
    size: [0.7, 0.8, 0.9, 1],
    color: [150, 135, 120, 105],
    targetCount: [1, 1, 1, 1],
    barrelWidth: 4.5,
    barrelHeight: 0.9,
  },
  {
    damage: [10, 20, 30, 60],
    range: [5, 6, 7, 8],
    reload: [32, 32, 24, 24],
    size: [0.6, 0.7, 0.8, 0.9],
    color: [145, 160, 185, 200],
    targetCount: [1, 1, 1, 1],
    barrelWidth: 5,
    barrelHeight: 1.25,
  },
  {
    damage: [2, 4, 8, 16],
    range: [3, 3.4, 4.6, 5],
    reload: [20, 18, 16, 14],
    size: [0.65, 0.7, 0.75, 0.8],
    color: [90, 75, 60, 45],
    targetCount: [4, 5, 6, 7],
    barrelWidth: 3,
    barrelHeight: 0,
  },
];

class Tower {
  constructor(x, y, towerType, wagonIndex) {
    this.pos = createVector(x, y);
    this.type = TOWER_TYPES[towerType];
    this.angle = 0;
    this.level = 0;
    this.selected = false;
    this.wagonIndex = wagonIndex;
    this.reload = this.type.reload[this.level];
  }

  draw() {
    const size = this.type.size[this.level] * GRID_SIZE;
    const barrelW = size / this.type.barrelWidth;
    const barrelH = size * this.type.barrelHeight;

    stroke(this.selected ? 250 : 0);
    fill(this.type.color[this.level]);
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);
    rect(-barrelW / 2, 0, barrelW, barrelH);
    pop();
    circle(this.pos.x, this.pos.y, size);
    noFill();
    stroke(230);
    circle(this.pos.x, this.pos.y, (this.type.range[this.level] * GRID_SIZE + 0.5 * GRID_SIZE) * 2);
  }

  shoot() {
    this.reload--;
    if (this.reload > 0) {
      return;
    } else {
      let targetsLeft = this.type.targetCount[this.level];
      const range = this.type.range[this.level] * GRID_SIZE + 0.5 * GRID_SIZE;
      for (let enemy of enemies) {
        if (targetsLeft <= 0) break;
        if (enemy.pos.dist(this.pos) < range + enemy.size / 2 && enemy.health > 0) {
          enemy.health -= this.type.damage[this.level];
          this.angle = -atan2(enemy.pos.x - this.pos.x, enemy.pos.y - this.pos.y);
          stroke(255, 255, 0);
          strokeWeight(size / this.type.barrelWidth[this.level] / 2);
          line(this.pos.x, this.pos.y, enemy.pos.x, enemy.pos.y);
          strokeWeight(1);
          targetsLeft--;
        }
      }
      this.reload = this.type.reload[this.level];
    }
  }

  upgrade() {
    this.level++;
  }

  update() {
    this.shoot();
    this.draw();
  }
}
