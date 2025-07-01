// @ts-nocheck
import Moment from 'jalali-moment'

export const logger = (...args: any) => console.log('logger=>>>', ...args)
export const moment = Moment
export const s2n = (string: string | number) => (string + '').replace(/[^\d.]|\.\./ig, '')
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const KMapper = (num) => Number(num) > 10e9 ? toLocal(Number(num) / 10e9, 2) + 'T'
    : Number(num) > 10e6 ? toLocal(Number(num) / 10e6, 2) + 'M'
        : Number(num) > 10e3 ? toLocal(Number(num) / 10e3, 2) + 'K'
            : Number(num) + ''

export const p2e = (string: string) => string
    .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())

export const toLocal = (number: number | string, decimal = 8) => {
    //purify number
    number = number + ''
    if (number === '.') {
        if (decimal)
            return '0.'
        else
            return ''
    }

    if (number.startsWith('-'))
        return 0

    if (number.toLowerCase().includes('e')) {
        if (parseFloat(number) < 1.0e-6) {
            //zero numbers
            return parseFloat(number)
        } else if (parseFloat(number) > 1.0e+20) {
            return '∞'
        } else
            number = parseFloat(number) + ''
    }

    number = p2e(number).replace(/[^\d.]|\.{2}|,/ig, '')
    if (number.includes('.')) {
        number = number.split('.')[0] + '.' + (number.split('.')[1] || '')
    }

    if (parseFloat(number)) {
        //separate number
        const int = parseFloat(number.split('.')[0]).toLocaleString('en')
        if (number.includes('.') && decimal) {
            return int + '.' + (number.split('.')[1].slice(0, decimal) || '')
        } else {
            return int
        }
    } else {
        return number
    }

}
export const copyData = async (string: string) => {
    const {$toast} = useNuxtApp()
    await navigator.clipboard.writeText(string)
    $toast.success('Copied :)')
}
export const mapper = (data: Record<string, any>, map: Record<string, any>, keys: string[] = _keys(map)) => {
    let value: Record<string, any> = {}
    const mapKeys = Object.keys(map)
    for (const key of keys) {
        const v = _get(data, key)
        _set(value, key, v)
    }
    for (const key of mapKeys) {
        // let overview = keys.indexOf(key)
        const v = _has(data, key) && _get(map, [key, 'handler'])?.(data[key]) || _get(data, key)
        _set(value, map[key]?.label || key, v)
    }
    return value
}

export function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);  // deg2rad below
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    // Distance in km
    return R * c;
}

export function deg2rad(deg: number) {
    return deg * (Math.PI / 180)
}

export const isoToNormal = (time: string) => {
    return moment(time).locale('fa').format('jDD jMMMM | h A').replace('ب.ظ', 'عصر').replace('ق.ظ', 'صبح')
}
export const isoToMonth = (time: string) => {
    return moment(time).locale('fa').format('jMMMM')
}
export const isoToDateTime = (time: string) => {
    return moment(time).locale('en').format('dd, DD MMM YYYY hh:mm')
}
export const isoToDate = (time: string) => {
    return moment(time).locale('fa').format('YYYY.MM.DD')
}

export const isoToStandard = (time: string) => {
    return moment(time).format('MMM DD,YYYY hh:mmA')
}
export const dataToRange = (data: any[] | undefined): [string, string] => [isoToStandard(data?.[0]?.createdAt), isoToStandard(data?.[data?.length - 1]?.createdAt)]

export const subIsoDate = (du: string): string => moment().subtract(du.split(' ')[0] as DurationInputArg1, du.split(' ')[1] as DurationInputArg2).toISOString()

export const isExpire = (time) => moment(time).isBefore(moment())

export const remainToExpire = (timestamp,time: String) => {
    const diff = Math.round(moment(time).diff(moment(timestamp)) / 1000)
    const day = Math.floor(diff / (24 * 3600))
    const hour = Math.floor(diff % (24 * 3600) / 3600)
    const minute = Math.round(diff % 3600 / 60)
    const second = Math.round((diff % 3600) % 60)
    return [`${day}d`, `${hour}h`, `${minute}m`, `${second}s`]
}

export const useSocketIo = () => {
    const socket = io(BASE_URL, {
        extraHeaders: {
            authorization: useCookie('token').value || '',
            'app-code': APP_CODE
        },
        autoConnect: false
    });
    onBeforeUnmount(() => {
        socket.disconnect()
    })
    return socket
}
export const watchSocket = (socket, joinObject: SocketJoinObject, dataHandler, loading = ref(false), initHandler = async () => {
}) => {
    console.log(`watch on => ${joinObject.model}.${joinObject.coll}: ${joinObject.value}`)
    socket.on('connect', async () => {
        await initHandler?.()
        console.log('connect/reconnect', Date.now(), `${joinObject.model}.${joinObject.coll}: ${joinObject.value}`)
        await socket.emitWithAck('join', joinObject)
        loading.value = false
    })
    socket.on('data', dataHandler)
    socket.connect()
}

export const lastAct = (time: string) => {
    const {t} = useI18n()
    const diff = computed(() => Math.round(moment().diff(moment(time)) / 1000))
    const day = Math.floor(diff.value / 86400)
    const hour = Math.floor(diff.value / 3600)
    const minute = Math.round(diff.value / 60)

    if (day < 8) {
        if (hour < 24) {
            if (minute < 60)
                return minute + ' ' + t('min ago')
            else return hour + ' ' + t('h ago')
        } else return day + ' ' + t('d ago')
    } else return isoToDate(time)
}

export const setMeta = (data: MetaData) => {
    const metaData = useState<MetaData>('meta-data')
    metaData.value = data
}

export const encrypt = (text, passphrase) => {
    return AES.encrypt(text, passphrase).toString();
}

export const decrypt = (ciphertext, passphrase) => {
    const bytes = AES.decrypt(ciphertext, passphrase);
    try {
        return bytes.toString(enc);
    } catch (e) {
        return ''
    }

}

export const useWallets = async (isActive: Boolean | undefined = undefined): Promise<RemovableRef<Wallet[]>> => {
    const userId = useCookie('userId')
    const wallet = useLocalStorage<Wallet[]>('wallet', [])
    const {result} = await useGet('/wallet', {
        params: {
            "userId:eq": userId.value,
            "with-coin.with-gateways.active": true,
            "with-coin.with-gateways.with-gateway": true,
            "isActive:eq": isActive
        }
    })
    wallet.value = result
    if (!result?.length) {
        const {result: coins} = await useGet('/coin', {params: {"walletable:eq": true}})
        const wallets = coins?.map((e) => ({
            balance: 0,
            coinId: e.id,
            userId: userId.value,
        }))
        await usePost('/wallet', wallets)
        const {result} = await useGet<Wallet[]>('/wallet', {
            params: {
                "userId:eq": userId.value,
                "with-coin.with-gateways.active": true,
                "with-coin.with-gateways.with-gateway": true,
                "isActive:eq": isActive
            }
        })
        wallet.value = result || []
    }

    return wallet
}
export const getCommentsAvg = (comments:any[])=>{
    const scores =  comments?.map(e=>e.number)
    const sum = scores?.reduce((sum,accumolator)=>sum + accumolator,0) || 0
    const average = comments?.length > 0 ? sum / scores.length : 0
    return average.toFixed(1)
}

export const truncateText = (text: string, maxLength: number = 50) => {
    return text?.length > maxLength ? text?.slice(0, maxLength) + '...' : text;
};