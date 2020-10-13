interface LinkedListNode<T> {
  next: LinkedListNode<T> | null;
  prev: LinkedListNode<T> | null;
  value: T;
}

export class LinkedList<T> {
  private head: LinkedListNode<T> = null;
  private tail: LinkedListNode<T> = null;

  /**
   * 向链表中新增一个元素
   * @param value
   */
  public append(value: T): void {
    const newNode = this.createNode(value);
    if (this.head === null) {
      this.head = newNode;
      return;
    }
    let node = this.head;
    while (node.next !== null) {
      node = node.next;
    }
    node.next = newNode;
    newNode.prev = node;
  }

  /**
   * 删除一个元素
   * @param value
   */
  public delete(value: T): boolean {
    if (!this.head) {
      return false;
    }

    let node = this.head;
    while (node.value !== value) {
      if (node.next === null) {
        break;
      }
      node = node.next;
    }

    if (node.value === value) {
      const prev = node.prev;
      const next = node.next;
      if (next !== null) {
        prev.next = next;
        next.prev = prev;
      } else {
        prev.next = null;
        this.tail = prev;
      }
    }

    return false;
  }

  public find(value: T, callback?: (value: T) => void): {} {
    if (!this.head) {
      return null;
    }
    let currentNode = this.head;
    while (currentNode) {
      if (value !== undefined && value === currentNode.value) {
        if (callback) {
          callback(currentNode.value);
        }
        return currentNode;
      }
      currentNode = currentNode.next;
    }
    return null;
  }

  public deleteTail(): T {
    if (this.head === this.tail) {
      const deletedTail = this.tail;
      this.head = null;
      this.tail = null;
      return deletedTail.value;
    }
    const deletedTail = this.tail;
    let currentNode = this.head;
    while (currentNode.next) {
      if (!currentNode.next.next) {
        currentNode.next = null;
      } else {
        currentNode = currentNode.next;
      }
    }
    this.tail = currentNode;
    return deletedTail.value;
  }

  public deleteHead(): T {
    if (!this.head) {
      return null;
    }
    const deletedHead = this.head;
    if (this.head.next) {
      this.head = this.head.next;
    } else {
      this.head = null;
      this.tail = null;
    }
    return deletedHead.value;
  }

  public toArray(): T[] {
    const nodes: T[] = [];
    let currentNode = this.head;
    while (currentNode !== null) {
      nodes.push(currentNode.value);
      currentNode = currentNode.next;
    }
    return nodes;
  }

  private createNode(value: T): LinkedListNode<T> {
    return {
      next: null,
      prev: null,
      value,
    };
  }
}
