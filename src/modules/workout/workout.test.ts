import { expect, describe, test } from '@jest/globals';
import PartService from './service/part.service';

describe('workout tests', () => {
    describe('part service', () => {
      test('#1 calculate average heart rate', () => {
        const {averageHR, completedNum} = PartService.calculateAvgHR(95, 3, 125);
        expect(averageHR).toEqual(103);
        expect(completedNum).toEqual(4);
      });

      test('#2 set part average heart rate and users who completed count', () => {
        const part = {
          name: 'test',
          completed: false,
          targetHR: 80,
          nodes: [],
          averageHR: 0,
          completedNum: 0,
        }
        
        PartService.setPartHR(part, 90, 1);
        
        expect(part.targetHR).toEqual(80);
        expect(part.averageHR).toEqual(90);
        expect(part.completedNum).toEqual(1);
      });

      test('#3 set part heart rate when 10 users completed a part or a part', () => {
        const part = {
          name: 'test',
          completed: false,
          targetHR: 80,
          nodes: [],
          averageHR: 0,
          completedNum: 0,
        }
        
        PartService.setPartHR(part, 90, 10);
        
        expect(part.targetHR).toEqual(90);
        expect(part.averageHR).toEqual(90);
        expect(part.completedNum).toEqual(10);
      });
    });
});