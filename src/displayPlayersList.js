function displayPlayersList(registeredPlayers) {
	const modal = document.getElementById("playesrsListModal");
	const playersTbody = document.getElementById("players-tbody");
	const nameHeader = document.getElementById("name-header");
	const ratingHeader = document.getElementById("rating-header");

	let sortBy = "rating"; // Default sort by name
	let sortOrder = "desc"; // Default sort order ascending

	function renderPlayersList() {
		playersTbody.innerHTML = "";
		let sortedPlayers = [...registeredPlayers];

		if (sortBy === "name") {
			sortedPlayers.sort((a, b) => {
				if (a.name < b.name) return sortOrder === "asc" ? -1 : 1;
				if (a.name > b.name) return sortOrder === "asc" ? 1 : -1;
				return 0;
			});
		} else if (sortBy === "rating") {
			sortedPlayers.sort((a, b) => {
				return sortOrder === "asc"
					? a.rating - b.rating
					: b.rating - a.rating;
			});
		}

		sortedPlayers.forEach((player) => {
			const row = document.createElement("tr");
			row.innerHTML = `
            <td>${player.name}</td>
            <td>${player.rating.toFixed(2)}</td>
            `;
			playersTbody.appendChild(row);
		});
	}

	nameHeader.addEventListener("click", () => {
		sortBy = "name";
		sortOrder = "asc";
		renderPlayersList();
	});

	ratingHeader.addEventListener("click", () => {
		sortBy = "rating";
		sortOrder = sortOrder === "asc" ? "desc" : "asc";
		renderPlayersList();
	});

	modal.style.display = "block";
	renderPlayersList();

	// Add an event to close the modal
	modal.addEventListener("click", (e) => {
		if (e.target === modal) {
			modal.style.display = "none";
		}
	});
}

export {
	displayPlayersList
} 