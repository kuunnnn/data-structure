enum Color {
  red,
  black,
}

interface TreeNode {
  parent: TreeNode;
  color: Color;
  left: TreeNode;
  right: TreeNode;
  value: number;
}

function RedBlackTreeNode(data: number): TreeNode {
  return {
    parent: null,
    color: Color.red,
    left: null,
    right: null,
    value: data,
  };
}

class RedBlackTree {
  private root: TreeNode;

  private static checkAndAdjust(node: TreeNode) {
    const parent = node.parent;
    // 如果只有两层那么结构必然是好的
    if (parent.parent === null) {
      return;
    }
    if (node.color === Color.red && parent.color === Color.red) {
      // 这里 grandpa 是必定存在的
      const grandpa = parent.parent;
      // 父节点的兄弟节点是否为红色
      if (
        grandpa.left &&
        grandpa.left.color === Color.red &&
        (grandpa.right && grandpa.right.color === Color.red)
      ) {
        grandpa.left.color = Color.black;
        grandpa.right.color = Color.black;
        return;
      }
      // 如果父节点是右节点 那么需要左旋
      if (grandpa.value < parent.value) {
        grandpa.right = node;
        parent.right = node.left;
        node.left = parent;
      } else {
        // 右旋
        parent.color = Color.black;
        grandpa.color = Color.red;
        grandpa.parent.left = parent;
        grandpa.left = parent.right;
        parent.right = grandpa;
      }
    }
  }

  insert(data: number) {
    const nNode = RedBlackTreeNode(data);
    if (this.root === null) {
      nNode.color = Color.black;
      this.root = nNode;
      return;
    }
    let node = this.root;
    while (node !== null) {
      if (node.value > data) {
        if (node.left === null) {
          node.left = nNode;
          break;
        }
        node = node.left;
        continue;
      }
      if (node.right === null) {
        node.right = nNode;
        break;
      }
      node = node.right;
    }
    nNode.parent = node;
    RedBlackTree.checkAndAdjust(node);
  }

  // todo
  delete(data: number) {
    let node = this.root;
    while (node !== null) {
      if (node.value === data) {
        break;
      }
      node = node.value > data ? node.left : node.right;
    }
    // 没有找到
    if (node === null) {
      return;
    }
  }
  // todo
  modify(data: number, value: number) {}
}
