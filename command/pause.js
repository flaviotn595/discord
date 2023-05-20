const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
	data: new SlashCommandBuilder()
        .setName("pause")
        .setDescription("Pausa a música atual"),
	execute: async ({ client, interaction }) => {
        // Obter a fila para o servidor
		const queue = client.player.getQueue(interaction.guildId)

        // Verifique se a fila está vazia
		if (!queue)
		{
			await interaction.reply("Não há músicas na fila")
			return;
		}

        // Pausar a música atual
		queue.setPaused(true);

        await interaction.reply("O player foi pausado.")
  },
}
