import ServerApi from "@/api/Server";
import CommunityList from "@/components/page/forum/CommunityList";
import ApiResponse from "@/interface/common/ApiResponse";
import { TblCommunity } from "@/interface/database";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

type Props = { params: Promise<{ userId: string }> };


export default async function Page({ params }: Props) {

  const { userId } = await params;
  const cookieStore = await cookies()

  const tokenCookie = cookieStore.get('token');
  const fcCookie = cookieStore.get('fc');

  let communityList: TblCommunity[] = []


  if (!!tokenCookie) {
    const server = new ServerApi({ spName: "spCommunityForumWebsite", mode: 7, withAuth: true, token: tokenCookie.value });
    const json: ApiResponse = await server.request({
      CommunityUserId: userId,
    });
    if (json.isSuccess) {
      const result = JSON.parse(json?.result)
      communityList = result ?? []
    } else {
      redirect('/')
    }
  } else {
    const server = new ServerApi({ spName: "spCommunityForumAnonymous", mode: 1 });
    const json: ApiResponse = await server.request({
      CommunityUserId: userId,
      FcCode: fcCookie?.value
    });
    if (json.isSuccess) {
      const result = JSON.parse(json?.result)
      communityList = result ?? []
    } else {
      redirect('/')
    }
  }

  return (
    <div className="m-4 p-2">
      <Suspense
        fallback={
          <div className="text-center py-4 text-gray-600">
            Loading forum...
          </div>
        }
      >
        <CommunityList communityList={communityList} userId={userId} />
      </Suspense>
    </div>
  );
}
