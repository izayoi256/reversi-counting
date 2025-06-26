type BoardOptions = {
  blackBoard?: bigint;
  whiteBoard?: bigint;
  moves?: number[];
  undoCount?: number;
};

export class Board {
  static readonly BLANK_BOARD: bigint = (1n << 64n) - 1n;
  private _blackBoards: bigint[];
  private _whiteBoards: bigint[];
  private _allMoves: (number | null)[];
  private _undoCount: number;


  constructor({blackBoard, whiteBoard, moves, undoCount}: BoardOptions = {}) {
    this._blackBoards = [blackBoard ?? 0x0000000810000000n];
    this._whiteBoards = [whiteBoard ?? 0x0000001008000000n];
    this._allMoves = [];
    this._undoCount = 0;

    (moves ?? []).forEach((move) => {
      this.makeMove(move);
    });

    this._undoCount = undoCount ?? 0;
  }

  public clone(): Board {
    return new Board({
      blackBoard: this._blackBoards[0],
      whiteBoard: this._whiteBoards[0],
      moves: this.moves(true),
      undoCount: this._undoCount,
    });
  }

  private allMoves(includeUndone: boolean = false): (number | null)[] {

    const allMoves = [...this._allMoves];

    if (includeUndone) {
      return allMoves;
    }

    for (let i = 0; i < this._undoCount; i++) {
      while (allMoves.at(-1) === null) {
        allMoves.pop();
      }
      allMoves.pop();
    }

    return allMoves;
  }

  public moves(includeUndone: boolean = false): number[] {
    const filtered = this._allMoves.filter((move): move is number => move !== null);
    return includeUndone
        ? filtered
        : filtered.slice(0, filtered.length - this._undoCount);
  }

  public movesMade(): number {
    return this.moves().length;
  }

  public blackBoard(): bigint {
    return this._blackBoards[this.movesMade()];
  }

  private blackBoards(): bigint[] {
    return this._blackBoards.slice(0, this.movesMade() + 1);
  }

  public whiteBoard(): bigint {
    return this._whiteBoards[this.movesMade()];
  }

  private whiteBoards(): bigint[] {
    return this._whiteBoards.slice(0, this.movesMade() + 1);
  }

  private get playerBoards(): bigint[] {
    return this.isBlackTurn()
        ? this._blackBoards
        : this._whiteBoards;
  }

  private get opponentBoards(): bigint[] {
    return this.isBlackTurn()
        ? this._whiteBoards
        : this._blackBoards;
  }

  public isBlackTurn(): boolean {
    return this.allMoves().length % 2 === 0;
  }

  public isWhiteTurn(): boolean {
    return this.allMoves().length % 2 === 1;
  }

  public isOver(): boolean {
    const allMoves = this.allMoves();
    return allMoves.length >= 2 && allMoves.at(-1) === null && allMoves.at(-2) === null;
  }

  public playerBoard(): bigint {
    return this.isBlackTurn()
        ? this.blackBoard()
        : this.whiteBoard();
  }

  public opponentBoard(): bigint {
    return this.isBlackTurn()
        ? this.whiteBoard()
        : this.blackBoard();
  }

  public occupiedBoard(): bigint {
    return Board.occupiedBoardOf(this.blackBoard(), this.whiteBoard());
  }

  private static occupiedBoardOf(b1: bigint, b2: bigint): bigint {
    return b1 | b2;
  }

  public vacantBoard(): bigint {
    return Board.vacantBoardOf(this.occupiedBoard());
  }

  private static vacantBoardOf(b: bigint): bigint {
    return Board.BLANK_BOARD & ~(b);
  }

  private static legalBoardOf(
      playerBoard: bigint,
      opponentBoard: bigint,
  ): bigint {

    const horizontalWatchBoard = opponentBoard & 0x7e7e7e7e7e7e7e7en;
    const verticalWatchBoard = opponentBoard & 0x00FFFFFFFFFFFF00n;
    const allSideWatchBoard = opponentBoard & 0x007e7e7e7e7e7e00n;
    const vacantBoard = Board.vacantBoardOf(Board.occupiedBoardOf(playerBoard, opponentBoard));
    let tmp: bigint = 0n;
    let legalBoard: bigint = 0n;

    tmp = horizontalWatchBoard & (playerBoard << 1n);
    tmp |= horizontalWatchBoard & (tmp << 1n);
    tmp |= horizontalWatchBoard & (tmp << 1n);
    tmp |= horizontalWatchBoard & (tmp << 1n);
    tmp |= horizontalWatchBoard & (tmp << 1n);
    tmp |= horizontalWatchBoard & (tmp << 1n);
    legalBoard = vacantBoard & (tmp << 1n);

    tmp = horizontalWatchBoard & (playerBoard >> 1n);
    tmp |= horizontalWatchBoard & (tmp >> 1n);
    tmp |= horizontalWatchBoard & (tmp >> 1n);
    tmp |= horizontalWatchBoard & (tmp >> 1n);
    tmp |= horizontalWatchBoard & (tmp >> 1n);
    tmp |= horizontalWatchBoard & (tmp >> 1n);
    legalBoard |= vacantBoard & (tmp >> 1n);

    tmp = verticalWatchBoard & (playerBoard << 8n);
    tmp |= verticalWatchBoard & (tmp << 8n);
    tmp |= verticalWatchBoard & (tmp << 8n);
    tmp |= verticalWatchBoard & (tmp << 8n);
    tmp |= verticalWatchBoard & (tmp << 8n);
    tmp |= verticalWatchBoard & (tmp << 8n);
    legalBoard |= vacantBoard & (tmp << 8n);

    tmp = verticalWatchBoard & (playerBoard >> 8n);
    tmp |= verticalWatchBoard & (tmp >> 8n);
    tmp |= verticalWatchBoard & (tmp >> 8n);
    tmp |= verticalWatchBoard & (tmp >> 8n);
    tmp |= verticalWatchBoard & (tmp >> 8n);
    tmp |= verticalWatchBoard & (tmp >> 8n);
    legalBoard |= vacantBoard & (tmp >> 8n);

    tmp = allSideWatchBoard & (playerBoard << 7n);
    tmp |= allSideWatchBoard & (tmp << 7n);
    tmp |= allSideWatchBoard & (tmp << 7n);
    tmp |= allSideWatchBoard & (tmp << 7n);
    tmp |= allSideWatchBoard & (tmp << 7n);
    tmp |= allSideWatchBoard & (tmp << 7n);
    legalBoard |= vacantBoard & (tmp << 7n);

    tmp = allSideWatchBoard & (playerBoard << 9n);
    tmp |= allSideWatchBoard & (tmp << 9n);
    tmp |= allSideWatchBoard & (tmp << 9n);
    tmp |= allSideWatchBoard & (tmp << 9n);
    tmp |= allSideWatchBoard & (tmp << 9n);
    tmp |= allSideWatchBoard & (tmp << 9n);
    legalBoard |= vacantBoard & (tmp << 9n);

    tmp = allSideWatchBoard & (playerBoard >> 9n);
    tmp |= allSideWatchBoard & (tmp >> 9n);
    tmp |= allSideWatchBoard & (tmp >> 9n);
    tmp |= allSideWatchBoard & (tmp >> 9n);
    tmp |= allSideWatchBoard & (tmp >> 9n);
    tmp |= allSideWatchBoard & (tmp >> 9n);
    legalBoard |= vacantBoard & (tmp >> 9n);

    tmp = allSideWatchBoard & (playerBoard >> 7n);
    tmp |= allSideWatchBoard & (tmp >> 7n);
    tmp |= allSideWatchBoard & (tmp >> 7n);
    tmp |= allSideWatchBoard & (tmp >> 7n);
    tmp |= allSideWatchBoard & (tmp >> 7n);
    tmp |= allSideWatchBoard & (tmp >> 7n);
    legalBoard |= vacantBoard & (tmp >> 7n);

    return legalBoard;
  }

  public legalBoard(): bigint {
    return Board.legalBoardOf(this.playerBoard(), this.opponentBoard());
  }

  public canMakeMove(move: number): boolean {
    const moveBoard = Board.moveToBoard(move);
    return moveBoard != 0n && ((moveBoard & this.legalBoard()) > 0n);
  }

  public makeMove(move: number): void {
    if (!this.canMakeMove(move)) {
      throw new Error();
    }

    this._blackBoards = this.blackBoards();
    this._whiteBoards = this.whiteBoards();
    this._allMoves = this.allMoves();
    this._undoCount = 0;

    this.handleMove(move);
  }

  private handleMove(move: number): void {
    const put = Board.moveToBoard(move);
    const playerBoard = this.playerBoard();
    const opponentBoard: bigint = this.opponentBoard();
    let rev = 0n;
    for (let k: number = 0; k < 8; k++) {
      let rev_ = 0n;
      let mask: bigint = this.transfer(put, k);
      while ((mask !== 0n) && ((mask & opponentBoard) !== 0n)) {
        rev_ |= mask;
        mask = this.transfer(mask, k);
      }
      if ((mask & playerBoard) !== 0n) {
        rev |= rev_;
      }
    }
    this.playerBoards.push(playerBoard ^ (put | rev));
    this.opponentBoards.push(opponentBoard ^ rev);
    this._allMoves.push(move);

    if (this.legalMoves().length == 0) {
      this._allMoves.push(null);
      if (this.legalMoves().length == 0) {
        this._allMoves.push(null);
      }
    }
  }

  private transfer(put: bigint, k: number): bigint {
    switch (k) {
      case 0:
        return (put << 8n) & 0xffffffffffffff00n;
      case 1:
        return (put << 7n) & 0x7f7f7f7f7f7f7f00n;
      case 2:
        return (put >> 1n) & 0x7f7f7f7f7f7f7f7fn;
      case 3:
        return (put >> 9n) & 0x007f7f7f7f7f7f7fn;
      case 4:
        return (put >> 8n) & 0x00ffffffffffffffn;
      case 5:
        return (put >> 7n) & 0x00fefefefefefefen;
      case 6:
        return (put << 1n) & 0xfefefefefefefefen;
      case 7:
        return (put << 9n) & 0xfefefefefefefe00n;
      default:
        return 0n;
    }
  }

  public legalMoves(): number[] {
    return Board.boardToMoves(this.legalBoard());
  }

  public cells(): number[] {
    const cells: number[] = [];
    const blackBoard = this.blackBoard();
    const whiteBoard = this.whiteBoard();
    const legalBoard = this.legalBoard();
    for (let i: number = 0; i < 64; i++) {
      if (((legalBoard >> BigInt(i)) & 1n) > 0) {
        cells[i] = 3;
        continue;
      }
      if (((blackBoard >> BigInt(i)) & 1n) > 0) {
        cells[i] = 1;
        continue;
      }
      if (((whiteBoard >> BigInt(i)) & 1n) > 0) {
        cells[i] = 2;
        continue;
      }
      cells[i] = 0;
    }
    return cells;
  }

  public canUndo(): boolean {
    return this.movesMade() > 0;
  }

  public undo(): void {
    this._undoCount++;
  }

  public static boardToMoves(board: bigint): number[] {
    const moves: number[] = [];
    for (let i: number = 0; i < 64; i++) {
      if (((board >> BigInt(i)) & 1n) == 1n) {
        moves.push(i);
      }
    }
    return moves;
  }

  public static moveToBoard(move: number): bigint {
    return (1n << BigInt(move)) & this.BLANK_BOARD;
  }
}
