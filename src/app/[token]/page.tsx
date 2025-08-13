'use client'

import { ServerApi } from '@/api';
import AuthApi from '@/api/AuthApi';
import { useCookie } from '@/helper/useCookie';
import userModel from '@/interface/database/userModel';
import { jwtDecode } from 'jwt-decode';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { validate as uuidValidate } from 'uuid';

const isValidJWT = (token: string): boolean => {
    try {
        // JWT has 3 parts separated by dots
        const parts = token.split('.');
        if (parts.length !== 3) return false;
        // Check if each part is valid base64
        parts.forEach(part => {
            // Add padding if needed
            const padded = part + '='.repeat((4 - part.length % 4) % 4);
            atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
        });
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
};

const isValidUUID = (token: string): boolean => {
    return uuidValidate(token);
};

const authApi = new AuthApi()

const Page = () => {
    const router = useRouter();
    const params = useParams();
    const searchParam = useSearchParams()
    const fc = searchParam.get('fc');

    const fcCookie = useCookie('fc');
    const tokenCookie = useCookie('token');

    useEffect(() => {
        if (fc !== null) {
            fcCookie.set(fc, { path: '/', sameSite: 'strict', });
        }
    }, [fc, fcCookie])

    const getFcCode = useCallback(async (jwt: string) => {
        const user: userModel = jwtDecode(jwt)
        tokenCookie.set(jwt, { sameSite: 'strict', expires: new Date(user.exp * 1000) });
        const fcCodeApi = new ServerApi({ spName: "spCommunityForumWebsite", mode: 8, withAuth: true, token: jwt });
        const fcCodeResponse = await fcCodeApi.request();
        if (fcCodeResponse.isSuccess) {
            const json = JSON.parse(fcCodeResponse.result);
            if (json[0]) {
                fcCookie.set(json[0].FcCode, { sameSite: 'strict', expires: new Date(user?.exp * 1000) });
            }
        }
    }, [fcCookie, tokenCookie]);


    useEffect(() => {
        const token = params.token as string;

        if (!token) {
            router.replace('/');
            return;
        }

        // Check if token is a valid UUID
        if (isValidUUID(token)) {
            router.replace(`/forum/${token}`);
            return;
        } else if (isValidJWT(token)) {
            // Check if token is a valid JWT
            authApi.validateToken(token)
                .then(async (res) => {
                    if (res.isSuccess) {
                        localStorage.setItem('token', token);
                        const user: userModel = jwtDecode(token)
                        await getFcCode(token);
                        router.replace(`/forum/${user.nameid}`);
                    } else {
                        router.replace('/');
                    }
                })
                .catch(() => {
                    router.replace('/');
                });
            return;
        } else if (token === 'forum') {
            const jwt = localStorage.getItem('token')
            if (jwt) {
                const user: userModel = jwtDecode(jwt)
                router.replace(`/forum/${user.nameid}`)
            } else {
                router.replace('/')
            }
        } else {
            // If token is neither valid UUID nor JWT, redirect to login
            router.replace('/');
        }
    }, [params.token, router, getFcCode]);

    return (
        <div className="flex items-center justify-center my-auto p-4">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Validating...</p>
            </div>
        </div>
    )
}


export default Page