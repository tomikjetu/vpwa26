<template>
    <q-item-label header>
        {{ title }}
    </q-item-label>
    <q-scroll-area class="scroll" :style="'flex:'+ flex">
        <q-list bordered padding>
            <q-item
            v-for="(channel, index) in channels"
            :key="'search-' + index"
            clickable
            v-ripple
            >
            <q-item-section avatar top>
                <q-avatar :icon="channel.icon" :color="channel.color" text-color="white" />
            </q-item-section>

            <q-item-section>
                <q-item-label lines="1">{{ channel.name }}</q-item-label>
                <q-item-label lines="1" caption>
                {{ !channel.isOwner ? 'Joined' : 'Created' }} {{ channel.date }}
                </q-item-label>
            </q-item-section>

            <q-item-section side>
                <q-btn 
                round 
                dense 
                icon="more_horiz"
                @click.stop
                @mousedown.stop>
                <ChannelDropdown :items="getMenuOptions(channel)"></ChannelDropdown>
                </q-btn>
            </q-item-section>
            </q-item>
        </q-list>
    </q-scroll-area>
</template>

<script setup lang="ts">
import type { ChannelItem, DropdownItem } from './models.js'
import ChannelDropdown from './ChannelDropdown.vue'

const getMenuOptions = (item: ChannelItem): DropdownItem[] => {
  return [
    { label: 'Invite', class: '', disable: !item.canInvite },
    { label: 'Members', class: '', disable: false },
    { label: 'Change icon', class: '', disable: false },
    { label: item.isOwner ? 'Leave' : 'Remove', class: 'warning', disable: false }
  ]
}

defineProps<{
  title: string,
  channels: ChannelItem[],
  flex: number
}>()
</script>