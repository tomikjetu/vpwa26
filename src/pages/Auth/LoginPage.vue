<template>
    <div class="login-page">
        <div class="text-center q-mb-lg">
            <h5 class="text-weight-medium q-my-md">Sign In</h5>
        </div>

        <q-form @submit.prevent="onSubmit" class="q-gutter-md">
            <q-input v-model="form.email" type="email" label="Email" outlined :rules="[
                val => !!val || 'Email is required',
                val => /.+@.+\..+/.test(val) || 'Please enter a valid email'
            ]" :loading="loading" :disable="loading">
                <template v-slot:prepend>
                    <q-icon name="email" />
                </template>
            </q-input>

            <q-input v-model="form.password" :type="showPassword ? 'text' : 'password'" label="Password" outlined
                :rules="[val => !!val || 'Password is required']" :loading="loading" :disable="loading">
                <template v-slot:prepend>
                    <q-icon name="lock" />
                </template>
                <template v-slot:append>
                    <q-icon :name="showPassword ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                        @click="showPassword = !showPassword" />
                </template>
            </q-input>

            <div class="row justify-between items-center">
                <q-checkbox v-model="rememberMe" label="Remember me" :disable="loading" />
                <q-btn flat no-caps color="primary" label="Forgot password?" size="sm" :disable="loading" />
            </div>

            <div class="row justify-center q-pa-none">
                <q-btn type="submit" color="primary" label="Sign In" class="full-width" size="lg" :loading="loading"
                    :disable="loading" />
            </div>
        </q-form>

        <q-separator class="q-my-lg" />

        <div class="text-center">
            <p class="text-grey-6">
                Don't have an account?
                <router-link to="/auth/register" class="text-primary text-weight-medium">
                    Sign up
                </router-link>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Notify } from 'quasar';
import { useAuthStore } from 'src/stores/auth';
import type { LoginCredentials } from 'src/utils/types';

const router = useRouter();

const form = ref<LoginCredentials>({
    email: '',
    password: ''
});

const showPassword = ref(false);
const rememberMe = ref(false);
const auth = useAuthStore();

// Use store loading state instead of local ref
const loading = computed(() => auth.getLoading);

async function onSubmit(): Promise<void> {
    try {
        const user = await auth.login(form.value);

        Notify.create({
            type: 'positive',
            message: `Welcome back, ${user.name}!`,
            position: 'top'
        });

        // Redirect to intended destination or home page
        const redirect = router.currentRoute.value.query.redirect as string || '/';
        await router.push(redirect);
    } catch (error) {
        let errorMessage = 'Login failed'; // Default message
        console.log(error)
        // If the error is an instance of Error (generic JavaScript Error)
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        // If the error has a 'response' property (e.g., from Axios)
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as { response?: { data?: { error?: string } } };
            errorMessage = axiosError.response?.data?.error || 'Unknown error';
        }

        Notify.create({
            type: 'negative',
            message: errorMessage,
            position: 'top'
        });
    }
}
</script>

<style scoped lang="scss">
.login-page {
    width: 100%;
}

a {
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
}
</style>