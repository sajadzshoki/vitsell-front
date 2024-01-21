// @ts-nocheck
import Moment from 'jalali-moment'

export const logger = (...args: any) => console.log('logger=>>>', ...args)
export const moment = Moment
export const s2n = (string: string | number) => (string + '').replace(/[^\d.]|\.\./ig, '')

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
        if (parseFloat(number) < 1.0e-7) {
            //zero numbers
            return 0
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
    const nuxtApp = useNuxtApp()
    const {t} = useI18n()
    await navigator.clipboard.writeText(string)
    // @ts-ignore
    nuxtApp.$toast.show({type: 'success', message: t('Copied!')})
}
export const mapper = (data: Record<string, any>, map: Record<string, any>, keys: string[] = _keys(map)) => {
    let value: Record<string, any> = {}
    const mapKeys = Object.keys(map)
    for (const key of keys) {
        const v = _get(data, key)
        _set(value, key, v)
    }
    for (const key of mapKeys) {
        // let index = keys.indexOf(key)
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

export const isoToNormal = (time : string)=>{
    return moment(time).locale('fa').format('jDD jMMMM | h A').replace('ب.ظ','عصر').replace('ق.ظ','صبح')
}
export const isoToMonth = (time : string)=>{
    return moment(time).locale('fa').format('jMMMM')
}
export const isoToTime = (time : string)=>{
    return moment(time).locale('fa').format('h A').replace('ب.ظ','عصر').replace('ق.ظ','صبح')
}
export const isoToDate = (time : string)=>{
    return moment(time).locale('fa').format('jYYYY/jMM/jDD')
}
