<template>
    <div v-if="typingUsers.length > 0" class="typing-indicator">
        <div class="typing-text">
            <span class="typing-names">{{ typingText }}</span>
            <span class="typing-dots">
                <span class="dot">.</span>
                <span class="dot">.</span>
                <span class="dot">.</span>
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface TypingUser {
    nickname: string
    message: string
}

const props = defineProps<{
    typingUsers: TypingUser[]
}>()

const typingText = computed(() => {
    const count = props.typingUsers.length

    if (count === 0) return ''
    if (count === 1 && props.typingUsers[0]) return `${props.typingUsers[0].nickname} is typing`
    if (count === 2 && props.typingUsers[0] && props.typingUsers[1]) {
        return `${props.typingUsers[0].nickname} and ${props.typingUsers[1].nickname} are typing`
    }
    if (count === 3 && props.typingUsers[0] && props.typingUsers[1] && props.typingUsers[2]) {
        return `${props.typingUsers[0].nickname}, ${props.typingUsers[1].nickname}, and ${props.typingUsers[2].nickname} are typing`
    }
    if (props.typingUsers[0]) {
        return `${props.typingUsers[0].nickname} and ${count - 1} others are typing`
    }
    return ''
})
</script>

<style scoped>
.typing-indicator {
    padding: 4px 0;
    display: flex;
    align-items: center;
    min-height: 28px;
}

.typing-text {
    display: flex;
    align-items: center;
    gap: 4px;
}

.typing-names {
    font-size: 12px;
    color: var(--text-muted);
    font-style: italic;
}

.typing-dots {
    display: inline-flex;
    align-items: center;
    gap: 2px;
}

.dot {
    font-size: 14px;
    font-weight: bold;
    color: var(--text-muted);
    animation: typing-dot 1.4s infinite;
    line-height: 1;
}

.dot:nth-child(1) {
    animation-delay: 0s;
}

.dot:nth-child(2) {
    animation-delay: 0.2s;
}

.dot:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes typing-dot {

    0%,
    60%,
    100% {
        opacity: 0.3;
    }

    30% {
        opacity: 1;
    }
}
</style>
