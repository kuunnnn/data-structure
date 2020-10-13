class HeapNode {
  constructor( val ) {
    this.val = val
    this.left = this.right = null
  }
}

class LinkedHeap {
  constructor() {
    this.root = null
  }

  offer( val ) {
    const node = new HeapNode( val )
    if ( this.root === null ) {
      this.root = node
      return
    }
    let head = this.root
  }

  adjust( node, val ) {
    // 先观察 i 的左右节点那个更大

    if ( node.left && node.right ) {
      if ( val > node.left.val && val > node.right.val ) {
        return
      }
    }
    if ( node.left ) {
      if ( val > node.left.val ) {
        return;
      }
      node = node.left
    }
    if ( node.right ) {
      if ( val > node.right.val ) {
        return;
      }
    }
  }
}
