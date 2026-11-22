export type FileTreeFile<T> = {
  kind: "file"
  name: string
  path: string
  data: T
}

export type FileTreeFolder<T> = {
  kind: "folder"
  name: string
  path: string
  children: FileTreeNode<T>[]
}

export type FileTreeNode<T> = FileTreeFile<T> | FileTreeFolder<T>

export type VisibleItem<T> = {
  node: FileTreeNode<T>
  parentPath: string | undefined
}

const splitPath = (path: string): string[] => path.split("/").filter(Boolean)

export const toTreePath = (path: string): string => `/${splitPath(path).join("/")}`

function sortNodes<T>(nodes: FileTreeNode<T>[]): void {
  nodes.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "folder" ? -1 : 1
    return a.name.localeCompare(b.name)
  })
  for (const node of nodes) {
    if (node.kind === "folder") sortNodes(node.children)
  }
}

export function buildFileTree<T>(
  items: readonly T[],
  getPath: (item: T) => string
): FileTreeNode<T>[] {
  const root: FileTreeFolder<T> = { kind: "folder", name: "", path: "", children: [] }
  const folders = new Map<string, FileTreeFolder<T>>([["", root]])

  for (const item of items) {
    const segments = splitPath(getPath(item))
    const name = segments.at(-1)
    if (name === undefined) continue

    let parent = root
    let current = ""
    for (const segment of segments.slice(0, -1)) {
      current = `${current}/${segment}`
      let folder = folders.get(current)
      if (!folder) {
        folder = { kind: "folder", name: segment, path: current, children: [] }
        folders.set(current, folder)
        parent.children.push(folder)
      }
      parent = folder
    }

    parent.children.push({ kind: "file", name, path: `${current}/${name}`, data: item })
  }

  sortNodes(root.children)
  return root.children
}

export function filterFileTree<T>(
  nodes: readonly FileTreeNode<T>[],
  query: string
): FileTreeNode<T>[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return [...nodes]

  return nodes.flatMap((node): FileTreeNode<T>[] => {
    if (node.kind === "file") {
      return node.path.toLowerCase().includes(needle) ? [node] : []
    }
    const children = filterFileTree(node.children, needle)
    return children.length > 0 ? [{ ...node, children }] : []
  })
}

export function countFiles<T>(nodes: readonly FileTreeNode<T>[]): number {
  return nodes.reduce(
    (total, node) => total + (node.kind === "file" ? 1 : countFiles(node.children)),
    0
  )
}

export function collectFolderPaths<T>(
  nodes: readonly FileTreeNode<T>[],
  maxDepth: number,
  depth = 0
): Set<string> {
  const paths = new Set<string>()
  if (depth >= maxDepth) return paths

  for (const node of nodes) {
    if (node.kind !== "folder") continue
    paths.add(node.path)
    for (const path of collectFolderPaths(node.children, maxDepth, depth + 1)) {
      paths.add(path)
    }
  }
  return paths
}

export function flattenVisible<T>(
  nodes: readonly FileTreeNode<T>[],
  isOpen: (path: string) => boolean,
  parentPath?: string
): VisibleItem<T>[] {
  return nodes.flatMap((node): VisibleItem<T>[] =>
    node.kind === "folder" && isOpen(node.path)
      ? [{ node, parentPath }, ...flattenVisible(node.children, isOpen, node.path)]
      : [{ node, parentPath }]
  )
}
