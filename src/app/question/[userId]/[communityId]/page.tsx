import ServerApi from "@/api/Server";
import QuestionPage from "@/components/page/question/QuestionPage";
import Pagination from "@/interface/common/Pagination";
import { cookies } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Suspense } from "react";

type Props = {
  params: Promise<{ userId: string; communityId: number }>;
};

const communityApi = new ServerApi({ spName: "spCommunityForumAnonymous", mode: 3, });
const questionApi = new ServerApi({ spName: "spCommunityForumAnonymous", mode: 2, });
const userApi = new ServerApi({ spName: "spCommunityForumAnonymous", mode: 8, });
const verifyUserApi = new ServerApi({ spName: "spCommunityForumAnonymous", mode: 9 });


async function page({ params }: Props) {
  const { userId, communityId } = await params;
  const cookieStore = await cookies()

  let communityName: string = '';
  let communityTag = [];
  let questionList = [];
  let pagination: Pagination = {
    PageSize: 10,
    PageIndex: 1,
    NoOfPages: 1,
  }
  let userData = {}

  const fcCookie = cookieStore.get('fc');

  const authUserRes = await verifyUserApi.request({
    CommunityUserId: userId,
    FcCode: fcCookie?.value,
  })

  if (authUserRes.statusCode === 401) {
    redirect('/')
  }

  if (authUserRes.statusCode === 200) {
    const comRes = await communityApi.request({
      UserId: userId,
      CommunityId: communityId,
    });
    const questionRes = await questionApi.request({
      CommunityId: communityId,
      CommunityUserId: userId,
      PageSize: 10,
      PageIndex: 1,
    })
    const userRes = await userApi.request({
      CommunityId: communityId,
    })


    const comJson = JSON.parse(comRes.result)
    const qusJson = JSON.parse(questionRes.result)

    communityTag = comRes.isSuccess && !!comJson ? comJson[0].CommunityTags : [];
    communityName = comRes.isSuccess && !!comJson ? comJson[0].CommunityName : '';
    userData = userRes.isSuccess ? JSON.parse(userRes.result)[0] : {}

    const qusData = questionRes.isSuccess && !!qusJson ? qusJson[0] : {}

    questionList = qusData.Questions || [];
    const page = JSON.parse(qusData?.PaginationData ?? '{}')
    pagination = {
      PageSize: page?.PageSize ?? 10,
      PageIndex: page?.PageIndex ?? 1,
      NoOfPages: page?.NoOfPages ?? 1,
    }
  }

  return (
    <Suspense fallback={
      <div className="flex justify-center items-center my-auto">
        <Image
          height={100}
          width={100}
          src='/static/Rolling@1x-0.4s-200px-200px.svg'
          alt="animation"
        />
      </div>
    }>
      <div className="flex justify-center items-center">
        {authUserRes.isSuccess ? <QuestionPage
          userId={userId}
          communityId={communityId}
          communityName={communityName}
          CommunityTags={communityTag}
          QuestionList={questionList}
          Pagination={pagination}
          UserData={userData}
        /> : <p>{authUserRes.errorMessages?.join(', ')}</p>}
      </div>
    </Suspense>
  );
}

export default page;
