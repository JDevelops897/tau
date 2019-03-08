import { Message, GuildMember, Guild, TextChannel, DMChannel, GroupDMChannel, Role } from 'discord.js';
import { TTTLobby } from '@bot/libraries/tictactoe/ttt-lobby'

export class TTTLobbyManager {
    private lobbies : TTTLobby[];

    constructor(lobbies: TTTLobby[] = []){
        this.lobbies = lobbies;
    }

    AddLobby(server: Guild, channel : TextChannel | DMChannel | GroupDMChannel, player: GuildMember) : number{
        this.lobbies.push(new TTTLobby(server, channel, this, player, null));
        return this.lobbies.length - 1;
    }

    BeginGameInLobby(lobbyIndex: number){
        if (this.lobbies[lobbyIndex].GetPlayer(1) !== null && this.lobbies[lobbyIndex].GetPlayer(2) !== null){
            this.lobbies[lobbyIndex].BeginTheGame()
        }
    }

    FindAndRemoveLobby(lobby: TTTLobby){
        let lobbyIndex : number = this.FindLobby(lobby);

        if (!isNaN(lobbyIndex))
        {
            console.log("Okay");
            this.RemoveLobby(lobbyIndex);
        }
    }

    FindLobby(lobby: TTTLobby) : number {
        for (let index = 0; index < this.lobbies.length; index++){
            if (lobby === this.lobbies[index]){
                return index;
            }
        }
        return NaN;
    }

    GetLobby(lobbyIndex: number) : TTTLobby {
        return this.lobbies[lobbyIndex];
    }

    GetLobbies() : TTTLobby[]{
        return this.lobbies;
    }

    GetLobbiesInChannel(server: Guild, channel: TextChannel | DMChannel | GroupDMChannel) : TTTLobby[]{
        let lobbiesInServer = [];

        for (let index = 0; index < this.lobbies.length; index++){
            if (server.id === this.lobbies[index].GetLobbyServer().id
                && channel.id === this.lobbies[index].GetLobbyChannel().id){
                lobbiesInServer.push(this.lobbies[index]);
            }
            else{
                //Do nothing
            }
        }

        return lobbiesInServer;
    }

    GetNumLobbies() : number{
        return this.lobbies.length;
    }

    RemoveLobby(lobbyIndex: number){
        this.lobbies.splice(lobbyIndex);
    }
}