import { Client } from 'discord.js';
import { CommandBuilder, CommandCallback, DiscordEvents, EventCallback, PlayerEvents } from '../types';
import { DisTubeEvents } from 'distube';
import { Player } from './player';

export enum EventType {
    Discord = 'discord',
    Distube = 'distube',
    Player = 'player',
}

export interface Events {
    [EventType.Discord]: DiscordEvents;
    [EventType.Distube]: DisTubeEvents;
    [EventType.Player]: PlayerEvents;
}

export interface Event<
    T extends EventType,
    U extends keyof Events[T]
> {
    type: T;
    name: U;
    cb: EventCallback<T, U>;
}

export interface BaseCommand {
    data: CommandBuilder;
    cb: CommandCallback;
}

export interface Command extends BaseCommand {
    data: CommandBuilder;
}

interface AppOptions {
    client: Client;
    player: Player;
    commands: Command[];
    events: Event<any, any>[];
}

export class App {
    public readonly client: Client;
    public readonly player: Player;
    public readonly commands: Command[];
    public readonly events: Event<any, any>[];

    constructor(options: AppOptions) {
        this.client = options.client;
        this.player = options.player;
        this.commands = options.commands;
        this.events = options.events;
    }

    public init() {
        this.registerEvents();
        this.player.registerEvents(this);
    }

    private registerEvents() {
        for (const { type, name, cb } of this.events) {
            if (type === EventType.Discord) {
                this.client.on(name as string, (...args) => cb(this, ...args));
            }
        }
    }

    public deployCommands() {
        const commands = this.commands.map(({ data }) => data);
        this.client.application?.commands.set(commands);
    }
}

export function createEvent<
    T extends EventType,
    U extends keyof Events[T]
>(event: Event<T, U>) {
    return event;
}

export function createCommand(command: Command) {
    return command;
}
