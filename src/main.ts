import "./style.css";

type CellStatus = "hidden" | "visible" | "flagged";

interface Cell {
  value: number;
  status: CellStatus;
}

const canvas = document.getElementById("canvas-element") as HTMLCanvasElement;
const context = canvas.getContext("2d") as CanvasRenderingContext2D;

const minesAmount = 10;
const size = 50;
const width = 10;
const height = 10;

let board: Array<Array<Cell>> = [];

canvas.width = width * size;
canvas.height = height * size;

function findFreeCell() {
  let cell;

  while (true) {
    let x = Math.floor(Math.random() * width);
    let y = Math.floor(Math.random() * height);
    if (board[y][x].value !== -1) {
      cell = { y, x };
      break;
    }
  }

  return cell;
}

function generateBoard() {
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
    const { x, y } = findFreeCell();
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

  if (
    board[y][x].status === "visible" ||
    board[y][x].status === "flagged" ||
    board[y][x].value !== 0
  )
    return;

  board[y][x].status = "visible";

  fill(y, x + 1);
  fill(y, x - 1);
  fill(y - 1, x);
  fill(y + 1, x);
}

function renderBoard() {
  for (let rowIdx = 0; rowIdx < board.length; rowIdx++) {
    const row = board[rowIdx];

    for (let colIdx = 0; colIdx < row.length; colIdx++) {
      const col = row[colIdx];

      if (col.status === "hidden") context.fillStyle = "darkgray";
      if (col.status === "flagged") context.fillStyle = "pink";
      if (col.status === "visible") context.fillStyle = "violet";

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
        context.fillStyle = "black";
        context.font = "20px serif";
        context.fillText(
          col.value.toString(),
          rowIdx * size + size / 2 - 5,
          colIdx * size + size / 2 + 7
        );
      }
    }
  }
}

function renderLines() {
  for (let x = 1; x < width; x++) {
    context.fillStyle = "black";
    context.fillRect(x * size, 0, 2, height * size);
  }

  for (let y = 1; y < width; y++) {
    context.fillStyle = "black";
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

generateBoard();

if (context) {
  context.fillStyle = "gray";
  context.fillRect(0, 0, width * size, height * size);

  renderBoard();
  renderLines();
}

canvas.addEventListener("mousedown", (evt: MouseEvent) => {
  evt.preventDefault();
  evt.stopPropagation();
  evt.stopImmediatePropagation();

  console.log(evt);

  const primary = evt.button === 0;

  const x = Math.floor(evt.offsetY / size);
  const y = Math.floor(evt.offsetX / size);

  const cellClicked = board[y][x];

  console.log(
    "Clicking on: X=",
    x,
    " Y=",
    y,
    " Celda=",
    JSON.stringify(cellClicked)
  );

  if (!primary && cellClicked.status !== "hidden") {
    board[y][x].status = "flagged";
    renderBoard();
    renderLines();
    return;
  }

  if (primary && cellClicked.value === -1) {
    console.log("Game Over ☠️");
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
