"use client";

import { useEffect, useState } from "react";

const phrases = [
  "То, что ты чувствуешь, можно рассказать.",
  "Твоим мыслям найдётся место.",
  "Говори о важном своими словами.",
  "Каждая большая идея начинается с одной строки.",
  "Здесь можно быть услышанным.",
  "Делись тем, что не хочется оставлять внутри.",
  "Твой голос важнее идеального текста.",
  "Мысли становятся ближе, когда ими делятся.",
  "Расскажи миру, что видишь именно ты.",
  "Начни с пары слов. Остальное придёт.",
];

const brandName = "Pulse";

export function AuthBrand() {
  const [word, setWord] = useState("P");
  const [phrase, setPhrase] = useState("");
  const [cursorOnPhrase, setCursorOnPhrase] = useState(false);

  useEffect(() => {
    let wordLength = 1;
    let phraseLength = 0;
    let phraseIndex = Math.floor(Math.random() * phrases.length);
    let currentPhrase = phrases[phraseIndex];
    let timer = 0;

    function schedule(callback: () => void, delay: number) {
      timer = window.setTimeout(callback, delay);
    }

    function typeWord() {
      wordLength += 1;
      setWord(brandName.slice(0, wordLength));

      if (wordLength < brandName.length) {
        schedule(typeWord, 260);
      } else {
        schedule(typePhrase, 450);
      }
    }

    function typePhrase() {
      setCursorOnPhrase(true);
      phraseLength += 1;
      setPhrase(currentPhrase.slice(0, phraseLength));

      if (phraseLength < currentPhrase.length) {
        schedule(typePhrase, 42);
      } else {
        schedule(erasePhrase, 2200);
      }
    }

    function erasePhrase() {
      phraseLength -= 1;
      setPhrase(currentPhrase.slice(0, phraseLength));

      if (phraseLength > 0) {
        schedule(erasePhrase, 20);
      } else {
        schedule(eraseWord, 300);
      }
    }

    function eraseWord() {
      setCursorOnPhrase(false);
      wordLength -= 1;
      setWord(brandName.slice(0, wordLength));

      if (wordLength > 1) {
        schedule(eraseWord, 120);
      } else {
        let nextIndex = phraseIndex;
        while (nextIndex === phraseIndex) {
          nextIndex = Math.floor(Math.random() * phrases.length);
        }
        phraseIndex = nextIndex;
        currentPhrase = phrases[phraseIndex];
        phraseLength = 0;
        schedule(typeWord, 650);
      }
    }

    schedule(typeWord, 650);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className="flex min-h-52 flex-col items-center justify-center bg-[#f2f2f2] px-8 py-10 text-center text-black lg:min-h-screen">
      <div className="inline-flex items-center" aria-label="Pulse">
        <span className="min-w-[5.2ch] text-center text-7xl leading-none font-extrabold tracking-tight sm:text-8xl lg:text-[124px]">
          <span>{word}</span>
          {!cursorOnPhrase && <span className="typewriter-cursor typewriter-cursor-lg" />}
        </span>
      </div>
      <p className="mt-6 min-h-14 max-w-md text-lg font-medium leading-7 lg:text-xl">
        <span>{phrase}</span>
        {cursorOnPhrase && <span className="typewriter-cursor" />}
      </p>
    </section>
  );
}
