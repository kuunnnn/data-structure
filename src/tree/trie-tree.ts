// interface Node<T> {
//   isWord: boolean;
//   child: { [k: string]: Node<T> };
//   value: T;
// }
//
// class TrieTree<T> {
//   root: Node<T> = null;
//   public insert(root: Node<T>, str: string, value: T) {
//     const n = str.length;
//     let [node, i] = [root, 0];
//
//     while (i < n) {
//       if (node.child[i] !== null) {
//         node = node.child[str[i]];
//         i = i + 1;
//       } else {
//         break;
//       }
//     }
//   }
// }
