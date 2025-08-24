#!/usr/bin/env node
import fs, { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const args = process.argv.slice(2);

if (!args.length) {
  console.error("Usage: sir <card title> -d <optional description>");
  process.exit(1);
}

let cardTitle: string;
let cardDescription: string | null;
const cardId = randomUUID().toUpperCase();

function cfAbsoluteTimeNow(date: Date = new Date()): number {
  const appleEpochMs = new Date("2001-01-01T00:00:00Z").getTime();
  return Math.floor((date.getTime() - appleEpochMs) / 1000);
}

if (args.includes("-d")) {
  const descriptionIndex = args.indexOf("-d");
  cardDescription = `# Context \n - ${args
    .slice(descriptionIndex + 1)
    .join(" ")}`;
  cardTitle = args.slice(0, descriptionIndex).join(" ");
} else {
  cardDescription = null;
  cardTitle = args.join(" ");
}

function addCardToNotePlan() {
  const newTask = `* Add ${cardTitle} to Ahmni`;
  const today = new Date();
  const year = today.getFullYear();
  const month = "0" + (today.getMonth() + 1);
  const day = today.getDate();

  const notePlanFile = `${year}${month}${day}.md`;
  const calendarNotesPath = path.normalize(
    "/Users/nickolas.shtayn/Library/Containers/co.noteplan.NotePlan3/Data/Library/Application Support/co.noteplan.NotePlan3/Calendar"
  );

  const exactPath = path.join(calendarNotesPath, notePlanFile);
  const noteContentByLine = readFileSync(exactPath, "utf8").split("\n");
  const endOfTaskSectionIndex = noteContentByLine.indexOf("---");
  noteContentByLine.splice(endOfTaskSectionIndex, 0, newTask);
  const updatedNoteContent = noteContentByLine.join("\n");

  writeFileSync(exactPath, updatedNoteContent);
}

const card = {
  id: cardId,
  title: cardTitle,
  shortText: "---",
  longText: cardDescription ? cardDescription : "",
  date: cfAbsoluteTimeNow(),
  colorTag: "1.0004385709762573,0.22760793566703796,0.18670153617858887,1.0",
  fileIDs: [],
};

const cardPath = path.join(
  "/Users/nickolas.shtayn/Library/Mobile Documents/com~apple~CloudDocs",
  "RetrievalKanban",
  "AllItems",
  `${cardId}.KanbanItem.json`
);

if (
  existsSync(
    path.join(
      "/Users/nickolas.shtayn/Library/Mobile Documents/com~apple~CloudDocs",
      "RetrievalKanban"
    )
  )
) {
  const kanbanColumn = JSON.parse(
    readFileSync(
      path.join(
        "/Users/nickolas.shtayn/Library/Mobile Documents/com~apple~CloudDocs",
        "RetrievalKanban",
        "KanbanBoard.json"
      ),
      "utf8"
    )
  );
  const currentCardIds = kanbanColumn.columns[0].itemIds;
  currentCardIds.push(cardId);

  writeFileSync(
    path.join(
      "/Users/nickolas.shtayn/Library/Mobile Documents/com~apple~CloudDocs",
      "RetrievalKanban",
      "KanbanBoard.json"
    ),
    JSON.stringify(kanbanColumn)
  );

  writeFileSync(cardPath, JSON.stringify(card));
  addCardToNotePlan();
} else {
  mkdirSync(
    path.join(
      "/Users/nickolas.shtayn/Library/Mobile Documents/com~apple~CloudDocs",
      "RetrievalKanban",
      "AllItems"
    ),
    { recursive: true }
  );

  const kanbanBoardContents = {
    columns: [
      {
        itemIds: [cardId],
        id: "B40E8971-9B3A-4B37-950F-5E336458512A",
        format: "full",
        title: "Prior Knowledge",
      },
    ],
  };

  writeFileSync(
    path.join(
      "/Users/nickolas.shtayn/Library/Mobile Documents/com~apple~CloudDocs",
      "RetrievalKanban",
      "KanbanBoard.json"
    ),
    JSON.stringify(kanbanBoardContents)
  );

  writeFileSync(cardPath, JSON.stringify(card));
  addCardToNotePlan();
}
