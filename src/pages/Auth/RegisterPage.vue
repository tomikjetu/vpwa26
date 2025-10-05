<template>
    <div class="register-page">
        <div class="text-center q-mb-lg">
            <h5 class="text-weight-medium q-my-md">Create Account</h5>
        </div>

        <q-form @submit="onSubmit" class="q-gutter-md">
            <q-input v-model="form.name" type="text" label="First Name" outlined :rules="[
                val => !!val || 'First name is required',
                val => val.length >= 2 || 'First name must be at least 2 characters'
            ]" :loading="loading" :disable="loading">
                <template v-slot:prepend>
                    <q-icon name="person" />
                </template>
            </q-input>

            <q-input v-model="form.surname" type="text" label="Last Name" outlined :rules="[
                val => !!val || 'Last name is required',
                val => val.length >= 2 || 'Last name must be at least 2 characters'
            ]" :loading="loading" :disable="loading">
                <template v-slot:prepend>
                    <q-icon name="person" />
                </template>
            </q-input>

            <q-input v-model="form.nickName" type="text" label="Nickname" outlined :rules="[
                val => !!val || 'Nickname is required',
                val => val.length >= 2 || 'Nickname must be at least 2 characters'
            ]" :loading="loading" :disable="loading">
                <template v-slot:prepend>
                    <q-icon name="account_circle" />
                </template>
            </q-input>

            <q-input v-model="form.email" type="email" label="Email" outlined :rules="[
                val => !!val || 'Email is required',
                val => /.+@.+\..+/.test(val) || 'Please enter a valid email'
            ]" :loading="loading" :disable="loading">
                <template v-slot:prepend>
                    <q-icon name="email" />
                </template>
            </q-input>

            <q-input v-model="form.password" :type="showPassword ? 'text' : 'password'" label="Password" outlined
                :rules="[
                    val => !!val || 'Password is required',
                    val => val.length >= 6 || 'Password must be at least 6 characters'
                ]" :loading="loading" :disable="loading">
                <template v-slot:prepend>
                    <q-icon name="lock" />
                </template>
                <template v-slot:append>
                    <q-icon :name="showPassword ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                        @click="showPassword = !showPassword" />
                </template>
            </q-input>

            <q-input v-model="form.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'"
                label="Confirm Password" outlined :rules="[
                    val => !!val || 'Please confirm your password',
                    val => val === form.password || 'Passwords do not match'
                ]" :loading="loading" :disable="loading">
                <template v-slot:prepend>
                    <q-icon name="lock" />
                </template>
                <template v-slot:append>
                    <q-icon :name="showConfirmPassword ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                        @click="showConfirmPassword = !showConfirmPassword" />
                </template>
            </q-input>

            <div class="q-mt-md">
                <q-checkbox v-model="agreeToTerms" :disable="loading" label="">
                    <span class="text-body2">
                        I agree to the
                        <a href="#" class="text-primary">Terms of Service</a>
                        and
                        <a href="#" class="text-primary">Privacy Policy</a>
                    </span>
                </q-checkbox>
            </div>

            <div class="row justify-center q-pa-none">
                <q-btn type="submit" color="primary" label="Create Account" class="full-width" size="lg"
                    :loading="loading" :disable="loading || !agreeToTerms" />
            </div>
        </q-form>

        <q-separator class="q-my-lg" />

        <div class="text-center">
            <p class="text-grey-6">
                Already have an account?
                <router-link to="/auth/login" class="text-primary text-weight-medium">
                    Sign in
                </router-link>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Notify } from 'quasar';
import { authService } from 'src/services/authService';
import type { RegisterCredentials } from 'src/utils/types';

const router = useRouter();

const form = ref<RegisterCredentials>({
    name: '',
    surname: '',
    nickName: '',
    email: '',
    password: '',
    confirmPassword: ''
});

const showPassword = ref(false);
const showConfirmPassword = ref(false);
const agreeToTerms = ref(false);
const loading = ref(false);

async function onSubmit() {
    loading.value = true;

    try {
        const user = await authService.register(form.value);

        Notify.create({
            type: 'positive',
            message: `Welcome, ${user.name}! Your account has been created successfully.`,
            position: 'top'
        });

        // Redirect to intended destination or home page
        const redirect = router.currentRoute.value.query.redirect as string;
        await router.push(redirect || '/');
    } catch (error) {
        Notify.create({
            type: 'negative',
            message: error instanceof Error ? error.message : 'Registration failed',
            position: 'top'
        });
    } finally {
        loading.value = false;
    }
}
</script>

<style scoped lang="scss">
.register-page {
    width: 100%;
}

a {
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
}
</style>