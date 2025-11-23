export const withRetry = async (fn, retries = 3, delay = 200) => {
    try {
        return await fn(); // try function
    } catch (error) {
        if (retries <= 0) throw error; // no retries left

        console.warn(
        `[withRetry] Operation failed. Retrying... (${retries} attempts left)`
        );

        // wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));

        // retry
        return withRetry(fn, retries - 1, delay);
    }
};
