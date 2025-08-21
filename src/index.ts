#!/usr/bin/env node
import fsp from "fs/promises";
import fs, { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const args = process.argv.slice(2);

if (!args.length || args.length < 2) {
  console.error("sir <card title> <description>");
  process.exit(1);
}

const title = args[0];
const description = args[1];
const id = randomUUID().toUpperCase();

const dir = path.join(
  path.normalize(
    "/Users/nickolas.shtayn/Library/Mobile Documents/com~apple~CloudDocs"
  ),
  "RetrievalKanban",
  "AllItems"
);

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

async function createKanbanBoard() {
  const kanbanBoardContents = {
    columns: [
      {
        itemIds: [id],
        title: "Column",
        id: randomUUID().toUpperCase(), // replace with column you want
        format: "full",
      },
    ],
  };

  await fsp.writeFile(
    path.join(
      path.normalize(
        "/Users/nickolas.shtayn/Library/Mobile Documents/com~apple~CloudDocs"
      ),
      "RetrievalKanban",
      "KanbanBoard.json"
    ),
    JSON.stringify(kanbanBoardContents),
    {
      flag: "wx",
    }
  );
}

function cfAbsoluteTimeNow(date: Date = new Date()): number {
  const appleEpochMs = new Date("2001-01-01T00:00:00Z").getTime();
  return Math.floor((date.getTime() - appleEpochMs) / 1000);
}

async function createRetrievalCard() {
  const retrievalCardContents = {
    title,
    colorTag: "1.0004385709762573,0.22760793566703796,0.18670153617858887,1.0",
    shortText: "sir-cli",
    longText: description,
    id,
    fileIDs: [],
    date: cfAbsoluteTimeNow(),
  };

  await fsp.writeFile(
    path.join(
      path.normalize(
        "/Users/nickolas.shtayn/Library/Mobile Documents/com~apple~CloudDocs"
      ),
      "RetrievalKanban",
      `/AllItems/${id}.KanbanItem.json`
    ),
    JSON.stringify(retrievalCardContents),
    {
      flag: "wx",
    }
  );
}

function addNotePlanTask() {
  const newTask = `\n* Add ${title} to Ahmni`;
  const today = new Date();
  const year = today.getFullYear();
  const month = "0" + (today.getMonth() + 1);
  const day = today.getDate();

  const notePlanFile = `${year}${month}${day}.md`;
  const calendarNotesPath = path.normalize(
    "/Users/nickolas.shtayn/Library/Containers/co.noteplan.NotePlan3/Data/Library/Application Support/co.noteplan.NotePlan3/Calendar"
  );

  const exactPath = path.join(calendarNotesPath, notePlanFile);
  const noteContent = readFileSync(exactPath, "utf8");
  writeFileSync(exactPath, noteContent + newTask);
}

createKanbanBoard();
createRetrievalCard();
addNotePlanTask();
