const store = new Map();

export function createClient() {
  const client = {
    isOpen: false,
    connect: async () => {
      client.isOpen = true;
    },
    quit: async () => {
      client.isOpen = false;
    },
    on: () => {},
    get: async (key) => {
      return store.get(key) || null;
    },
    set: async (key, value) => {
      store.set(key, value);
      return 'OK';
    },
    del: async (key) => {
      store.delete(key);
      return 1;
    }
  };

  return client;
}

export function __resetStore() {
  store.clear();
}
