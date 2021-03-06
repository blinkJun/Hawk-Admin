import { Module } from 'vuex'
import { State } from '../index'
import {getAccountRoleDetail} from '../../api/index'
import httpClient from '../../api/http'

interface TokenStoreConfig {
    tokenKey: string,
    userInfoKey: string
}

export interface AccountState {
    isLogin: boolean,
    loginConfig: TokenStoreConfig,
    userInfo: any,
    token: string | null,
    userAuthList:string[]
}


interface LoginStateInfo {
    token: string,
    userInfo: any
}

export const account: Module<AccountState, State> = {
    state: () => ({
        isLogin: false,
        userInfo: null,
        token: null,
        loginConfig: {
            tokenKey: 'hawk-admin-token',
            userInfoKey: 'hawk-admin-token-user'
        },
        userAuthList:[]
    }),
    mutations: {
        setLoginState(state, status: boolean) {
            state.isLogin = status
        },
        updateLocalUserState(state, loginStateInfo: LoginStateInfo) {
            const { token, userInfo } = loginStateInfo
            state.token = token
            state.userInfo = userInfo
            const loginToken = {
                token,
                userInfo: userInfo
            }
            localStorage.setItem(state.loginConfig.tokenKey, JSON.stringify(loginToken))
            httpClient.defaults.headers['Authorization'] = `Bearer ${token}`
            state.isLogin = true
        },
        initLocalUserState(state) {
            const localTokenConfig = localStorage.getItem(state.loginConfig.tokenKey)

            if (localTokenConfig) {
                const loginStateInfo = JSON.parse(localTokenConfig)
                state.token = loginStateInfo.token
                state.userInfo = loginStateInfo.userInfo
                httpClient.defaults.headers['Authorization'] = `Bearer ${state.token}`
                state.isLogin = true
            } else {
                delete httpClient.defaults.headers['Authorization']
                state.isLogin = false
            }
        },
        clearLocalUserState(state) {
            state.isLogin = false
            state.token = null
            state.userInfo = {}

            localStorage.removeItem(state.loginConfig.tokenKey)
            delete httpClient.defaults.headers['Authorization']
        },
        setUserAuthList(state,authList){
            state.userAuthList = authList
        }
    },
    actions:{
        async initUserAuthState(context,payload){
            if(context.state.isLogin){
                try{
                    const authList = await getAccountRoleDetail()
                    context.commit('setUserAuthList',authList)
                }catch(err){
                    context.commit('setUserAuthList',[])
                }
            }
        }
    }
}