const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")
const { QueryType } = require("discord-player")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("play")
		.setDescription("reproduzir uma música do YouTube.")
		.addSubcommand(subcommand =>
			subcommand
				.setName("search")
				.setDescription("Procura uma música e a reproduz")
				.addStringOption(option =>
					option.setName("searchterms").setDescription("Procure palavras-chave").setRequired(true)
				)
		)
        .addSubcommand(subcommand =>
			subcommand
				.setName("playlist")
				.setDescription("Reproduz uma lista de reprodução do YOUTUBE")
				.addStringOption(option => option.setName("url").setDescription("url da lista de reprodução").setRequired(true))
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName("song")
				.setDescription("Reproduz uma única música do YT")
				.addStringOption(option => option.setName("url").setDescription("URL da música").setRequired(true))
		),
	execute: async ({ client, interaction }) => {
        // Make sure the user is inside a voice channel
		if (!interaction.member.voice.channel) return interaction.reply("Você precisa estar em um canal de voz para reproduzir uma música.");

        // Create a play queue for the server
		const queue = await client.player.createQueue(interaction.guild);

        // Wait until you are connected to the channel
		if (!queue.connection) await queue.connect(interaction.member.voice.channel)

		let embed = new MessageEmbed()

		if (interaction.options.getSubcommand() === "song") {
            let url = interaction.options.getString("url")
            
            // Search for the song using the discord-player
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_VIDEO
            })

            // finish if no tracks were found
            if (result.tracks.length === 0)
                return interaction.reply("Sem resultados")

            // Add the track to the queue
            const song = result.tracks[0]
            await queue.addTrack(song)
            embed
                .setDescription(`**[${song.title}](${song.url})** foi adicionado à fila`)
                .setThumbnail(song.thumbnail)
                .setFooter({ text: `Duracao: ${song.duration}`})

		}
        else if (interaction.options.getSubcommand() === "playlist") {

            // Search for the playlist using the discord-player
            let url = interaction.options.getString("url")
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_PLAYLIST
            })

            if (result.tracks.length === 0)
                return interaction.reply(`Nenhuma lista de reprodução encontrada com ${url}`)
            
            // Add the tracks to the queue
            const playlist = result.playlist
            await queue.addTracks(result.tracks)
            embed
                .setDescription(`**${result.tracks.length} músicas de [${playlist.title}](${playlist.url})** foram adicionados à fila`)
                .setThumbnail(playlist.thumbnail)

		} 
        else if (interaction.options.getSubcommand() === "search") {

            // Search for the song using the discord-player
            let url = interaction.options.getString("searchterms")
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.AUTO
            })

            // finish if no tracks were found
            if (result.tracks.length === 0)
                return interaction.editReply("Sem resultado")
            
            // Add the track to the queue
            const song = result.tracks[0]
            await queue.addTrack(song)
            embed
                .setDescription(`**[${song.title}](${song.url})** foi adicionado à fila`)
                .setThumbnail(song.thumbnail)
                .setFooter({ text: `Duracao: ${song.duration}`})
		}

        // Play the song
        if (!queue.playing) await queue.play()
        
        // Respond with the embed containing information about the player
        await interaction.reply({
            embeds: [embed]
        })
	},
}
