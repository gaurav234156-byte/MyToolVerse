"use client";

import * as React from "react";
import { Plus, Trash2, ChevronLeft, ChevronRight, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Flashcard {
  id: string;
  term: string;
  definition: string;
}

const STORAGE_KEY = "mytoolverse-flashcards";

export function FlashcardMakerEngine() {
  const [cards, setCards] = React.useState<Flashcard[]>([]);
  const [term, setTerm] = React.useState("");
  const [definition, setDefinition] = React.useState("");
  const [index, setIndex] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setCards(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    } catch {
      // ignore
    }
  }, [cards]);

  function addCard() {
    if (!term.trim() || !definition.trim()) return;
    setCards([...cards, { id: crypto.randomUUID(), term, definition }]);
    setTerm("");
    setDefinition("");
  }

  function deleteCurrent() {
    if (cards.length === 0) return;
    const next = cards.filter((_, i) => i !== index);
    setCards(next);
    setIndex(0);
    setFlipped(false);
  }

  function shuffle() {
    setCards([...cards].sort(() => Math.random() - 0.5));
    setIndex(0);
    setFlipped(false);
  }

  function go(delta: number) {
    if (cards.length === 0) return;
    setIndex((i) => (i + delta + cards.length) % cards.length);
    setFlipped(false);
  }

  const current = cards[index];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Term"
          className="h-11 rounded-xl border border-input bg-background px-4 text-sm"
        />
        <input
          value={definition}
          onChange={(e) => setDefinition(e.target.value)}
          placeholder="Definition"
          className="h-11 rounded-xl border border-input bg-background px-4 text-sm"
        />
      </div>
      <Button onClick={addCard} className="self-start" disabled={!term.trim() || !definition.trim()}>
        <Plus className="h-4 w-4" />
        Add card
      </Button>

      {cards.length === 0 ? (
        <p className="rounded-xl bg-surface px-4 py-8 text-center text-sm text-muted-foreground">
          No flashcards yet — add one above to get started.
        </p>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground">Card {index + 1} of {cards.length}</p>
          <div
            onClick={() => setFlipped(!flipped)}
            className="flex h-56 w-full max-w-md cursor-pointer items-center justify-center rounded-2xl border border-border bg-surface px-6 text-center text-lg font-medium shadow-sm transition-colors hover:bg-accent"
          >
            {flipped ? current.definition : current.term}
          </div>
          <p className="text-xs text-muted-foreground">Tap the card to flip</p>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="icon" onClick={() => go(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" onClick={shuffle}>
              <Shuffle className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" onClick={() => go(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="icon" onClick={deleteCurrent}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}