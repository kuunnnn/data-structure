export function hasArrayMaxHeap(maxHeap: number[]) {
  for (let i = 1; i < Math.floor(maxHeap.length / 2); i++) {
    // 判断左右节点是否都小于当前节点
    if (
      maxHeap[i] < maxHeap[i * 2] ||
      (i * 2 + 1 < maxHeap.length && maxHeap[i] < maxHeap[i * 2 + 1])
    ) {
      return false;
    }
  }
  // 判断是否为最大堆
  return Math.max(...maxHeap) === maxHeap[1];
}

export class MaxArrayHeap {
  heap: number[];
  constructor(initArray?: number[]) {
    this.heap = [0];
    if (initArray && Array.isArray(initArray)) {
      this.heap = this.heap.concat(initArray);
      for (
        let i = this.heap.length - 1, len = Math.floor(this.heap.length / 2);
        i > len;
        i--
      ) {
        this.adjustment(i);
      }
    }
  }

  private adjustment(i: number) {
    while (i !== 1) {
      const top = Math.floor(i / 2);
      if (this.heap[i] <= this.heap[top]) {
        break;
      }
      this.swap(i, top);
      i = top;
    }
  }
  private swap(i: number, j: number) {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }
  push(val: number) {
    this.heap.push(val);
    this.adjustment(this.heap.length - 1);
  }
  peak() {
    return this.heap.length > 1 ? this.heap[1] : null;
  }
  pop() {
    if (this.heap.length === 1) return null;
    this.swap(1, this.heap.length - 1);
    let i = 1;
    const result = this.heap.pop();
    while (i < this.heap.length) {
      const left = i * 2;
      if (left >= this.heap.length) break;
      const right = i * 2 + 1;
      let max = left;
      if (right < this.heap.length) {
        max = this.heap[left] >= this.heap[right] ? left : right;
      }
      if (this.heap[i] > this.heap[max] || right >= this.heap.length) {
        break;
      }
      this.swap(i, max);
      i = max;
    }
    return result;
  }
}
