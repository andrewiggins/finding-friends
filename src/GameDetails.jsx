import { useSignal, useComputed, useSignalEffect } from "@preact/signals";
import { recommendedSettings } from "./recommendedSettngs";

const playerCountOptions = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

export function GameDetails() {
	const playerCount = useSignal(5);
	useSignalEffect(() => {
		let recommended = recommendedSettings[playerCount.value];
		jokerCount.value = recommended.jokerCount;
		kittySize.value = recommended.kittySize;
	});

	// Currently working with:
	//   4-7 players: 2 decks
	//  8-12 players: 3 decks
	// 13-16 players: 4 decks
	const deckCount = useComputed(() =>
		playerCount.value < 8 ? 2 : playerCount.value < 13 ? 3 : 4
	);

	// Number of jokers:
	//  1 deck: 0,2
	// 2 decks: 0,2,4
	// 3 decks: 0,2,4,6
	// 4 decks: 0,2,4,6,8
	const jokerOptions = useComputed(() => {
		/** @type {Array<number | string>} */
		let options = [];
		for (let i = 0; i <= deckCount.value; i++) {
			options.push(i * 2);
		}
		return options;
	});
	const jokerCount = useSignal(4);

	const totalCardCount = useComputed(
		() => deckCount.value * 52 + jokerCount.value
	);

	// Determine the possible kitty sizes. The minimum kitty size is the number of
	// cards left over after all players have drawn and there are not enough for
	// everyone to have another card (i.e. totalCards % playerCount). The other
	// possible kitty size is this min size + the number of players. So drawing
	// stops one round before the cards run out.
	const kittyOptions = useComputed(() => {
		let minKittySize = totalCardCount.value % playerCount.value;
		return [minKittySize, minKittySize + playerCount.value];
	});
	const kittySize = useSignal(8);

	// Update the default kitty size whenever the possible kitty options changes.
	useSignalEffect(() => {
		let minValue = Math.abs(8 - kittyOptions.value[0]);
		let minIndex = 0;
		for (let i = 1; i < kittyOptions.value.length; i++) {
			let distance = Math.abs(8 - kittyOptions.value[i]);
			if (distance < minValue) {
				minValue = distance;
				minIndex = i;
			}
		}

		kittySize.value = kittyOptions.value[minIndex];
	});

	const handSize = useComputed(
		() =>
			(deckCount.value * 52 + jokerCount.value - kittySize.value) /
			playerCount.value
	);

	const kittyHandRatio = useComputed(
		() => ((kittySize.value / handSize.value) * 100).toFixed(0) + "%"
	);

	const defenderCount = useComputed(() => deckCount.value); // ????
	const cardsToCall = useComputed(() => defenderCount.value - 1);
	const defenderPoints1 = useComputed(() => playerCount.value);
	const defenderPoints2 = useComputed(() => playerCount.value);
	const attackerCount = useComputed(
		() => playerCount.value - defenderCount.value
	);
	const attackerPoints1 = useComputed(() => playerCount.value);
	const attackerPoints2 = useComputed(() => playerCount.value);

	const isRecommendedLoaded = useComputed(() => {
		let recommended = recommendedSettings[playerCount.value];
		return (
			recommended.jokerCount == jokerCount.value &&
			recommended.kittySize == kittySize.value
		);
	});

	return (
		<>
			<h1>Finding Friends calculator</h1>
			<div class="form-group">
				<label class="form-label" for="playerCount">
					Number of players:{" "}
				</label>
				<select
					id="playerCount"
					class="form-select"
					onChange={(e) => {
						const target = /** @type {HTMLSelectElement} */ (e.target);
						playerCount.value = parseInt(target.value, 10);
					}}
				>
					{playerCountOptions.map((opt) => (
						<option
							value={opt}
							selected={playerCount.value == opt ? true : false}
						>
							{opt}
						</option>
					))}
				</select>{" "}
				<button
					disabled={isRecommendedLoaded}
					onClick={() => {
						let recommended = recommendedSettings[playerCount.value];
						jokerCount.value = recommended.jokerCount;
						kittySize.value = recommended.kittySize;
					}}
				>
					Reset to recommended
				</button>
			</div>
			<div class="form-group">Number of decks: {deckCount}</div>
			<div class="form-group">
				<label class="form-label" for="jokerCount">
					Number of jokers:{" "}
				</label>
				<select
					id="jokerCount"
					class="form-select"
					onChange={(e) => {
						const target = /** @type {HTMLSelectElement} */ (e.target);
						jokerCount.value = parseInt(target.value, 10);
					}}
				>
					{jokerOptions.value.map((opt) => (
						<option
							value={opt}
							selected={jokerCount.value == opt ? true : false}
						>
							{opt}
						</option>
					))}
				</select>
			</div>
			<div class="form-group">
				<label class="form-label" for="kittySize">
					Size of kitty:{" "}
				</label>
				<select
					id="kittySize"
					class="form-select"
					onChange={(e) => {
						const target = /** @type {HTMLSelectElement} */ (e.target);
						kittySize.value = parseInt(target.value, 10);
					}}
				>
					{kittyOptions.value.map((opt) => (
						<option
							value={opt}
							selected={kittySize.value == opt ? true : false}
						>
							{opt}
						</option>
					))}
				</select>
			</div>
			<div>Size of hand: {handSize}</div>
			<div>Kitty/Hand ratio: {kittyHandRatio}</div>
			{/* TODO: */}
			{/* <p>Defenders</p>
			<p>
				Person who declares (leader) and everyone else who plays the cards they
				call
			</p>
			<ul>
				<li>Number of players: {defenderCount}</li>
				<li>Cards to call: {cardsToCall}</li>
				<li>Points to score 1: {defenderPoints1}</li>
				<li>Points to score 2: {defenderPoints2}</li>
			</ul>
			<p>Attackers:</p>
			<p>Everyone not on defending team</p>
			<ul>
				<li>Number of players: {attackerCount}</li>
				<li>Points to score 1: {attackerPoints1}</li>
				<li>Points to score 2: {attackerPoints2}</li>
			</ul> */}
		</>
	);
}
