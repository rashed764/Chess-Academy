/**
 * Base chess engine adapter architecture.
 * Full Stockfish WASM worker integration will be completed in Task 03.
 */

import type { EngineEvaluation } from '../../types/chess';
import type { EngineSearchOptions, EngineStatus, IChessEngineAdapter } from './types';

export class UnconfiguredChessEngineAdapter implements IChessEngineAdapter {
  readonly engineName = 'Stockfish WASM (Pending Task 03)';
  private _status: EngineStatus = 'uninitialized';

  get status(): EngineStatus {
    return this._status;
  }

  async init(): Promise<void> {
    // Architectural placeholder: Engine initialization is scheduled for Task 04
    this._status = 'uninitialized';
  }

  async isReady(): Promise<boolean> {
    return false;
  }

  async setPosition(_fen: string, _movesUci?: string[]): Promise<void> {
    throw new Error('Stockfish engine is not configured in Task 01 foundation.');
  }

  async evaluatePosition(_fen: string, _options?: EngineSearchOptions): Promise<EngineEvaluation> {
    throw new Error('Stockfish evaluation is scheduled for Task 03 implementation.');
  }

  async findBestMove(_fen: string, _options?: EngineSearchOptions): Promise<string> {
    throw new Error('Stockfish best-move calculation is scheduled for Task 03 implementation.');
  }

  async stopSearch(): Promise<void> {
    // No-op for unconfigured adapter
  }

  async setSkillLevel(_level: number): Promise<void> {
    // No-op for unconfigured adapter
  }

  terminate(): void {
    this._status = 'terminated';
  }
}

let activeEngineInstance: IChessEngineAdapter | null = null;

export function getChessEngine(): IChessEngineAdapter {
  if (!activeEngineInstance) {
    activeEngineInstance = new UnconfiguredChessEngineAdapter();
  }
  return activeEngineInstance;
}
