export interface Todo {
  id: number;
  content: string;
}

export interface Meta {
  totalCount: number;
}

export interface DropdownItem {
  label: string,
  class: string,
  disable: boolean
}

export interface ChannelItem {
  name: string
  date: string
  icon: string
  color: string
  isOwner: boolean
  canInvite: boolean
}