// services.ts
// Generic REST services for all models

import type {
    User,
    Profile,
    City,
    Province,
    Otp,
    Transaction,
    Wallet,
    WithdrawRequest,
    Chat,
    Message,
    AboutUs,
    Faq,
    Privacy,
    Comment,
    Setting,
} from "~/types/models"

// -------------------- USER --------------------
export const getUser = async (id: string, params: any = {}) => {
    const { result } = await useGet<User>(`/User/${id}`, { params })
    return result
}

export const getUsers = async (params: any = {}) => {
    const { result } = await useGet<User[]>(`/User`, { params })
    return result
}

export const postUser = async (data: Partial<User>) => {
    const { result } = await usePost<User>(`/User`, data)
    return result
}

export const putUser = async (id: string, data: Partial<User>) => {
    const { result } = await usePut<User>(`/User/${id}`, data)
    return result
}

// -------------------- PROFILE --------------------
export const getProfile = async (id: string, params: any = {}) => {
    const { result } = await useGet<Profile>(`/Profile/${id}`, { params })
    return result
}

export const getProfiles = async (params: any = {}) => {
    const { result } = await useGet<Profile[]>(`/Profile`, { params })
    return result
}

export const postProfile = async (data: Partial<Profile>) => {
    const { result } = await usePost<Profile>(`/Profile`, data)
    return result
}

export const putProfile = async (id: string, data: Partial<Profile>) => {
    const { result } = await usePut<Profile>(`/Profile/${id}`, data)
    return result
}

// -------------------- CITY --------------------
export const getCity = async (id: string, params: any = {}) => {
    const { result } = await useGet<City>(`/City/${id}`, { params })
    return result
}

export const getCities = async (params: any = {}) => {
    const { result } = await useGet<City[]>(`/City`, { params })
    return result
}

export const postCity = async (data: Partial<City>) => {
    const { result } = await usePost<City>(`/City`, data)
    return result
}

export const putCity = async (id: string, data: Partial<City>) => {
    const { result } = await usePut<City>(`/City/${id}`, data)
    return result
}

// -------------------- PROVINCE --------------------
export const getProvince = async (id: string, params: any = {}) => {
    const { result } = await useGet<Province>(`/Province/${id}`, { params })
    return result
}

export const getProvinces = async (params: any = {}) => {
    const { result } = await useGet<Province[]>(`/Province`, { params })
    return result
}

export const postProvince = async (data: Partial<Province>) => {
    const { result } = await usePost<Province>(`/Province`, data)
    return result
}

export const putProvince = async (id: string, data: Partial<Province>) => {
    const { result } = await usePut<Province>(`/Province/${id}`, data)
    return result
}

// -------------------- OTP --------------------
export const getOtp = async (id: string, params: any = {}) => {
    const { result } = await useGet<Otp>(`/Otp/${id}`, { params })
    return result
}

export const getOtps = async (params: any = {}) => {
    const { result } = await useGet<Otp[]>(`/Otp`, { params })
    return result
}

export const postOtp = async (data: Partial<Otp>) => {
    const { result } = await usePost<Otp>(`/Otp`, data)
    return result
}

export const putOtp = async (id: string, data: Partial<Otp>) => {
    const { result } = await usePut<Otp>(`/Otp/${id}`, data)
    return result
}

// -------------------- TRANSACTION --------------------
export const getTransaction = async (id: string, params: any = {}) => {
    const { result } = await useGet<Transaction>(`/Transaction/${id}`, { params })
    return result
}

export const getTransactions = async (params: any = {}) => {
    const { result } = await useGet<Transaction[]>(`/Transaction`, { params })
    return result
}

export const postTransaction = async (data: Partial<Transaction>) => {
    const { result } = await usePost<Transaction>(`/Transaction`, data)
    return result
}

export const putTransaction = async (id: string, data: Partial<Transaction>) => {
    const { result } = await usePut<Transaction>(`/Transaction/${id}`, data)
    return result
}

// -------------------- WALLET --------------------
export const getWallet = async (id: string, params: any = {}) => {
    const { result } = await useGet<Wallet>(`/Wallet/${id}`, { params })
    return result
}

export const getWallets = async (params: any = {}) => {
    const { result } = await useGet<Wallet[]>(`/Wallet`, { params })
    return result
}

export const postWallet = async (data: Partial<Wallet>) => {
    const { result } = await usePost<Wallet>(`/Wallet`, data)
    return result
}

export const putWallet = async (id: string, data: Partial<Wallet>) => {
    const { result } = await usePut<Wallet>(`/Wallet/${id}`, data)
    return result
}

// -------------------- WITHDRAW REQUEST --------------------
export const getWithdrawRequest = async (id: string, params: any = {}) => {
    const { result } = await useGet<WithdrawRequest>(`/WithdrawRequest/${id}`, { params })
    return result
}

export const getWithdrawRequests = async (params: any = {}) => {
    const { result } = await useGet<WithdrawRequest[]>(`/WithdrawRequest`, { params })
    return result
}

export const postWithdrawRequest = async (data: Partial<WithdrawRequest>) => {
    const { result } = await usePost<WithdrawRequest>(`/WithdrawRequest`, data)
    return result
}

export const putWithdrawRequest = async (id: string, data: Partial<WithdrawRequest>) => {
    const { result } = await usePut<WithdrawRequest>(`/WithdrawRequest/${id}`, data)
    return result
}

// -------------------- CHAT --------------------
export const getChat = async (id: string, params: any = {}) => {
    const { result } = await useGet<Chat>(`/Chat/${id}`, { params })
    return result
}

export const getChats = async (params: any = {}) => {
    const { result } = await useGet<Chat[]>(`/Chat`, { params })
    return result
}

export const postChat = async (data: Partial<Chat>) => {
    const { result } = await usePost<Chat>(`/Chat`, data)
    return result
}

export const putChat = async (id: string, data: Partial<Chat>) => {
    const { result } = await usePut<Chat>(`/Chat/${id}`, data)
    return result
}

// -------------------- MESSAGE --------------------
export const getMessage = async (id: string, params: any = {}) => {
    const { result } = await useGet<Message>(`/Message/${id}`, { params })
    return result
}

export const getMessages = async (params: any = {}) => {
    const { result } = await useGet<Message[]>(`/Message`, { params })
    return result
}

export const postMessage = async (data: Partial<Message>) => {
    const { result } = await usePost<Message>(`/Message`, data)
    return result
}

export const putMessage = async (id: string, data: Partial<Message>) => {
    const { result } = await usePut<Message>(`/Message/${id}`, data)
    return result
}

// -------------------- ABOUT US --------------------
export const getAboutUs = async (id: string, params: any = {}) => {
    const { result } = await useGet<AboutUs>(`/AboutUs/${id}`, { params })
    return result
}

export const getAboutUsList = async (params: any = {}) => {
    const { result } = await useGet<AboutUs[]>(`/AboutUs`, { params })
    return result
}

export const postAboutUs = async (data: Partial<AboutUs>) => {
    const { result } = await usePost<AboutUs>(`/AboutUs`, data)
    return result
}

export const putAboutUs = async (id: string, data: Partial<AboutUs>) => {
    const { result } = await usePut<AboutUs>(`/AboutUs/${id}`, data)
    return result
}

// -------------------- FAQ --------------------
export const getFaq = async (id: string, params: any = {}) => {
    const { result } = await useGet<Faq>(`/Faq/${id}`, { params })
    return result
}

export const getFaqs = async (params: any = {}) => {
    const { result } = await useGet<Faq[]>(`/Faq`, { params })
    return result
}

export const postFaq = async (data: Partial<Faq>) => {
    const { result } = await usePost<Faq>(`/Faq`, data)
    return result
}

export const putFaq = async (id: string, data: Partial<Faq>) => {
    const { result } = await usePut<Faq>(`/Faq/${id}`, data)
    return result
}

// -------------------- PRIVACY --------------------
export const getPrivacy = async (id: string, params: any = {}) => {
    const { result } = await useGet<Privacy>(`/Privacy/${id}`, { params })
    return result
}

export const getPrivacies = async (params: any = {}) => {
    const { result } = await useGet<Privacy[]>(`/Privacy`, { params })
    return result
}

export const postPrivacy = async (data: Partial<Privacy>) => {
    const { result } = await usePost<Privacy>(`/Privacy`, data)
    return result
}

export const putPrivacy = async (id: string, data: Partial<Privacy>) => {
    const { result } = await usePut<Privacy>(`/Privacy/${id}`, data)
    return result
}

// -------------------- COMMENT --------------------
export const getComment = async (id: string, params: any = {}) => {
    const { result } = await useGet<Comment>(`/Comment/${id}`, { params })
    return result
}

export const getComments = async (params: any = {}) => {
    const { result } = await useGet<Comment[]>(`/Comment`, { params })
    return result
}

export const postComment = async (data: Partial<Comment>) => {
    const { result } = await usePost<Comment>(`/Comment`, data)
    return result
}

export const putComment = async (id: string, data: Partial<Comment>) => {
    const { result } = await usePut<Comment>(`/Comment/${id}`, data)
    return result
}

// -------------------- SETTING --------------------
export const getSetting = async (id: string, params: any = {}) => {
    const { result } = await useGet<Setting>(`/Setting/${id}`, { params })
    return result
}

export const getSettings = async (params: any = {}) => {
    const { result } = await useGet<Setting[]>(`/Setting`, { params })
    return result
}

export const postSetting = async (data: Partial<Setting>) => {
    const { result } = await usePost<Setting>(`/Setting`, data)
    return result
}

export const putSetting = async (id: string, data: Partial<Setting>) => {
    const { result } = await usePut<Setting>(`/Setting/${id}`, data)
    return result
}
