#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import AdmZip from "adm-zip";

const args = process.argv.slice(2);

if (!args.length) {
  console.error('Usage: sir "card title" -d "optional description"');
  process.exit(1);
}

let cardTitle: string | undefined;
let cardDescription: string | null;
const cardId = randomUUID().toUpperCase();

function cfAbsoluteTimeNow(date: Date = new Date()): number {
  const appleEpochMs = new Date("2001-01-01T00:00:00Z").getTime();
  return Math.floor((date.getTime() - appleEpochMs) / 1000);
}

if (args.includes("-d")) {
  const descriptionIndex = args.indexOf("-d");
  cardDescription = `# Context \n ${args[descriptionIndex + 1]}`;
  cardTitle = args[descriptionIndex - 1];

  if (!cardTitle) {
    console.error("Missing title");
    process.exit(1);
  }
} else {
  cardDescription = null;
  cardTitle = args.join(" ");
}

function zipSync() {
  const zip = new AdmZip();
  const srcDir = path.normalize(
    "/Users/nickolas.shtayn/Library/Mobile Documents/com~apple~CloudDocs/RetrievalKanban"
  );
  const rootName = "RetrievalKanban";

  zip.addLocalFolder(srcDir, rootName);

  zip.writeZip(
    path.join(
      "/Users/nickolas.shtayn/Library/Mobile Documents/com~apple~CloudDocs",
      "RetrievalKanban.zip"
    )
  );
}

function addCardToNotePlan() {
  const newTask = `* Add ${cardTitle} to Ahmni`;
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
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
  longText: cardDescription ?? "",
  date: cfAbsoluteTimeNow(),
  colorTag: "1.0004385709762573,0.22760793566703796,0.18670153617858887,1.0",
  fileIDs: [],
};

const cardPath = path.join(
  path.normalize(
    "/Users/nickolas.shtayn/Library/Mobile Documents/com~apple~CloudDocs"
  ),
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
}
writeFileSync(cardPath, JSON.stringify(card));
zipSync();
addCardToNotePlan();
