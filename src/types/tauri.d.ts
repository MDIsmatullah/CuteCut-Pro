declare module '@tauri-apps/api/shell' {
  export function open(path: string, openWith?: string): Promise<void>;
}

declare module '@tauri-apps/api/tauri' {
  export function convertFileSrc(filePath: string, protocol?: string): string;
}
