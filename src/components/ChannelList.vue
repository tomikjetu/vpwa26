<template>
    <q-item-label header>
        {{ title }}
    </q-item-label>
    <q-scroll-area :style="'flex:' + flex">
        <q-list bordered padding>
            <q-item v-for="(channel, index) in channels" :key="'search-' + index" clickable v-ripple>
                <q-item-section avatar top>
                    <q-avatar :icon="channel.icon" :color="channel.color" text-color="white" />
                </q-item-section>

                <q-item-section>
                    <q-item-label lines="1">{{ channel.name }}</q-item-label>
                    <q-item-label lines="1" caption>
                        {{ channel.ownerId != getCurrentUser?.id ? 'Joined' : 'Created' }} {{ channel.ownerId !=
                            getCurrentUser?.id ? channel.joinedAt.toDateString() : channel.createdAt.toDateString() }}
                    </q-item-label>
                </q-item-section>

                <q-item-section side>
                    <q-btn round dense icon="more_horiz" @click.stop @mousedown.stop>
                        <ChannelDropdown :items="getMenuOptions(channel)"></ChannelDropdown>
                    </q-btn>
                </q-item-section>
            </q-item>
        </q-list>
    </q-scroll-area>
</template>

<script setup lang="ts">
import type { Channel, DropdownItem } from 'src/utils/types.js'
import ChannelDropdown from './ChannelDropdown.vue'
import { useAuthStore } from 'src/stores/auth-store'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { getCurrentUser } = storeToRefs(authStore)

const getMenuOptions = (channel: Channel): DropdownItem[] => {
    return [
        { label: 'Invite', class: '', disable: channel.ownerId != getCurrentUser.value?.id && !channel.isPublic },
        { label: 'Members', class: '', disable: false },
        { label: 'Change icon', class: '', disable: false },
        { label: channel.ownerId != getCurrentUser.value?.id ? 'Leave' : 'Remove', class: 'warning', disable: false }
    ]
}

defineProps<{
    title: string,
    channels: Channel[],
    flex: number
}>()
</script>