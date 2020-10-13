// B+Tree

interface Node<T> {
  isLeaf: boolean;
  parent: Node<T>;
  left: Node<T>;
  right: Node<T>;
  ptr: Array<MetaData<T>>;
}

interface MetaData<T> {
  key: number;
  value: T;
  children: Node<T>;
}

// B+Tree
export class BPlusTree<T> {
  // key 的数目
  public count = 0;
  // tree 的阶 即一个节点最多存储 rank-1 个元素
  public readonly rank: number;
  // root 节点
  protected root: Node<T> = null;
  // 每个节点最少需要的节点 节点拆分就从这个 index 拆分, Math.floor(rank/2)
  private readonly minKeySize: number;

  /**
   * 构造函数
   * @param rank Tree 的阶
   */
  public constructor(rank: number) {
    this.rank = rank;
    this.minKeySize = Math.floor(rank / 2);
  }

  /**
   * 清空 Tree
   */
  public clear(): void {
    this.count = 0;
    this.root = null;
  }

  /**
   * 修改某一个 key 的值
   * @param key
   * @param value
   */
  public modify(key: number, value: T): boolean {
    if (this.root === null) {
      return false;
    }
    const leaf = this.downLeafNode(key);
    const index = this.findIndexE(leaf, key);
    if (index === -1) {
      return false;
    }
    leaf.ptr[index].value = value;
    return true;
  }

  /**
   * 返回指定的 key 对应的 value
   * @param key
   */
  public find(key: number): [T, boolean] {
    if (this.root === null) return [null, false];
    const leaf = this.downLeafNode(key);
    const index = this.findIndexE(leaf, key);
    if (index === -1) {
      return [null, false];
    }
    return [leaf.ptr[index].value, true];
  }

  /**
   * 范围查询 value
   * @param min
   * @param max
   */
  public findRange(min: number, max: number): T[] {
    if (this.root === null) return [];
    const result: T[] = [];
    let leaf = this.downLeafNode(min);
    while (leaf !== null) {
      for (const ptr of leaf.ptr) {
        if (ptr.key >= min && ptr.key <= max) {
          result.push(ptr.value);
        }
        if (ptr.key >= max) {
          return result;
        }
      }
      leaf = leaf.right;
    }
    return result;
  }

  /**
   * 遍历叶子节点 默认从左到右
   * @param direction
   * @param fn
   */
  public forEach(fn: (k: number, value: T) => boolean, direction = true): void {
    if (this.root === null) return;
    if (direction) {
      this.forEachByLeft(fn);
    } else {
      this.forEachByRight(fn);
    }
  }

  /**
   * 插入数据
   * @param key
   * @param value
   */
  public insert(key: number, value: T): void {
    if (this.root == null) {
      const leaf = this.createNode();
      leaf.ptr.push(this.createLeafMete(key, value));
      this.root = leaf;
      this.count = 1;
      return;
    }
    const leaf = this.downLeafNode(key);
    if (this.findIndexE(leaf, key) !== -1) {
      throw new Error(`key [${key}] is exist`);
    }
    const len = leaf.ptr.length;
    const index = this.findInsertIndex(leaf, key);
    const oldMaxKey = leaf.ptr[len - 1];
    this.insetMeta(leaf, index, this.createLeafMete(key, value));
    if (len + 1 < this.rank) {
      const nowMaxKey = leaf.ptr[len].key;
      if (oldMaxKey.key != nowMaxKey && leaf.parent !== null) {
        this.modifyBranchNodeMete(leaf, oldMaxKey.key, nowMaxKey);
      }
      this.count++;
      return;
    }
    this.insetBranch(leaf, oldMaxKey);
    this.count++;
  }

  /**
   * Tree 是否存在指定的 key
   * @param key
   */
  public has(key: number): boolean {
    if (this.root === null) return false;
    const leaf = this.downLeafNode(key);
    const index = this.findIndexE(leaf, key);
    return index !== -1;
  }

  /**
   * 删除指定的key
   * @param key
   */
  public delete(key: number): boolean {
    if (this.root === null) return false;
    const leaf = this.downLeafNode(key);
    const index = this.findIndexE(leaf, key);
    if (index === -1) {
      return false;
    }
    this.remove(leaf, key);
  }

  /**
   * 递归删除
   * @param node
   * @param key
   * @description
   * 先判断删除的key 是否为节点中最大的,如果是则将上面的节点对应的 key 修改为次大的
   * 删除后是否可以维持Tree结构
   * 判断左右节点是否可以拆借 key
   * 合并节点
   * @todo 如果需要合并节点的话, 会有两次递归向上修改 parent 节点 key 的情况
   */
  private remove(node: Node<T>, key: number): void {
    const oldMaxKey = node.ptr[node.ptr.length - 1];
    const index = this.findIndexE(node, key);
    node.ptr.splice(index, 1);

    if (key === oldMaxKey.key) {
      this.modifyBranchNodeMete(node, oldMaxKey.key, node.ptr[index - 1].key);
    }

    // 结构能够保持
    if (node.ptr.length >= this.minKeySize) {
      return;
    }

    if (node.right !== null && node.left !== null) {
      if (node.right.ptr.length > this.minKeySize) {
        this.leftSpin(node, node.right);
        return;
      }
      if (node.left.ptr.length > this.minKeySize) {
        this.rightSpin(node.left, node);
        return;
      }
      this.merge(node, node.right);
      return;
    }
    if (node.right !== null) {
      if (node.right.ptr.length > this.minKeySize) {
        this.leftSpin(node, node.right);
        return;
      }
      this.merge(node, node.right);
      return;
    }
    if (node.left !== null) {
      if (node.left.ptr.length > this.minKeySize) {
        this.rightSpin(node.left, node);
        return;
      }
      this.merge(node.left, node);
      return;
    }
  }

  /**
   * 右旋
   * TODO: 到底应该借 1 个还是多个节点过来呢?
   * @param left
   * @param right
   * @description left 从 minKeySize 处截断 left 保留 minKeySize 个 key 其他 key 移动到右边
   */
  private rightSpin(left: Node<T>, right: Node<T>): void {
    const oldMaxKey = left.ptr[left.ptr.length - 1];
    const t = left.ptr.slice(this.minKeySize);
    left.ptr = left.ptr.slice(0, this.minKeySize);
    this.modifyBranchNodeMete(
      left,
      oldMaxKey.key,
      left.ptr[this.minKeySize - 1].key
    );

    if (!right.isLeaf) {
      for (const ptr of t) {
        ptr.children.parent = right;
      }
    }
    right.ptr = t.concat(right.ptr);
  }

  /**
   * 左旋
   * TODO: 到底应该借 1 个还是多个节点过来呢?
   * @param left
   * @param right
   */
  private leftSpin(left: Node<T>, right: Node<T>): void {
    const oldMaxKey = left.ptr[left.ptr.length - 1];
    const mid = right.ptr.length - this.minKeySize;
    const t = right.ptr.slice(0, mid);
    if (!left.isLeaf) {
      for (const ptr of t) {
        ptr.children.parent = left;
      }
    }
    right.ptr = right.ptr.slice(mid);
    left.ptr = left.ptr.concat(t);
    this.modifyBranchNodeMete(left, oldMaxKey.key, t[t.length - 1].key);
  }

  /**
   * 合并左右节点
   * @param left
   * @param right
   */
  private merge(left: Node<T>, right: Node<T>): void {
    const lMax = left.ptr[left.ptr.length - 1];
    if (!left.isLeaf) {
      for (const ptr of left.ptr) {
        ptr.children.parent = right;
      }
    }
    right.ptr = left.ptr.concat(right.ptr);
    right.left = left.left;
    // 如果 right 的 parent 和 left 的 parent 不是同一个怎么办
    this.remove(left.parent, lMax.key);
    if (left.parent.parent === null && left.parent.ptr.length == 1) {
      this.root = right;
      this.root.parent = null;
      this.count = right.ptr.length;
    }
  }

  /**
   * 递归处理插入导致的节点分裂
   * @param node
   * @param preMax
   */
  private insetBranch(node: Node<T>, preMax: MetaData<T>): void {
    // 尝试不分裂
    if (node.left !== null && node.left.ptr.length + 1 < this.rank) {
      const left = node.left;
      const lMax = left.ptr[left.ptr.length - 1];
      const rMax = node.ptr[node.ptr.length - 1];
      const m = node.ptr[0];
      if (!node.isLeaf) {
        m.children.parent = left;
      }
      left.ptr.push(m);
      node.ptr = node.ptr.slice(1);
      this.modifyBranchNodeMete(left, lMax.key, m.key);
      // 如果插入的是节点中最大的 key
      if (preMax.key != rMax.key) {
        this.modifyBranchNodeMete(node, preMax.key, rMax.key);
      }
      return;
    }
    // 尝试不分裂
    if (node.right !== null && node.right.ptr.length + 1 < this.rank) {
      const right = node.right;
      const ll = node.ptr.length - 1;
      const lMax = node.ptr[ll];
      node.ptr = node.ptr.slice(0, ll);
      if (!node.isLeaf) {
        lMax.children.parent = right;
      }
      right.ptr.unshift(lMax);
      // 因为右移的话 left 的 max 是一定改变的, 但是 right 节点可以不用管
      this.modifyBranchNodeMete(node, lMax.key, node.ptr[ll - 1].key);
      return;
    }

    const rightNode = this.spliceNode(node);

    if (node.parent === null) {
      const root = this.createNode();
      root.isLeaf = false;
      node.parent = root;
      rightNode.parent = root;
      const min = this.createBranchMete(
        node.ptr[node.ptr.length - 1].key,
        node
      );
      const max = this.createBranchMete(
        rightNode.ptr[rightNode.ptr.length - 1].key,
        rightNode
      );
      root.ptr = [min, max];
      this.root = root;
      return;
    }
    const ll = node.ptr.length;
    const rl = rightNode.ptr.length;
    const parent = node.parent;
    const pl = parent.ptr.length;
    let preParentMax = node.parent.ptr[pl - 1];
    const i = this.findIndexE(parent, preMax.key);
    this.insetMeta(
      parent,
      i,
      this.createBranchMete(node.ptr[ll - 1].key, node)
    );
    // parent 的 max key 是否发生改变 就需要递归的上面的 key 修改并且将 preParentMax 改为 nextParentKey
    // 没有改变直接修改对应的 children 的指针就可以
    const nextMax = rightNode.ptr[rl - 1];

    const pi = this.findIndexE(parent, preMax.key);
    parent.ptr[pi].children = rightNode;
    // 当前节点的最大 key 是否被修改了
    if (preMax.key !== nextMax.key) {
      this.modifyBranchNodeMete(node, preMax.key, nextMax.key);
      parent.ptr[pi].key = nextMax.key;
      preParentMax = nextMax;
    }

    if (parent.ptr.length >= this.rank) {
      this.insetBranch(parent, preParentMax);
    }
  }

  /**
   * 将节点分割成左右两个节点
   * @param left
   */
  private spliceNode(left: Node<T>): Node<T> {
    const lks = left.ptr.slice(0, this.minKeySize);
    const rks = left.ptr.slice(this.minKeySize);
    const right = this.createNode();
    right.ptr = rks;
    left.ptr = lks;
    if (left.right !== null) {
      const t = left.right;
      right.right = t;
      t.left = right;
    } else {
      right.right = null;
    }
    right.left = left;
    left.right = right;
    // 这里 node 有可能是叶子也可能不是
    right.isLeaf = left.isLeaf;
    right.parent = left.parent;
    if (!left.isLeaf) {
      for (const k of rks) {
        k.children.parent = right;
      }
    }
    return right;
  }

  /**
   * 下沉到叶子节点
   * @param key
   */
  private downLeafNode(key: number): Node<T> {
    let node = this.root;
    while (node !== null) {
      if (node.isLeaf) {
        return node;
      }
      const i = this.findIndexLte(node, key);
      const item = node.ptr[i];
      node = item.children;
    }
  }

  /**
   * 返回最左边的叶子节点   也就是链表的 start
   */
  private dowLeftLeafNode(): Node<T> {
    let node = this.root;
    while (node !== null) {
      if (node.isLeaf) {
        return node;
      }
      const item = node.ptr[0];
      node = item.children;
    }
    // 表示Tree是空的
    return this.root;
  }

  /**
   * 返回最右边的叶子节点   也就是链表的 end
   */
  private downRightLeafNode(): Node<T> {
    let node = this.root;
    while (node !== null) {
      if (node.isLeaf) {
        return node;
      }
      const item = node.ptr[node.ptr.length - 1];
      node = item.children;
    }
    // 表示Tree是空的
    return this.root;
  }

  /**
   * 在节点中插入 key ,value, children信息
   * @param node
   * @param i
   * @param m
   */
  private insetMeta(node: Node<T>, i: number, m: MetaData<T>): void {
    node.ptr.splice(i, 0, m);
  }
  /**
   * 从左到右遍历叶子节点
   * @param fn
   */
  private forEachByLeft(fn: (k: number, value: T) => boolean): void {
    let leaf = this.dowLeftLeafNode();
    let bool = false;
    while (leaf !== null) {
      for (const ptr of leaf.ptr) {
        bool = fn(ptr.key, ptr.value);
        if (bool) {
          return;
        }
      }
      leaf = leaf.right;
    }
  }

  /**
   * 从右到左遍历叶子节点
   * @param fn
   */
  private forEachByRight(fn: (k: number, value: T) => boolean): void {
    let leaf = this.downRightLeafNode();
    let bool = false;
    while (leaf !== null) {
      let len = leaf.ptr.length - 1;
      while (len >= 0) {
        const { key, value } = leaf.ptr[len];
        bool = fn(key, value);
        if (bool) {
          return;
        }
        len--;
      }
      leaf = leaf.left;
    }
  }
  /**
   * 创建一个叶子节点对应的 Meta 对象
   * @param k
   * @param v
   */
  private createLeafMete(k: number, v: T): MetaData<T> {
    return {
      key: k,
      value: v,
      children: null,
    };
  }

  /**
   * 创建一个叶子节点对应的 Meta 对象
   * @param k
   * @param children
   */
  private createBranchMete(k: number, children: Node<T>): MetaData<T> {
    return {
      key: k,
      value: null,
      children: children,
    };
  }

  /**
   * 查找一个 key 对应在 branch 节点中的 children 位置
   * @param node
   * @param key
   */
  protected findIndexLte(node: Node<T>, key: number): number {
    let idx = 0;
    for (const l = node.ptr.length; idx < l; idx++) {
      if (key <= node.ptr[idx].key) {
        return idx;
      }
    }
    // 这个 index 是用来查询对应的 children 的 如果 idx == len 就会有问题
    // 这里在数组只有一项的时候 idx==1 -1 后成 0 正好
    return idx - 1;
  }

  /**
   * 在节点中找到一个可以插入的位置
   * @param node
   * @param key
   */
  private findInsertIndex(node: Node<T>, key: number): number {
    let idx = 0;
    for (const l = node.ptr.length; idx < l; idx++) {
      if (key <= node.ptr[idx].key) {
        return idx;
      }
    }
    // 这个 index 如果 idx == len splice 也是支持的
    return idx;
  }

  /**
   * 找到一个已有的 key 在节点中对应的位置
   * @param node
   * @param key
   */
  private findIndexE(node: Node<T>, key: number): number {
    for (let i = 0, len = node.ptr.length; i < len; i++) {
      const item = node.ptr[i];
      if (item.key === key) {
        return i;
      }
    }
    return -1;
  }

  /**
   * 修改Branch 节点的 Mete 对象
   * @param node
   * @param k
   * @param nk
   */
  private modifyBranchNodeMete(node: Node<T>, k: number, nk: number): void {
    let p = node.parent;
    while (p !== null) {
      const pl = p.ptr.length;
      const i = this.findIndexE(p, k);
      p.ptr[i].key = nk;
      if (i !== pl - 1) {
        break;
      }
      p = p.parent;
    }
    return;
  }

  /**
   * 创建一个节点, 默认是叶子节点
   */
  private createNode(): Node<T> {
    return {
      isLeaf: true,
      parent: null,
      left: null,
      right: null,
      ptr: [],
    };
  }
}

interface TreeNodeJSON<T> {
  id: number;
  meta: TreeNodeMetaJSON<T>[];
}
interface TreeNodeMetaJSON<T> {
  key: number;
  value: T;
  children: number;
}
interface TreeJSON<T> {
  root: TreeNodeJSON<T>;
  rank: number;
  count: number;
  level: TreeNodeJSON<T>[][];
}

/**
 * 带有一些调试方法的B+Tree
 */
export class BPlusTreeTool<T> extends BPlusTree<T> {
  public testInset(k: number[]): void {
    try {
      for (const v of k) {
        this.insert(v, (v as unknown) as T);
      }
    } catch (e) {
      console.log(k);
    }
  }

  /**
   * 输出 Tree 的结构
   */
  public print(): string[] {
    if (!this.root) {
      return [];
    }
    const ks = this.outputLevelInfo();
    const leafSize = ks[ks.length - 1].reduce((s, c) => (s += c.length), 0);
    const out: string[] = [];
    for (const item of ks) {
      const v = item.map(j => j.map(l => l.key));
      const s = item.reduce((s, c) => (s += c.length), 0);
      const p = Math.floor((leafSize * 2 - s) / (item.length + 1));
      out.push(BPlusTreeTool.paddingGap(v, p));
    }
    return out;
  }

  /**
   * 打印 find 一个 key 经过了几次跳转
   * @param key
   */
  public findPerf(key: number): number {
    let jumpNum = 0;
    let node = this.root;
    while (node !== null) {
      if (node.isLeaf) {
        return jumpNum;
      }
      const i = this.findIndexLte(node, key);
      const item = node.ptr[i];
      node = item.children;
      jumpNum++;
    }
    return jumpNum;
  }

  /**
   * 打印叶子节点的结构
   */
  public printLeaf(): string {
    const ks = this.outputLevelInfo();
    const item = ks[ks.length - 1];
    const leafSize = item.reduce((s, c) => (s += c.length), 0);
    const v = item.map(j => j.map(l => l.key));
    const s = item.reduce((s, c) => (s += c.length), 0);
    const p = Math.floor((leafSize * 2 - s) / (item.length + 1));
    return BPlusTreeTool.paddingGap(v, p);
  }

  /**
   * 输出叶子节点的的 key
   */
  public OutputLeafKey(): number[][] {
    const ks = this.outputLevelInfo();
    const item = ks[ks.length - 1];
    return item.map(v => v.map(j => j.key));
  }

  public toJSON(): TreeJSON<T> | {} {
    if (this.root === null) {
      return {};
    }
    const tree: TreeJSON<T> = {
      root: {
        id: 0,
        meta: [],
      },
      count: this.count,
      rank: this.rank,
      level: [],
    };
    const rc = [];
    for (const item of this.root.ptr) {
      rc.push({
        key: item.key,
        value: item.value,
        children: item.children.ptr[item.children.ptr.length - 1].key,
      });
    }
    tree.root.meta = rc;
    tree.root.id = rc[rc.length - 1].key;

    for (const item of this.outputLevelInfo()) {
      const m: TreeNodeJSON<T>[] = [];
      for (const i of item) {
        const nc = [];
        for (const v of i) {
          const val: TreeNodeMetaJSON<T> = {
            key: v.key,
            value: v.value,
            children: null,
          };
          if (v.children) {
            val.children = v.children.ptr[v.children.ptr.length - 1].key;
          }
          nc.push(val);
        }
        m.push({
          id: i[i.length - 1].key,
          meta: nc,
        });
      }
      tree.level.push(m);
    }

    return tree;
  }

  /**
   * 填充 * 号
   * @param list
   * @param size
   */
  private static paddingGap(list: number[][], size: number): string {
    const s = new Array(size).fill('*');
    const n: string | number[] = [...s];
    for (const item of list) {
      n.push(...item, ...s);
    }
    return n.join(' ');
  }

  /**
   * 输出 Tree 的层级信息
   */
  public outputLevelInfo(): MetaData<T>[][][] {
    const list: Node<T>[] = [this.root];
    const ks: MetaData<T>[][][] = [];
    while (list.length !== 0) {
      const k: MetaData<T>[][] = [];
      const next: Node<T>[] = [];
      for (const item of list) {
        k.push(item.ptr);
        if (!item.isLeaf) {
          next.push(...item.ptr.map(v => v.children));
        }
      }
      list.length = 0;
      list.push(...next);
      ks.push(k);
    }
    return ks;
  }
}
