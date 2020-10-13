import { isOrderly } from '../../sort/check';
import { BPlusTreeTool } from './bPlusTree';
import { CreateSortData } from '../../sort/sort_data';

function flatOne<T = number>(list: T[][]): T[] {
  return list.reduce((s, c) => s.concat(c), []);
}

describe('B+Tree', () => {
  test('简单数据插入', () => {
    const b = new BPlusTreeTool<number>(5);
    b.testInset([1, 2, 3, 4]);
    expect(b.count).toBe(4);
    expect(b.OutputLeafKey()).toEqual([[1, 2, 3, 4]]);
    expect(isOrderly(flatOne(b.OutputLeafKey()), 1)).toBeTruthy();
  });
  test('节点分裂', () => {
    const b = new BPlusTreeTool<number>(5);
    b.testInset([1, 2, 3, 4, 5]);
    expect(b.count).toBe(5);
    expect(b.OutputLeafKey()).toEqual([[1, 2], [3, 4, 5]]);
    expect(isOrderly(flatOne(b.OutputLeafKey()), 1)).toBeTruthy();
    for (let level of b.outputLevelInfo()) {
      expect(
        isOrderly(flatOne(level.map(v => v.map(j => j.key))), 1)
      ).toBeTruthy();
    }
  });
  test('插入移动左移', () => {
    const b = new BPlusTreeTool<number>(5);
    b.testInset([1, 2, 3, 4, 5, 6, 7]);
    expect(b.count).toBe(7);
    expect(b.OutputLeafKey()).toEqual([[1, 2, 3], [4, 5, 6, 7]]);
    for (let level of b.outputLevelInfo()) {
      expect(
        isOrderly(flatOne(level.map(v => v.map(j => j.key))), 1)
      ).toBeTruthy();
    }
  });
  test('插入移动右移', () => {
    const b = new BPlusTreeTool<number>(5);
    b.testInset([1, 20, 30, 40, 50, 3, 4, 2, 5]);
    expect(b.count).toBe(9);
    expect(b.OutputLeafKey()).toEqual([[1, 2, 3, 4], [5, 20], [30, 40, 50]]);
    for (let level of b.outputLevelInfo()) {
      expect(
        isOrderly(flatOne(level.map(v => v.map(j => j.key))), 1)
      ).toBeTruthy();
    }
  });
  test('find And findRange', () => {
    const b = new BPlusTreeTool<number>(5);
    b.insert(1, 1);
    b.insert(20, 20);
    b.insert(30, 30);
    b.insert(40, 40);
    b.insert(50, 20000);
    b.insert(3, 3);
    b.insert(4, 4);
    b.insert(2, 2);
    b.insert(5, 5);
    expect(b.find(50)).toEqual([20000, true]);
    expect(b.findRange(5, 40)).toEqual([5, 20, 30, 40]);
  });
  test('find size', () => {
    const b = new BPlusTreeTool<number>(5);
    b.testInset([
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
    ]);
    expect(b.findPerf(13)).toBe(2);
  });
  test('error', () => {
    const b = new BPlusTreeTool<number>(5);
    b.testInset([1, 2]);
    expect(() => b.insert(1, 1)).toThrow('key [1] is exist');
  });
  test('delete', () => {
    const b = new BPlusTreeTool<number>(5);
    b.testInset([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    b.delete(8);
    b.delete(7);
    expect(b.OutputLeafKey()).toEqual([
      [1, 2, 3, 4],
      [5, 6],
      [9, 10],
      [11, 12, 13],
    ]);
    b.delete(6);
    expect(b.OutputLeafKey()).toEqual([
      [1, 2],
      [3, 4, 5],
      [9, 10],
      [11, 12, 13],
    ]);
    expect(() => b.insert(1, 1)).toThrow('key [1] is exist');
  });
  test('5 次随机插入', () => {
    const b = new BPlusTreeTool<number>(5);
    for (let v of [1, 2, 3, 4, 5]) {
      const testData = CreateSortData(2000);
      b.testInset(testData);
      for (let level of b.outputLevelInfo()) {
        expect(
          isOrderly(flatOne(level.map(v => v.map(j => j.key))), 1)
        ).toBeTruthy();
      }
      b.clear();
    }
  });
  test('5 次随机删除', () => {
    const b = new BPlusTreeTool<number>(5);
    for (let v of [1, 2, 3, 4, 5]) {
      const testData = CreateSortData(2000);
      const removeData = CreateSortData(2000).slice(0, 5);
      b.testInset(testData);
      for (let r of removeData) {
        b.delete(r);
        for (let level of b.outputLevelInfo()) {
          expect(
            isOrderly(flatOne(level.map(v => v.map(j => j.key))), 1)
          ).toBeTruthy();
        }
      }
      b.clear();
    }
  });
  test('has', () => {
    const b = new BPlusTreeTool<number>(5);
    b.testInset([1, 2, 3, 4, 5, 6, 7]);
    expect(b.has(4)).toBe(true);
    expect(b.has(3)).toBe(true);
    expect(b.has(7)).toBe(true);
    expect(b.has(5)).toBe(true);
    expect(b.has(8)).toBe(false);
  });
  test('modify', () => {
    const b = new BPlusTreeTool<number>(5);
    expect(b.modify(9, 5)).toBe(false);
    b.testInset([1, 2, 3, 4, 5, 6, 7]);
    expect(b.find(4)).toEqual([4, true]);
    b.modify(4, 2000);
    expect(b.find(4)).toEqual([2000, true]);
    expect(b.modify(900, 5)).toBe(false);
  });
  test('forEach', () => {
    const b = new BPlusTreeTool<number>(5);
    b.testInset([1, 2, 3, 4, 5, 6, 7]);
    const r: number[] = [];
    b.forEach((k, value) => {
      r.push(k);
      return false;
    });
    expect(r).toEqual([1, 2, 3, 4, 5, 6, 7]);

    r.length = 0;
    b.forEach((k, value) => {
      r.push(k);
      return k === 5;
    });
    expect(r).toEqual([1, 2, 3, 4, 5]);

    r.length = 0;
    b.forEach((k, value) => {
      r.push(k);
      return false;
    }, false);
    expect(r).toEqual([1, 2, 3, 4, 5, 6, 7].reverse());

    r.length = 0;
    b.forEach((k, value) => {
      r.push(k);
      return k === 5;
    }, false);
    expect(r).toEqual([7, 6, 5]);
  });
  test('toJSON', () => {
    const b = new BPlusTreeTool<number>(5);
    expect(b.toJSON()).toEqual({});
    b.testInset([1, 2, 3, 4, 5, 6]);
    const res: any = {
      root: {
        id: 6,
        meta: [
          {
            key: 2,
            value: null,
            children: 2,
          },
          {
            key: 6,
            value: null,
            children: 6,
          },
        ],
      },
      rank: 5,
      count: 6,
      level: [
        [
          {
            id: 6,
            meta: [
              {
                key: 2,
                value: null,
                children: 2,
              },
              {
                key: 6,
                value: null,
                children: 6,
              },
            ],
          },
        ],
        [
          {
            id: 2,
            meta: [
              {
                key: 1,
                value: 1,
                children: null,
              },
              {
                key: 2,
                value: 2,
                children: null,
              },
            ],
          },
          {
            id: 6,
            meta: [
              {
                key: 3,
                value: 3,
                children: null,
              },
              {
                key: 4,
                value: 4,
                children: null,
              },
              {
                key: 5,
                value: 5,
                children: null,
              },
              {
                key: 6,
                value: 6,
                children: null,
              },
            ],
          },
        ],
      ],
    };
    expect(b.toJSON()).toEqual(res);
  });
  test('print', () => {
    const b = new BPlusTreeTool<number>(5);
    expect(b.print()).toEqual([]);
    b.testInset([1, 2, 3, 4, 5, 6]);
    const level = b.print();
    expect(level[0]).toBe('* * * * * 2 6 * * * * *');
    expect(level[1]).toBe('* * 1 2 * * 3 4 5 6 * *');
    expect(b.printLeaf()).toBe('* * 1 2 * * 3 4 5 6 * *');
  });
});
