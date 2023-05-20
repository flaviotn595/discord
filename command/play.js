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
        // Verifique se o usuário está dentro de um canal de voz
		if (!interaction.member.voice.channel) return interaction.reply("Você precisa estar em um canal de voz para reproduzir uma música.");

        // Crie uma fila de jogo para o servidor
		const queue = await client.player.createQueue(interaction.guild);

        // Aguarde até que você esteja conectado ao canal
		if (!queue.connection) await queue.connect(interaction.member.voice.channel)

		let embed = new MessageEmbed()

		if (interaction.options.getSubcommand() === "song") {
            let url = interaction.options.getString("url")
            
            // Procure a música usando o discord-player
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_VIDEO
            })

            // terminar se nenhuma trilha for encontrada
            if (result.tracks.length === 0)
                return interaction.reply("Sem resultados")

            // Adicionar a faixa à fila
            const song = result.tracks[0]
            await queue.addTrack(song)
            embed
                .setDescription(`**[${song.title}](${song.url})** foi adicionado à fila`)
                .setThumbnail(song.thumbnail)
                .setFooter({ text: `Duracao: ${song.duration}`})

		}
        else if (interaction.options.getSubcommand() === "playlist") {

            // Pesquise a lista de reprodução usando o discord-player
            let url = interaction.options.getString("url")
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_PLAYLIST
            })

            if (result.tracks.length === 0)
                return interaction.reply(`Nenhuma lista de reprodução encontrada com ${url}`)
            
            // Adicione as faixas à fila
            const playlist = result.playlist
            await queue.addTracks(result.tracks)
            embed
                .setDescription(`**${result.tracks.length} músicas de [${playlist.title}](${playlist.url})** foram adicionados à fila`)
                .setThumbnail(playlist.thumbnail)

		} 
        else if (interaction.options.getSubcommand() === "search") {

            // Procure a música usando o discord-player
            let url = interaction.options.getString("searchterms")
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.AUTO
            })

            // terminar se nenhuma trilha for encontrada
            if (result.tracks.length === 0)
                return interaction.editReply("Sem resultado")
            
            // Adicionar a faixa à fila
            const song = result.tracks[0]
            await queue.addTrack(song)
            embed
                .setDescription(`**[${song.title}](${song.url})** foi adicionado à fila`)
                .setThumbnail(song.thumbnail)
                .setFooter({ text: `Duracao: ${song.duration}`})
		}

        // Toque a música
        if (!queue.playing) await queue.play()
        
        // Responda com a incorporação contendo informações sobre o player
        await interaction.reply({
            embeds: [embed]
        })
	},
}
