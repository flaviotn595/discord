const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
	data: new SlashCommandBuilder()
        .setName("exit")
        .setDescription("Expulse o bot do canal."),
	execute: async ({ client, interaction }) => {

        // Obter a fila atual
		const queue = client.player.getQueue(interaction.guildId)

		if (!queue)
		{
			await interaction.reply("Não há músicas na fila")
			return;
		}

        // Exclui todas as músicas da fila e sai do canal
		queue.destroy();

        await interaction.reply("Por que você faz isso comigo?")
	},
}
