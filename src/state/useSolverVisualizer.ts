import {useCallback, useRef, useState} from 'react';
import {LevelDefinition} from '../types/types.ts';
import {solveWithSteps, SolverStep} from '../core/solver.ts';

const STEP_INTERVAL_MS = 1;

export type SolverCells = {
  try: {x: number; y: number}[];
  placed: {x: number; y: number}[];
  solved: boolean;
};

export function useSolverVisualizer(level: LevelDefinition) {
  const [solverCells, setSolverCells] = useState<SolverCells>({
    try: [],
    placed: [],
    solved: false,
  });
  const [isRunning, setIsRunning] = useState(false);
  const [totalSteps, setTotalSteps] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepsRef = useRef<SolverStep[]>([]);
  const stepIndexRef = useRef(0);
  // tracks cells placed so far during playback
  const placedCellsRef = useRef<{x: number; y: number}[]>([]);

  const stop = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setSolverCells({try: [], placed: [], solved: false});
    stepsRef.current = [];
    stepIndexRef.current = 0;
    placedCellsRef.current = [];
  }, []);

  const start = useCallback(() => {
    stop();

    const steps = solveWithSteps(level).filter(s => s.type !== 'try');
    stepsRef.current = steps;
    stepIndexRef.current = 0;
    placedCellsRef.current = [];
    setTotalSteps(steps.length);
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      const index = stepIndexRef.current;
      const allSteps = stepsRef.current;

      if (index >= allSteps.length) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setIsRunning(false);
        return;
      }

      const step = allSteps[index];
      stepIndexRef.current = index + 1;

      if (step.type === 'place') {
        placedCellsRef.current = [...placedCellsRef.current, ...step.cells];
        setSolverCells({try: [], placed: [...placedCellsRef.current], solved: false});
      } else if (step.type === 'undo') {
        const removedSet = new Set(step.cells.map(c => `${c.x},${c.y}`));
        placedCellsRef.current = placedCellsRef.current.filter(
          c => !removedSet.has(`${c.x},${c.y}`),
        );
        setSolverCells({try: [], placed: [...placedCellsRef.current], solved: false});
      } else if (step.type === 'solved') {
        setSolverCells({try: [], placed: step.cells, solved: true});
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setIsRunning(false);
      } else {
        // 'try' — skip
      }
    }, STEP_INTERVAL_MS);
  }, [level, stop]);

  return {solverCells, isRunning, totalSteps, start, stop};
}
