/**
 * @file Lifegame config and management utils
 * @author Ridiger Daniil Dmitrievich, 2023
 */

"use strict";

/**
 * @description Lifegame config
 */

/**
 * Array with cells of the Lifegame field
 * @const {Array} fields
 */
const fields = [];

/**
 * Lifegame root element
 * @const {HTMLElement} lifegame
 */
const lifegame = document.querySelector("#lifegame");

/**
 * Lifegame management button
 * @const {HTMLButtonElement} button
 */
const button = document.querySelector("button");

/**
 * Lifegame started/stopped flag
 * @const {boolean} gameStarted
 */
let gameStarted = false;

/**
 * Lifegame playing field general size
 * @const {number} size
 */
let size = Math.sqrt(fieldsAmount);

/**
 * Lifegame playing field horizontal size
 * @const {number} sizeX
 */
let sizeX = 0;

/**
 * Lifegame playing field vertical size
 * @const {number} sizeY
 */
let sizeY = Math.round(size);

/**
 * Initializes the Lifegame playing field
 * @function
 */
function generateField() {
  if (fieldsAmount === 0) return;

  if (size % Math.floor(size) === 0) {
    sizeX = Math.floor(size);
  } else {
    sizeX = Math.floor(size) + 1;
  }

  for (let i = 0; i < fieldsAmount; i++) {
    let x = i === 0 ? 0 : i % sizeX;
    let y = i === 0 ? 0 : Math.floor(i / sizeX);

    fields.push({
      x,
      y,
      alive: false,
      willBeAlive: false,
    });

    const div = document.createElement("div");
    div.className = "field";
    div.addEventListener("click", makeAlive.bind(null, i));
    lifegame.append(div);
  }

  lifegame.style.width = `${sizeX * 50 + 2}px`;
  lifegame.style.height = `${sizeY * 50 + 2}px`;
}

/**
 * Marks cell as alive or not
 * @function
 * @param {number} index - index of cell
 */
function makeAlive(index) {
  if (gameStarted) return;

  fields[index].alive = !fields[index].alive;

  const field = document.querySelectorAll(".field")[index];

  if (field.classList.contains("alive-field")) {
    field.className = "field";
  } else {
    field.className = "field alive-field";
  }
}

/**
 * Intended deffering of Lifegame turns for clarity
 * @function
 */
function wait() {
  return new Promise(resolve => setTimeout(resolve, 1000));
}

/**
 * Setting all cells to its default state
 * @function
 */
function clearFields() {
  if (gameStarted) return;

  fields.forEach((field, index) => {
    const fieldBlock = document.querySelectorAll(".field")[index];

    field.alive = false;
    fieldBlock.className = "field";
  });
}

/**
 * Stop Lifegame
 * @function
 */
function endGame() {
  fields.forEach((field) => {
    field.willBeAlive = false;
  });

  endgame.style.display = "block";
  button.textContent = "Start game";
  gameStarted = false;
}

/**
 * Start Lifegame
 * @function
 */
async function game() {
  if (!gameStarted && fields.findIndex((field) => field.alive) === -1) return;

  const endgame = document.querySelector("#endgame");

  if (gameStarted) {
    gameStarted = false;
    endGame();
    return;
  }

  gameStarted = true;
  button.textContent = "Stop game";
  endgame.style.display = "none";

  let prevFields = 0;
  let sameSituation = 0;

  while (fields.findIndex((field) => field.alive) !== -1 && gameStarted) {
    const aliveFields = fields.filter((field) => field.alive).length;

    if (prevFields === aliveFields) {
      sameSituation++;
    } else {
      prevFields = aliveFields;
      sameSituation = 0;
    }

    if (sameSituation >= 10) {
      endgame.style.display = "block";
      break;
    }

    await wait();

    turn(true);
    turn(false);
  }

  endGame();
}

/**
 * Making turns of Lifegame. First turn will find all cells that will be
 * alive in next turn. Second turn sets all cells that will be lifeless
 * in next turn to its default state.
 * @function
 * @param {boolean} isFirst - turn sequence sign
 */
function turn(isFirst) {
  for (let i = 0; i < fieldsAmount; i++) {
    const field = fields[i];
    const fieldBlock = document.querySelectorAll(".field")[i];
    let willBeAlive = 0;

    if (isFirst && field.alive) continue;

    const x = field.x;
    const y = field.y;

    const neighborTopLeft = fields.find((field) => field.x === x - 1 && field.y === y - 1);
    const neighborTop = fields.find((field) => field.x === x && field.y === y - 1);
    const neighborTopRight = fields.find((field) => field.x === x + 1 && field.y === y - 1);
    const neighborLeft =  fields.find((field) => field.x === x - 1 && field.y === y);
    const neighborRight =  fields.find((field) => field.x === x + 1 && field.y === y);
    const neighborBottomLeft = fields.find((field) => field.x === x - 1 && field.y === y + 1);
    const neighborBottom = fields.find((field) => field.x === x && field.y === y + 1);
    const neighborBottomRight = fields.find((field) => field.x === x + 1 && field.y === y + 1);

    neighborTopLeft && neighborTopLeft.alive && willBeAlive++;
    neighborTop && neighborTop.alive && willBeAlive++;
    neighborTopRight && neighborTopRight.alive && willBeAlive++;
    neighborLeft && neighborLeft.alive && willBeAlive++;
    neighborRight && neighborRight.alive && willBeAlive++;
    neighborBottomLeft && neighborBottomLeft.alive && willBeAlive++;
    neighborBottom && neighborBottom.alive && willBeAlive++;
    neighborBottomRight && neighborBottomRight.alive && willBeAlive++;

    if (isFirst && willBeAlive >= 3) {
      field.willBeAlive = true;
      fieldBlock.className = "field alive-field";
    } else if (willBeAlive < 3 && !isFirst) {
      field.alive = false;
      fieldBlock.className = "field";
    }
  }

  if (isFirst) {
    for (let i = 0; i < fieldsAmount; i++) {
      if (fields[i].willBeAlive) {
        fields[i].willBeAlive = false;
        fields[i].alive = true;
      }
    }
  }
}

/**
 * @description Creating the Lifegame field
 */
generateField();