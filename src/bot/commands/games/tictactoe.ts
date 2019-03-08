import { Command, Input } from '@api';
import { Message, GuildMember, Guild, TextChannel, DMChannel, GroupDMChannel, Role } from 'discord.js';
import { TTTLobbyManager } from '@bot/libraries/tictactoe/ttt-lobby-manager'
import { TTTLobby } from '@bot/libraries/tictactoe/ttt-lobby';

export class TicTacToe extends Command {
    private tttLobbyManager = new TTTLobbyManager();

    constructor() {
        super({
            name: 'tictactoe',
            aliases: ['tic', 'ttt'],
            description: 'Play a game of tic tac toe with another user.',
            arguments: [
                {
                    name: 'action',
                    required: true,
                    options: ['start', 'join']
                },
                {
                    name: 'options',
                    required: false,
                    expand: true
                }
            ]
        });
    }

    execute(input: Input) {
        let action = input.getArgument('action') as string;
        let options = input.getArgument('options') as string | undefined;

        if (action == 'start') {
            this.start(input, options);
        }
        else {
            this.join(input, options);
        }
    }

    /**
     * Queue a lobby
     *
     * @param input
     * @param options
     */
    private start(input: Input, options: string | undefined) {
        input.channel.send("Opening tic tac toe lobby in this chat.");
        let indexOfNewLobby = this.tttLobbyManager.AddLobby(input.guild, input.channel, input.member);
        input.channel.send(this.tttLobbyManager.GetLobby(indexOfNewLobby).GetPlayer(1) + " has been added to new lobby #" + indexOfNewLobby);
    }

    /**
     * Join a lobby
     *
     * @param input
     * @param options
     */
    private join(input: Input, options: string | undefined) {
        let lobbiesInServer = this.tttLobbyManager.GetLobbiesInChannel(input.guild, input.channel);
        let message = "Lobbies:";
        this.displayAllLobbies(lobbiesInServer, message, input);

        const filter = (number: number) => !isNaN(number)
            && this.numberIsValidLobby(number, lobbiesInServer)
            && this.isLobbyOpen(lobbiesInServer, number)
            && this.isAlreadyInLobby(lobbiesInServer, number, input.member);
        const collector = input.channel.createMessageCollector(filter);

        let self = this;
        collector.once('collect', function(number: number) {
            lobbiesInServer[number].AddPlayer(input.member);

            let lobbyIndex = self.tttLobbyManager.FindLobby(lobbiesInServer[number]);
            if (typeof lobbyIndex === "number")
            {
                self.tttLobbyManager.BeginGameInLobby(lobbyIndex);
            }
        });
    }

    /**
     * Check if user is already in lobby
     */
    private isAlreadyInLobby(lobbiesInServer: TTTLobby[], number: number, member: GuildMember) {
        return lobbiesInServer[number].GetPlayer(1) !== member && lobbiesInServer[number].GetPlayer(2) !== member;
    }

    /**
     * Check if lobby has vacancies
     */
    private isLobbyOpen(lobbiesInServer: TTTLobby[], number: number) {
        return lobbiesInServer[number].GetPlayer(1) === null || lobbiesInServer[number].GetPlayer(2) === null;
    }

    /**
     * Check if index of lobby is valid
     *
     * @param lobbyNumber
     * @param lobbiesInServer
     */
    private numberIsValidLobby(lobbyNumber: number, lobbiesInServer: TTTLobby[]) {
        return lobbyNumber >= 0 && lobbyNumber < lobbiesInServer.length;
    }

    /**
     * display list of lobbies
     *
     * @param lobbiesInServer
     * @param message
     * @param input
     */
    private displayAllLobbies(lobbiesInServer: TTTLobby[], message: string, input: Input) {
        for (let index = 0; index < lobbiesInServer.length; index++) {
            let currentLobby = lobbiesInServer[index];

            message += "\n  ";
            message += "[" + index + "] - ";
            if (currentLobby.GetPlayer(1) === null && currentLobby.GetPlayer(2) === null) {
                message += "empty";
            }
            if (currentLobby.GetPlayer(1) !== null) {
                message += this.addPlayerNameToMessage(currentLobby.GetPlayer(1) as GuildMember);
            }
            if (currentLobby.GetPlayer(2) !== null) {
                message += this.addPlayerNameToMessage(currentLobby.GetPlayer(2) as GuildMember);
            }
        }

        //input.channel.send(message);
        input.channel.send("```" + message + "```");
        input.channel.send("Select the lobby you wish to join");
        //input.channel.send(message.replace(/(.+|\n+)/g, '```$1```'));
    }

    /**
     * adds the player's name to the message
     *
     * @param player
     */
    private addPlayerNameToMessage(player: GuildMember) {
        let message = "";
        message += player.displayName + " ";
        return message;
    }
}
