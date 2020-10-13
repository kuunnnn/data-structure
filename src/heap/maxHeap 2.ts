/**
 * @description
 * @author hukun
 * @date 2019-12-31
 * @export
 * @class MaxHeap
 */
export class MaxHeap {
  private data: number[];

  public constructor(list?: number[]) {
    list = list || [];
    this.data = [...list];
    this.siftDown();
  }

  public siftUp(i: number): void {
    let k = i;
    while (k >= 0) {
      const pater = Math.floor(k / 2);
      if (this.data[k] > this.data[pater]) {
        this.swap(k, pater);
        k = pater;
      } else {
        break;
      }
    }
  }

  public siftDown(): void {
    const len = this.data.length;
    for (let i = Math.floor(len / 2); i >= 0; i--) {
      this.adjust(i, len);
    }
  }

  public adjust(i: number, length: number): void {
    const temp = this.data[i];
    for (let k = 2 * i + 1; k <= length; k = 2 * k + 1) {
      if (k + 1 < length && this.data[k] < this.data[k + 1]) {
        k++;
      }
      if (this.data[k] > temp) {
        this.data[i] = this.data[k];
        i = k;
      } else {
        break;
      }
    }
    this.data[i] = temp;
  }

  public push(ele: number): number {
    this.data.push(ele);
    const len = this.data.length;
    this.siftUp(len - 1);
    return len;
  }

  public del(): number {
    const temp = this.data.splice(0, 1)[0];
    this.siftDown();
    return temp;
  }

  public sort(): void {
    for (let i = this.data.length - 1; i >= 0; i--) {
      this.swap(0, i);
      this.adjust(0, i);
    }
  }

  public size(): number {
    return this.data.length;
  }

  public clear(): void {
    this.data = [];
  }

  public swap(i: number, j: number): void {
    const temp = this.data[i];
    this.data[i] = this.data[j];
    this.data[j] = temp;
  }
}
