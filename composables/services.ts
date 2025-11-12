// get

import type {
    Profile,
    User,
    Wallet,
    Transaction,
} from "~/types/models"

// get -------------------------------------------
export const getUser = async (id: string,params: {}) => {
    const {result} = await useGet<User>(`/User/${id}`, {params})
    return result || ''
}
export const getUsers = async (params: {}) => {
    const {result} = await useGet<User[]>(`/User`, {params})
    return result || []
}
export async function getTransactions(params: {}) {
const { result } = await useGet<Transaction[]>(`/Transaction`, { params })
return result || []
}
export const getTransaction = async ( id: string,params: {},) => {
    const {result} = await useGet<Transaction>(`/Transaction/${id}`, {params})
    return result || ''
}
// post -------------------------------------------
export const postTransaction = async (data: Partial<Transaction>) => {
    const {result} = await usePost(`/Transaction`, data)
    return result
}
export const postProfile = async (data: Partial<Profile>) => {
    const {result} = await usePost(`/profile`, data)
    return result
}
// put------------------------------------------------------------
export const putUser = async (data: Partial<User>, id: string) => {
    const {result} = await usePut(`/User/${id}`, data)
    return result
}
export const putWallet = async (data: Partial<Wallet>, id: string) => {
    const {result} = await usePut(`/Wallet/${id}`, data)
    return result
}
export const putProfile = async (data: Partial<Profile>, id: string) => {
    const {result} = await usePut(`/profile/${id}`, data)
    return result
}
