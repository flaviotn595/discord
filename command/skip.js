const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
        .setName("skip")
        .setDescription("Pular a música atual"),

	execute: async ({ client, interaction }) => {

        // Obter a fila para o servidor
		const queue = client.player.getQueue(interaction.guildId)

        // Se não houver fila, retorne
		if (!queue)
        {
            await interaction.reply("Não há músicas na fila");
            return;
        }

        const currentSong = queue.current

        // Pular a música atual
		queue.skip()

        // Retorne uma incorporação ao usuário dizendo que a música foi ignorada
        await interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setDescription(`${currentSong.title} foi paulada!`)
                    .setThumbnail(currentSong.thumbnail)
            ]
        })
	},
}
