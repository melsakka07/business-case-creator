/// <reference types="vite/client" />

interface Window {
  apis: {
    fs: {
      mkdir: (path: string, options?: { recursive: boolean }) => Promise<void>;
      readFile: (path: string, encoding?: string) => Promise<string>;
      writeFile: (path: string, content: string, encoding?: string) => Promise<void>;
    };
  };
}
