const AuthController = {
    async authenticateIdentity(formType, payload) {
        const endpoint = formType === 'signup' ? '/auth/register' : '/auth/login';
        const data = await ApiClient.request(endpoint, 'POST', payload);
        
        if (data.success && data.token) {
            await StorageUtility.setLocalCache('token', data.token);
            await StorageUtility.setLocalCache('user', data.user);
            return { success: true };
        }
        return { success: false, message: data.message || 'Authentication error.' };
    },
    async terminateSession() {
        await StorageUtility.purgeLocalCache('token');
        await StorageUtility.purgeLocalCache('user');
        await StorageUtility.purgeLocalCache('cached_bookmarks');
    }
};