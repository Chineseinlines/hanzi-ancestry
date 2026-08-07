import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchWordBook, addToWordBook, removeFromWordBook } from '../lib/database';

const STORAGE_KEY = 'hanzi-wordbook';

function loadLocal(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveLocal(chars: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chars));
}

export function useWordBook() {
  const [words, setWords] = useState<string[]>(loadLocal());
  const { user, configured } = useAuth();

  // Load from cloud on login
  useEffect(() => {
    if (user && configured) {
      fetchWordBook(user.id).then(cloud => {
        if (cloud.length > 0) {
          setWords(cloud);
          saveLocal(cloud);
        }
      });
    }
  }, [user, configured]);

  // Persist to localStorage
  useEffect(() => { saveLocal(words); }, [words]);

  const has = useCallback((char: string) => words.includes(char), [words]);

  const add = useCallback((char: string) => {
    setWords(prev => prev.includes(char) ? prev : [...prev, char]);
    if (user && configured) addToWordBook(user.id, char);
  }, [user, configured]);

  const remove = useCallback((char: string) => {
    setWords(prev => prev.filter(c => c !== char));
    if (user && configured) removeFromWordBook(user.id, char);
  }, [user, configured]);

  const toggle = useCallback((char: string) => {
    if (words.includes(char)) remove(char);
    else add(char);
  }, [words, add, remove]);

  return { words, has, add, remove, toggle };
}
