class ArrayHeap<T = number> {
  heap: T[] = []

  contain ( val: T ): boolean {
    return this.heap.includes( val )
  }

  poll (): T | null {
    const high = this.heap.length;
    if ( high === 0 ) return null
    if ( high === 1 ) return this.heap.pop() as T
    this.swap( 0, high - 1 )
    const result = this.heap.pop() as T
    this.adjust( 0, high )
    return result
  }

  offer ( val: T ) {
    this.heap.push( val )
    const length = this.heap.length
    for ( let i = Math.floor( length / 2 ); i > 0; i-- ) {
      this.adjust( i, length )
    }
  }

  remove ( val: T ) {
  }

  peek (): T | null {
    return this.heap.length > 0 ? this.heap[ 0 ] : null
  }

  isEmpty (): boolean {
    return this.heap.length === 0
  }

  size () {
    return this.heap.length
  }

  clear () {
    this.heap.length = 0
  }

  private siftUp () {
    const length = this.heap.length
    for ( let i = Math.floor( length / 2 ); i > 0; i-- ) {
      this.adjust( i, length )
    }
  }

  private adjust ( i: number, high: number ) {
    const temp = this.heap[ i ];
    // i 是顶点
    for ( let k = 2 * i + 1; k <= high; k = 2 * k + 1 ) {
      // 先观察 i 的左右节点那个更大
      if ( k + 1 < high && this.heap[ k ] < this.heap[ k + 1 ] ) {
        k += 1
      }
      // 如果顶点比最大的左右节点还大就停止
      if ( temp >= this.heap[ k ] ) {
        break;
      }
      // 将子节点的值移动到顶点上
      this.heap[ i ] = this.heap[ k ]
      i = k
    }
    this.heap[ i ] = temp;
  }

  private swap ( i: number, j: number ) {
    const temp = this.heap[ i ]
    this.heap[ i ] = this.heap[ j ]
    this.heap[ j ] = temp
  }
}

class PriorityQueue {

}
