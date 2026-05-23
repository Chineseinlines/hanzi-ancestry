import { useState, useEffect, useCallback } from 'react';

export interface FavoriteEntry {
  char: string;
  addedAt: number;
  folder: string;
}

const STORAGE_KEY = 'hanzi-favorites';
const FOLDERS_KEY = 'hanzi-folders';

function loadFavorites(): FavoriteEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveFavorites(entries: FavoriteEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function loadFolders(): string[] {
  try {
    const raw = localStorage.getItem(FOLDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveFolders(folders: string[]): void {
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteEntry[]>(loadFavorites);
  const [folders, setFolders] = useState<string[]>(loadFolders);

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  useEffect(() => {
    saveFolders(folders);
  }, [folders]);

  const isFavorite = useCallback((char: string): boolean => {
    return favorites.some((f) => f.char === char);
  }, [favorites]);

  const addFavorite = useCallback((char: string, folder = '默认') => {
    setFavorites((prev) => {
      if (prev.some((f) => f.char === char)) return prev;
      return [...prev, { char, addedAt: Date.now(), folder }];
    });
  }, []);

  const removeFavorite = useCallback((char: string) => {
    setFavorites((prev) => prev.filter((f) => f.char !== char));
  }, []);

  const toggleFavorite = useCallback((char: string, folder = '默认') => {
    setFavorites((prev) => {
      if (prev.some((f) => f.char === char)) {
        return prev.filter((f) => f.char !== char);
      }
      return [...prev, { char, addedAt: Date.now(), folder }];
    });
  }, []);

  const moveToFolder = useCallback((char: string, newFolder: string) => {
    setFavorites((prev) =>
      prev.map((f) => (f.char === char ? { ...f, folder: newFolder } : f)),
    );
  }, []);

  const getByFolder = useCallback((folder: string): FavoriteEntry[] => {
    return favorites.filter((f) => f.folder === folder);
  }, [favorites]);

  const addFolder = useCallback((name: string) => {
    setFolders((prev) => {
      if (prev.includes(name)) return prev;
      return [...prev, name];
    });
  }, []);

  const removeFolder = useCallback((name: string) => {
    setFolders((prev) => prev.filter((f) => f !== name));
    // Move entries in deleted folder to 默认
    setFavorites((prev) =>
      prev.map((f) => (f.folder === name ? { ...f, folder: '默认' } : f)),
    );
  }, []);

  return {
    favorites,
    folders,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    moveToFolder,
    getByFolder,
    addFolder,
    removeFolder,
  };
}
