import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { useApiFetch } from "@/composables/axios"
import { useRouter } from "vue-router"

type User = {
    id: number
    name: string
    email: string
    email_verify: string
    role: string
}

type Credentials = {
    email: string
    password: string
}

export const authStore = defineStore('auth', () => {
    const user = ref<User | null>(null)
    const isLoggedIn = computed(() => !!user.value)
    const router = useRouter()

    function initUserFromLocalStorage() {
        const bearer = localStorage.getItem('bearer');
        const bearerExpired = localStorage.getItem('bearerExpired');

        if (bearer && bearerExpired) {
            const expiredAt = new Date(bearerExpired);

            if (expiredAt > new Date()) {
                // Token is not expired, set user state
                user.value = JSON.parse(localStorage.getItem('user') || 'null');
            } else {
                // Token is expired, clear local storage and set user to null
                localStorage.removeItem('bearer');
                localStorage.removeItem('bearerExpired');
                localStorage.removeItem('user');
                user.value = null;
            }
        }
    }

    initUserFromLocalStorage();

    function setUser(res: any) {
        const userData = res.data;

        // Set user state
        user.value = userData.data_user as User;

        localStorage.setItem('user', JSON.stringify(user.value));
        localStorage.setItem('bearer', userData.token_jwt);
        localStorage.setItem('bearerExpired', userData.expired_at);
    }

    async function login(credentials: Credentials) {

        const login: any = await useApiFetch('/api/v1/user/login', {
          method: 'POST',
          body: credentials,
        })

        if (login.meta.code != 200) {
            return false
        }
        
        setUser(login)

        return login
    }

    async function logout() {
        const logout: any =  await useApiFetch('/api/v1/user/logout', {
            method: 'POST'
        })

        if(logout.meta.code != 200) {
            return false
        }

        user.value = null

        localStorage.removeItem('user');
        localStorage.removeItem('bearer')
        localStorage.removeItem('bearerExpired')

        router.push('/auth/signin')
    }

    async function logout401() {
        user.value = null

        localStorage.removeItem('user');
        localStorage.removeItem('bearer')
        localStorage.removeItem('bearerExpired')

        router.push('/auth/signin')
    }

    return {user, login, isLoggedIn, logout, logout401}
})

