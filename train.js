const MOVE_COOLDOWN = 10;

const wagons = [];

let trainPos;
let nextMoveTime = 0;

class Wagon {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.size = GRID_SIZE * 0.9;
  }

  draw() {
    stroke(0);
    fill(0);
    rect(
      this.pos.x - (GRID_SIZE * 0.9) / 2,
      this.pos.y - (GRID_SIZE * 0.9) / 2,
      GRID_SIZE * 0.9,
      GRID_SIZE * 0.9
    );
  }
}

function checkMoveTrain() {
  if (keyIsPressed && nextMoveTime <= time) {
    if (keys.w || keys.a || keys.s || keys.d) {
      moveTrain();
      nextMoveTime = time + MOVE_COOLDOWN;
    }
  }
}

function moveTrain() {
  let newPos = trainPos.copy();

  if (keys.w) newPos.y -= GRID_SIZE;
  else if (keys.a) newPos.x -= GRID_SIZE;
  else if (keys.s) newPos.y += GRID_SIZE;
  else if (keys.d) newPos.x += GRID_SIZE;

  for (let wagon of wagons) {
    if (wagon.pos.equals(newPos)) return;
  }

  if (
    newPos.x > GRID_SIZE * 2 &&
    newPos.x < windowWidth &&
    newPos.y > 0 &&
    newPos.y < windowHeight
  ) {
    for (let i = wagons.length - 1; i > 0; i--) {
      wagons[i].pos = wagons[i - 1].pos;
    }
    wagons[0].pos = trainPos;
    trainPos = newPos;
    for (let tower of towers) tower.pos = wagons[tower.wagonIndex].pos.copy();
  }
}

function drawTrain() {
  wagons.forEach((w) => w.draw());

  fill(0);
  stroke(0);
  rect(
    trainPos.x - (GRID_SIZE * 0.7) / 2,
    trainPos.y - (GRID_SIZE * 0.7) / 2,
    GRID_SIZE * 0.7,
    GRID_SIZE * 0.7
  );
}
