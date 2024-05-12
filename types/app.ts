export type SocketData = { method: string; data: Record<string, any> }
export type SocketJoinObject = {
    model: string,
    coll: string | null,
    value: string | null
}
export type MetaData = {
    title?: string
    className?: string
    headerHidden?: boolean
    linkName?: string
}
