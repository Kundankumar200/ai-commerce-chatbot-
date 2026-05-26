const StorageUtility = {
    setLocalCache: async (key, value) => {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [key]: value }, () => resolve(true));
        });
    },
    getLocalCache: async (key) => {
        return new Promise((resolve) => {
            chrome.storage.local.get([key], (result) => resolve(result[key] || null));
        });
    },
    purgeLocalCache: async (key) => {
        return new Promise((resolve) => {
            chrome.storage.local.remove([key], () => resolve(true));
        });
    }
};