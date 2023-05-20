const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
	data: new SlashCommandBuilder()
        .setName("resume")
        .setDescription("Retoma a música atual"),
	execute: async ({ client, interaction }) => {
        // Obter a fila para o servidor
		const queue = client.player.getQueue(interaction.guildId)

        // Verifique se a fila está vazia
		if (!queue)
        {
            await interaction.reply("Nenhuma música na fila");
            return;
        }

        // Pausar a música atual
		queue.setPaused(false);

        await interaction.reply("A música foi retomada.")
	},
}
