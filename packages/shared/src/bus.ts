/**
 * Шина событий между вкладками (киоск → табло, демо-панель → пульт).
 * BroadcastChannel работает без бэкенда, поэтому прототипы живут на статике (GH Pages).
 * В средах без BroadcastChannel (тесты, node) шина работает локально, в пределах процесса.
 */
export interface Bus<T> {
  post(msg: T): void;
  subscribe(handler: (msg: T) => void): () => void;
  close(): void;
}

export function createBus<T>(name: string): Bus<T> {
  const local = new Set<(msg: T) => void>();
  const channel =
    typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(`tib:${name}`) : null;

  channel?.addEventListener('message', (e: MessageEvent<T>) => {
    local.forEach((h) => h(e.data));
  });

  return {
    post(msg) {
      channel?.postMessage(msg);
      // BroadcastChannel не доставляет сообщение отправителю — дублируем локально
      local.forEach((h) => h(msg));
    },
    subscribe(handler) {
      local.add(handler);
      return () => local.delete(handler);
    },
    close() {
      local.clear();
      channel?.close();
    },
  };
}
