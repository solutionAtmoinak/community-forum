'use client';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import { IoArrowBack } from "react-icons/io5";


const PageBack = (props: Props) => {

    const router = useRouter();

    return (
        <button onClick={() => router.back()} >
            {!!props.children ?
                <>{props.children}</> :
                <div className='flex gap-x-2 items-center bg-slate-300 px-4 py-2 rounded shadow text-slate-800 font-bold cursor-pointer w-fit h-fit'>
                    <IoArrowBack />
                    Back
                </div>}
        </button>
    )
}

interface Props {
    children?: ReactNode
}

export default PageBack