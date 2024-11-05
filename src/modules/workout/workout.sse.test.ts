import { expect, describe, test } from '@jest/globals';
import WorkoutSSE from './workout.sse';
import { NodeDifficult } from './workout.constant';
import { ACTION_LIST } from '../progress/progress.constant';

describe('workout sse tests', () => {
  describe('nodeHrRange', () => {
    test('#1 below 90, above 110', () => {
      const targetHr = 100;
      const percentHeartRate = 10;
      const defaultHr = { above: 0, below: 0 };

      const result = WorkoutSSE.nodeHrRange(targetHr, percentHeartRate, defaultHr);
      expect(result).toEqual({ above: 110, below: 110 });
    });

    test('#2 below 86, above 116', () => {
      const targetHr = 100;
      const percentHeartRate = 10;
      const defaultHr = { above: 5, below: -5 };

      const result = WorkoutSSE.nodeHrRange(targetHr, percentHeartRate, defaultHr);
      expect(result).toEqual({ above: 116, below: 105 });
    });

    test('#3 below 86, above 116', () => {
      const targetHr = 100;
      const percentHeartRate = -10;
      const defaultHr = { above: -5, below: 5 };

      const result = WorkoutSSE.nodeHrRange(targetHr, percentHeartRate, defaultHr);
      expect(result).toEqual({ above: 95, below: 86 });
    });

    test('#4 below 100, above 100', () => {
      const targetHr = 100;
      const percentHeartRate = 0;
      const defaultHr = { above: 0, below: 0 };

      const result = WorkoutSSE.nodeHrRange(targetHr, percentHeartRate, defaultHr);
      expect(result).toEqual({ above: 100, below: 100 });
    });
  });

  describe('getNextNodes', () => {
    test('#1', () => {
      const videoNode = {
        name: 'Node name',
        completed: false,
        targetHR: 100,
        nodes: [
          {
            timeStart: 0,
            timeEnd: 30,
            difficult: 'HIGH',
            hr: 120,
          },
          {
            timeStart: 31,
            timeEnd: 60,
            difficult: 'MEDIUM',
            hr: 100,
          },
          {
            timeStart: 61,
            timeEnd: 90,
            difficult: 'LOW',
            hr: 80,
          },
        ],
      };

      const result = WorkoutSSE.getNextNodes(videoNode);

      expect(result).toEqual({
        [NodeDifficult.MEDIUM]: videoNode.nodes[1],
        [NodeDifficult.HIGH]: videoNode.nodes[0],
        [NodeDifficult.LOW]: videoNode.nodes[2],
      });
    });
  });

  describe('selectionNextNode', () => {
    const videoNode = {
      name: 'Node name',
      completed: false,
      targetHR: 100,
      nodes: [
        {
          timeStart: 0,
          timeEnd: 30,
          difficult: 'HIGH',
          hr: 120,
        },
        {
          timeStart: 31,
          timeEnd: 60,
          difficult: 'MEDIUM',
          hr: 100,
        },
        {
          timeStart: 61,
          timeEnd: 90,
          difficult: 'LOW',
          hr: 80,
        },
      ],
    };

    test('#1 next node LOW', () => {
      const nodeHrRange = { above: 116, below: 86 };
      const userHR = 120;
      const targetDifficult = NodeDifficult.MEDIUM;

      const result = WorkoutSSE.selectionNextNode(videoNode, nodeHrRange, userHR, targetDifficult);

      expect(result).toEqual({ timeStart: 61, timeEnd: 90, difficult: 'LOW', hr: 80 });
    });

    test('#2 next node MEDIUM', () => {
      const nodeHrRange = { above: 116, below: 86 };
      const userHR = 110;
      const targetDifficult = NodeDifficult.MEDIUM;

      const result = WorkoutSSE.selectionNextNode(videoNode, nodeHrRange, userHR, targetDifficult);

      expect(result).toEqual({ timeStart: 31, timeEnd: 60, difficult: 'MEDIUM', hr: 100 });
    });

    test('#3 next node HIGH', () => {
      const nodeHrRange = { above: 116, below: 86 };
      const userHR = 80;
      const targetDifficult = NodeDifficult.MEDIUM;

      const result = WorkoutSSE.selectionNextNode(videoNode, nodeHrRange, userHR, targetDifficult);

      expect(result).toEqual({ timeStart: 0, timeEnd: 30, difficult: 'HIGH', hr: 120 });
    });

    test('#4 next node HIGH', () => {
      const nodeHrRange = { above: 116, below: 86 };
      const userHR = 80;
      const targetDifficult = NodeDifficult.HIGH;

      const result = WorkoutSSE.selectionNextNode(videoNode, nodeHrRange, userHR, targetDifficult);

      expect(result).toEqual({ timeStart: 0, timeEnd: 30, difficult: 'HIGH', hr: 120 });
    });

    test('#5 next node HIGH', () => {
      const nodeHrRange = { above: 116, below: 86 };
      const userHR = 100;
      const targetDifficult = NodeDifficult.HIGH;

      const result = WorkoutSSE.selectionNextNode(videoNode, nodeHrRange, userHR, targetDifficult);

      expect(result).toEqual({ timeStart: 0, timeEnd: 30, difficult: 'HIGH', hr: 120 });
    });

    test('#6 next node MEDIUM', () => {
      const nodeHrRange = { above: 116, below: 86 };
      const userHR = 120;
      const targetDifficult = NodeDifficult.HIGH;

      const result = WorkoutSSE.selectionNextNode(videoNode, nodeHrRange, userHR, targetDifficult);

      expect(result).toEqual({ timeStart: 31, timeEnd: 60, difficult: 'MEDIUM', hr: 100 });
    });

    test('#7 next node MEDIUM', () => {
      const nodeHrRange = { above: 116, below: 86 };
      const userHR = 80;
      const targetDifficult = NodeDifficult.LOW;

      const result = WorkoutSSE.selectionNextNode(videoNode, nodeHrRange, userHR, targetDifficult);

      expect(result).toEqual({ timeStart: 31, timeEnd: 60, difficult: 'MEDIUM', hr: 100 });
    });

    test('#8 next node LOW', () => {
      const nodeHrRange = { above: 116, below: 86 };
      const userHR = 100;
      const targetDifficult = NodeDifficult.LOW;

      const result = WorkoutSSE.selectionNextNode(videoNode, nodeHrRange, userHR, targetDifficult);

      expect(result).toEqual({ timeStart: 61, timeEnd: 90, difficult: 'LOW', hr: 80 });
    });

    test('#9 next node LOW', () => {
      const nodeHrRange = { above: 116, below: 86 };
      const userHR = 120;
      const targetDifficult = NodeDifficult.LOW;

      const result = WorkoutSSE.selectionNextNode(videoNode, nodeHrRange, userHR, targetDifficult);

      expect(result).toEqual({ timeStart: 61, timeEnd: 90, difficult: 'LOW', hr: 80 });
    });
  });

  describe('getCompletedNodeDifficult', () => {
    test('#1 all 0', () => {
      const parts = [];

      const result = WorkoutSSE.getCompletedNodeDifficult(parts);

      expect(result).toEqual({
        [NodeDifficult.LOW]: 0,
        [NodeDifficult.HIGH]: 0,
        [NodeDifficult.MEDIUM]: 0,
      });
    });

    test('#2 all 1', () => {
      const parts = [
        {
          partIndex: 0,
          completedDifficult: NodeDifficult.LOW,
          nextDifficult: NodeDifficult.MEDIUM,
        },
        {
          partIndex: 1,
          completedDifficult: NodeDifficult.MEDIUM,
          nextDifficult: NodeDifficult.HIGH,
        },
        {
          partIndex: 2,
          completedDifficult: NodeDifficult.HIGH,
          nextDifficult: NodeDifficult.HIGH,
        },
      ];

      const result = WorkoutSSE.getCompletedNodeDifficult(parts);

      expect(result).toEqual({
        [NodeDifficult.LOW]: 1,
        [NodeDifficult.HIGH]: 1,
        [NodeDifficult.MEDIUM]: 1,
      });
    });
  });

  describe('getNewDifficultyInfo', () => {
    test('#1 Nothing change', () => {
      const abilityLevel = 5;
      const userDifficultyRate = 0;
      const needRepeatCountForChangeDiff = 2;
      const countDiff = {
        [NodeDifficult.LOW]: 1,
        [NodeDifficult.HIGH]: 2,
        [NodeDifficult.MEDIUM]: 2,
      };
      const partLength = 5;

      const result = WorkoutSSE.getNewDifficultyInfo(
        abilityLevel,
        userDifficultyRate,
        needRepeatCountForChangeDiff,
        countDiff,
        partLength
      );

      expect(result).toEqual({ abilityLevel: 5, action: ACTION_LIST.NONE, userDifficultyRate: 0 });
    });

    test('#2 ability level --', () => {
      const abilityLevel = 5;
      const userDifficultyRate = 0;
      const needRepeatCountForChangeDiff = 2;
      const countDiff = {
        [NodeDifficult.LOW]: 4,
        [NodeDifficult.HIGH]: 0,
        [NodeDifficult.MEDIUM]: 1,
      };
      const partLength = 5;

      const result = WorkoutSSE.getNewDifficultyInfo(
        abilityLevel,
        userDifficultyRate,
        needRepeatCountForChangeDiff,
        countDiff,
        partLength
      );

      expect(result).toEqual({ abilityLevel: 4, action: ACTION_LIST.NONE, userDifficultyRate: 0 });
    });

    test('#3 ability level ++', () => {
      const abilityLevel = 5;
      const userDifficultyRate = 0;
      const needRepeatCountForChangeDiff = 2;
      const countDiff = {
        [NodeDifficult.LOW]: 0,
        [NodeDifficult.HIGH]: 4,
        [NodeDifficult.MEDIUM]: 1,
      };
      const partLength = 5;

      const result = WorkoutSSE.getNewDifficultyInfo(
        abilityLevel,
        userDifficultyRate,
        needRepeatCountForChangeDiff,
        countDiff,
        partLength
      );

      expect(result).toEqual({ abilityLevel: 6, action: ACTION_LIST.NONE, userDifficultyRate: 0 });
    });

    test('#4 user difficulty rate ++', () => {
      const abilityLevel = 5;
      const userDifficultyRate = 0;
      const needRepeatCountForChangeDiff = 2;
      const countDiff = {
        [NodeDifficult.LOW]: 0,
        [NodeDifficult.HIGH]: 6,
        [NodeDifficult.MEDIUM]: 4,
      };
      const partLength = 10;

      const result = WorkoutSSE.getNewDifficultyInfo(
        abilityLevel,
        userDifficultyRate,
        needRepeatCountForChangeDiff,
        countDiff,
        partLength
      );

      expect(result).toEqual({ abilityLevel: 5, action: ACTION_LIST.NONE, userDifficultyRate: 1 });
    });

    test('#5 user difficulty rate --', () => {
      const abilityLevel = 5;
      const userDifficultyRate = 0;
      const needRepeatCountForChangeDiff = 2;
      const countDiff = {
        [NodeDifficult.LOW]: 6,
        [NodeDifficult.HIGH]: 0,
        [NodeDifficult.MEDIUM]: 4,
      };
      const partLength = 10;

      const result = WorkoutSSE.getNewDifficultyInfo(
        abilityLevel,
        userDifficultyRate,
        needRepeatCountForChangeDiff,
        countDiff,
        partLength
      );

      expect(result).toEqual({ abilityLevel: 5, action: ACTION_LIST.NONE, userDifficultyRate: -1 });
    });

    test('#6 action show decrease', () => {
      const abilityLevel = 5;
      const userDifficultyRate = -1;
      const needRepeatCountForChangeDiff = 2;
      const countDiff = {
        [NodeDifficult.LOW]: 6,
        [NodeDifficult.HIGH]: 0,
        [NodeDifficult.MEDIUM]: 4,
      };
      const partLength = 10;

      const result = WorkoutSSE.getNewDifficultyInfo(
        abilityLevel,
        userDifficultyRate,
        needRepeatCountForChangeDiff,
        countDiff,
        partLength
      );

      expect(result).toEqual({ abilityLevel: 5, action: ACTION_LIST.SHOW_DECREASE, userDifficultyRate: 0 });
    });

    test('#7 action show increase', () => {
      const abilityLevel = 5;
      const userDifficultyRate = 1;
      const needRepeatCountForChangeDiff = 2;
      const countDiff = {
        [NodeDifficult.LOW]: 0,
        [NodeDifficult.HIGH]: 6,
        [NodeDifficult.MEDIUM]: 4,
      };
      const partLength = 10;

      const result = WorkoutSSE.getNewDifficultyInfo(
        abilityLevel,
        userDifficultyRate,
        needRepeatCountForChangeDiff,
        countDiff,
        partLength
      );

      expect(result).toEqual({ abilityLevel: 5, action: ACTION_LIST.SHOW_INCREASE, userDifficultyRate: 0 });
    });

    test('#8 ability level = 10', () => {
      const abilityLevel = 10;
      const userDifficultyRate = 1;
      const needRepeatCountForChangeDiff = 2;
      const countDiff = {
        [NodeDifficult.LOW]: 0,
        [NodeDifficult.HIGH]: 6,
        [NodeDifficult.MEDIUM]: 4,
      };
      const partLength = 10;

      const result = WorkoutSSE.getNewDifficultyInfo(
        abilityLevel,
        userDifficultyRate,
        needRepeatCountForChangeDiff,
        countDiff,
        partLength
      );

      expect(result).toEqual({ abilityLevel: 10, action: ACTION_LIST.NONE, userDifficultyRate: 1 });
    });

    test('#9 ability level = 1', () => {
      const abilityLevel = 1;
      const userDifficultyRate = 1;
      const needRepeatCountForChangeDiff = 2;
      const countDiff = {
        [NodeDifficult.LOW]: 0,
        [NodeDifficult.HIGH]: 6,
        [NodeDifficult.MEDIUM]: 4,
      };
      const partLength = 10;

      const result = WorkoutSSE.getNewDifficultyInfo(
        abilityLevel,
        userDifficultyRate,
        needRepeatCountForChangeDiff,
        countDiff,
        partLength
      );

      expect(result).toEqual({ abilityLevel: 1, action: ACTION_LIST.NONE, userDifficultyRate: 1 });
    });
  });
});
