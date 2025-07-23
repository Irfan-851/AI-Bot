import { WebContainer } from '@webcontainer/api';

// Call only once, even if called multiple times before boot completes
let webcontainerPromise = null;

export const getWebContainer = async () => {
    if (!webcontainerPromise) {
        webcontainerPromise = WebContainer.boot();
    }
    return webcontainerPromise;
};

        
