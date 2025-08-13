
import ServerApi from "@/api/Server";
import AnswerPage from "@/components/page/answer/AnswerPage";
import Pagination from "@/interface/common/Pagination";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Image from "next/image";
import { Suspense } from "react";

type Props = {
  params: Promise<{ userId: string; communityId: number, CQId: number }>;
};

const questionApi = new ServerApi({ spName: "spCommunityForumAnonymous", mode: 6 });
const answerApi = new ServerApi({ spName: "spCommunityForumAnonymous", mode: 7 });
const verifyUserApi = new ServerApi({ spName: "spCommunityForumAnonymous", mode: 9 });


async function Home(props: Props) {

  const params = await props.params;
  const cookieStore = await cookies();
  const fcCookie = cookieStore.get('fc');

  let questions = {};
  let answerList = [];
  let pagination: Pagination = {
    PageIndex: 1,
    NoOfPages: 1,
    PageSize: 10,
  }

  const authUserRes = await verifyUserApi.request({
    CommunityUserId: params.userId,
    FcCode: fcCookie?.value,
  })

  if (authUserRes.statusCode === 401) {
    redirect('/')
  }

  if (authUserRes.statusCode === 200) {
    const questionRes = await questionApi
      .request({
        CommunityUserId: params.userId,
        CommunityId: params.communityId,
        CQId: params.CQId,
      })
    const qusJson = JSON.parse(questionRes.result)
    questions = questionRes.isSuccess && !!qusJson ? qusJson[0] : {};

    const ansRes = await answerApi
      .request({
        CommunityUserId: params.userId,
        CQId: params.CQId,
        PageSize: 10,
        PageIndex: 1,
      })

    const ansJson = ansRes.isSuccess ? JSON.parse(ansRes.result ?? '[]') : [];
    answerList = ansJson[0]?.Answers ?? [];
    const page = JSON.parse(ansJson[0]?.PaginationData ?? '{}');
    pagination = {
      PageIndex: page?.PageIndex ?? 1,
      NoOfPages: page?.NoOfPages ?? 1,
      PageSize: page?.PageSize ?? 10,
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
      <AnswerPage
        question={questions}
        answerList={answerList}
        userId={String(params.userId)}
        pagination={pagination}
      />
    </Suspense>
  );
}

export default Home;
