export default function GameInstructions() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h2 className="text-lg font-semibold text-gray-700 mb-3">How to Play</h2>
      <ul className="text-sm text-gray-600 space-y-2">
        <li className="flex items-start">
          <span className="text-indigo-600 mr-2">•</span> 
          Players take turns placing their symbol on the board
        </li>
        <li className="flex items-start">
          <span className="text-indigo-600 mr-2">•</span> 
          First player to get 3 of their symbols in a row (horizontal, vertical, or diagonal) wins
        </li>
        <li className="flex items-start">
          <span className="text-indigo-600 mr-2">•</span> 
          If all cells are filled without a winner, the game ends in a draw
        </li>
        <li className="flex items-start">
          <span className="text-indigo-600 mr-2">•</span> 
          The turn order is: Player 1 → Player 2 → Player 3 → Player 4
        </li>
      </ul>
    </div>
  );
}
