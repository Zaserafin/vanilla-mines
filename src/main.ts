import "./style.css";

type CellStatus = "hidden" | "visible" | "flagged";

interface Cell {
  value: number;
  status: CellStatus;
}

const colors = [
  "#c0c0c0",
  "#0406F5",
  "#0D7A09",
  "#E90A03",
  "#080272",
  "#81020D",
  "#008080",
  "red",
  "red",
];

const canvas = document.getElementById("canvas-element") as HTMLCanvasElement;
const context = canvas.getContext("2d") as CanvasRenderingContext2D;

const timeCounterElement = document.getElementById("time-counter");
const flagsCounterElement = document.getElementById("flags-counter");
const resetButtonElement = document.getElementById("reset-button");

let secondsTimer: number | null = null;

const minesAmount = 9;
const size = 50;
const width = 9;
const height = 9;

const data = {
  flagsUsed: 0,
  seconds: 0,
};

let started: boolean = false;
let board: Array<Array<Cell>> = Array.from({ length: height }, () =>
  Array.from({ length: width }, () => ({
    value: 0,
    status: "hidden",
  }))
);

canvas.width = width * size;
canvas.height = height * size;

var myFont = new FontFace("tiny5", "url(/vanilla-mines/Tiny5-Regular.ttf)");
await myFont.load().then(function (font) {
  document.fonts.add(font);

  console.log("Font loaded");
  context.font = "50px myFont";
});

function incrementSeconds() {
  if (!timeCounterElement) return;
  data.seconds++;
  timeCounterElement.setHTMLUnsafe(data.seconds.toString().padStart(3, "0"));
}

function findFreeCell(exclude?: { x: number; y: number }) {
  let cell;

  while (true) {
    let x = Math.floor(Math.random() * width);
    let y = Math.floor(Math.random() * height);
    if (board[y][x].value !== -1 && x !== exclude?.x && y !== exclude?.y) {
      cell = { y, x };
      break;
    }
  }

  return cell;
}

function generateBoard(intialPost: { x: number; y: number }) {
  for (let y = 0; y < height; y++) {
    let row: Array<Cell> = [];
    for (let x = 0; x < width; x++) {
      row.push({
        value: 0,
        status: "hidden",
      });
    }
    board.push(row);
  }

  for (let mines = 0; mines < minesAmount; mines++) {
    const { x, y } = findFreeCell(intialPost);
    board[y][x].value = -1;

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) {
          continue;
        }

        const nx = x + dx;
        const ny = y + dy;

        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          if (board[ny][nx].value === -1) {
            continue;
          }

          board[ny][nx].value = board[ny][nx].value + 1;
        }
      }
    }
  }
}

function validCoordinates(y: number, x: number) {
  return y >= 0 && y < board.length && x >= 0 && x < board[y].length;
}

function fill(y: number, x: number) {
  if (!validCoordinates(y, x)) return;

  const cell = board[y][x];

  if (
    cell.status === "visible" ||
    cell.status === "flagged" ||
    cell.value === -1
  )
    return;

  cell.status = "visible";
  if (cell.value !== 0) return;

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dy === 0 && dx === 0) continue;
      fill(y + dy, x + dx);
    }
  }
}

function renderBoard() {
  for (let rowIdx = 0; rowIdx < board.length; rowIdx++) {
    const row = board[rowIdx];

    for (let colIdx = 0; colIdx < row.length; colIdx++) {
      const col = row[colIdx];

      if (col.status === "hidden") context.fillStyle = "#a1a1a1ff";
      if (col.status === "flagged") context.fillStyle = "pink";
      if (col.status === "visible") context.fillStyle = "#c0c0c0";

      if (col.value === -1 && col.status === "visible") {
        context.fillStyle = "red";
      }

      context.fillRect(
        rowIdx * size,
        colIdx * size,
        width * size,
        height * size
      );

      if (col.value !== 0 && col.status === "visible") {
        context.fillStyle = colors[col.value];
        context.font = "30px Tiny5";
        context.fillText(
          col.value.toString(),
          rowIdx * size + size / 2 - 5,
          colIdx * size + size / 2 + 10
        );
      }
    }
  }
}

function renderLines() {
  for (let x = 1; x < width; x++) {
    context.fillStyle = "#63615b";
    context.fillRect(x * size, 0, 2, height * size);
  }

  for (let y = 1; y < width; y++) {
    context.fillStyle = "#63615b";
    context.fillRect(0, y * size, width * size, 2);
  }
}

function toggleAllBoard() {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cell = board[y][x];
      cell.status = "visible";
    }
  }
}

function updateFlags() {
  if (!flagsCounterElement) return;
  const minesRemaining = minesAmount - data.flagsUsed;
  flagsCounterElement?.setHTMLUnsafe(
    minesRemaining.toString().padStart(3, "0")
  );
}

function start(intialPost: { x: number; y: number }) {
  // board = [];
  started = true;

  board = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => ({
      value: 0,
      status: "hidden",
    }))
  );
  console.log("Ignoring: ", intialPost);
  generateBoard(intialPost);
  data.seconds = 0;
  data.flagsUsed = 0;
  updateFlags();
  if (timeCounterElement)
    timeCounterElement.setHTMLUnsafe(data.seconds.toString().padStart(3, "0"));
  if (secondsTimer) clearInterval(secondsTimer);
  secondsTimer = setInterval(incrementSeconds, 1000);

  renderBoard();
  renderLines();
}

function reset() {
  started = false;
  data.seconds = 0;
  data.flagsUsed = 0;
  updateFlags();
  if (timeCounterElement)
    timeCounterElement.setHTMLUnsafe(data.seconds.toString().padStart(3, "0"));
  if (secondsTimer) clearInterval(secondsTimer);

  board = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => ({
      value: 0,
      status: "hidden",
    }))
  );

  renderBoard();
  renderLines();
}

if (context) {
  context.fillStyle = "#a1a1a1ff";
  context.fillRect(0, 0, width * size, height * size);

  renderBoard();
  renderLines();
}

resetButtonElement?.addEventListener("click", (evt: PointerEvent) => {
  evt.preventDefault();
  evt.stopPropagation();
  evt.stopImmediatePropagation();

  console.log("reseteando");
  reset();
});

document.addEventListener("contextmenu", (e) => e.preventDefault());

canvas.addEventListener("mousedown", (evt: MouseEvent) => {
  evt.preventDefault();
  evt.stopPropagation();
  evt.stopImmediatePropagation();

  const primary = evt.button === 0;

  const x = Math.floor(evt.offsetY / size);
  const y = Math.floor(evt.offsetX / size);

  if (!started) {
    start({ x, y });
  }

  const cellClicked = board[y][x];

  if (cellClicked.status === "visible") return;

  if (!primary) {
    if (cellClicked.status === "flagged") {
      board[y][x].status = "hidden";
      data.flagsUsed = Math.max(0, data.flagsUsed - 1);
    } else {
      board[y][x].status = "flagged";
      data.flagsUsed = Math.max(0, data.flagsUsed + 1);
    }

    updateFlags();
    renderBoard();
    renderLines();
    return;
  }

  if (primary && cellClicked.value === -1) {
    console.log("Game Over ☠️");
    if (secondsTimer) clearInterval(secondsTimer);
    toggleAllBoard();

    renderBoard();
    renderLines();
    return;
  }

  if (primary && cellClicked.value === 0) {
    fill(y, x);

    renderBoard();
    renderLines();
    return;
  }

  if (primary) {
    // cellClicked.status = "visible";

    board[y][x].status = "visible";
    renderBoard();
    renderLines();
  }
});

// start();

reset();
