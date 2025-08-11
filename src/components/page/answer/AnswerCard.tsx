import ServerApi from "@/api/Server";
import { apiErrorToast } from "@/helper/apiErrorToast";
import { useToken } from "@/helper/useToken";
import TblAnswer from "@/interface/database/TblAnswer";
import Image from "next/image";
import { BiDislike, BiLike, BiSolidDislike, BiSolidLike } from "react-icons/bi";
import { MdDelete, MdModeEditOutline } from "react-icons/md";
import Swal from "sweetalert2";

type Props = {
  answer: TblAnswer;
  userId?: string;
  refetch: () => void;
  onAnswerSelect: () => void;
};

function AnswerCard(prop: Props) {
  const { jwtToken, removeToken } = useToken()

  const { answer, userId } = prop;

  const likeAnDislikeApiForAnswer = new ServerApi({
    spName: "spCommunityForumWebsite",
    mode: 3,
    withAuth: true,
    token: jwtToken
  });

  const deleteAnsApi = new ServerApi({
    spName: "spCommunityForumWebsite",
    mode: 4,
    withAuth: true,
    token: jwtToken
  });

  async function handelDelAns() {
    Swal.fire({
      title: 'Attention !!',
      text: 'Do you want to delete this answer?',
      icon: 'question',
      showDenyButton: true,
      showCancelButton: false,
      denyButtonText: 'Cancel',
      confirmButtonText: 'Yes, Do it'
    }).then(async (ack) => {
      if (ack.isConfirmed) {
        const res = await deleteAnsApi.request({
          AnswerId: answer.AnswerId,
          CommunityUserId: userId,
        });
        if (res.statusCode === 401) {
          removeToken()
        }
        if (res.isSuccess) {
          prop.refetch();
        } else {
          apiErrorToast(res)
        }
      }
    })

  }

  async function toggleLikeDislike(a: TblAnswer, type: "like" | "dislike") {
    const res = await likeAnDislikeApiForAnswer.request({
      AnswerId: a.AnswerId,
      CommunityUserId: userId,
      IsLiked:
        (a.IsLiked && type === "like") || type === "dislike" ? false : true,
      IsDisLiked:
        (a.IsDisLiked && type === "dislike") || type === "like" ? false : true,
    });
    if (res.statusCode === 401) {
      removeToken()
    }

    if (res.isSuccess) prop.refetch();
    else apiErrorToast(res);
  }

  return (
    <>
      <div className="w-full bg-slate-50 border border-primary-light rounded-2xl p-6 shadow-sm space-y-6 font-sans">
        {/* Divider */}
        {/* <div className="h-px bg-gray-100" /> */}

        {/* User Info + Time */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image
              width={36}
              height={36}
              src={
                answer.CreatedUser?.[0].ProfileImageDocumentUrl ??
                "/default-profile.png"
              }
              alt="User Icon"
              className="rounded-full object-cover ring-1 ring-gray-300"
            />
            <span className="text-sm font-semibold text-gray-900">
              {answer.CreatedUser?.[0].FullName}
            </span>
          </div>
          <span className="text-md text-gray-500">
            {answer.CreatedOn}
          </span>
        </div>

        {/* Answer Content */}
        <div className="text-gray-800 text-base leading-relaxed space-y-4">
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{
              __html: String(answer.AnswerText),
            }}
          />

          {!!answer.AnswerAttachment?.length && (
            <div>
              <p className="text-sm font-medium text-gray-900">Attachments:</p>
              <ul className="list-disc list-inside text-blue-600 space-y-1 text-sm">
                {answer.AnswerAttachment.map((m, index) => (
                  <li key={`ans_attachment-${index}`}>
                    <a
                      href={m.DocumentUrl ?? m.ExternalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      Link {index + 1}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Likes */}
          <div className="flex items-center gap-4 text-gray-600 text-sm">
            <button
              onClick={() => toggleLikeDislike(answer, "like")}
              className="hover:text-blue-600 transition cursor-pointer"
            >
              {answer.IsLiked ? (
                <BiSolidLike className="w-5 h-5 text-blue-500" />
              ) : (
                <BiLike className="w-5 h-5 text-blue-500" />
              )}
            </button>
            <span>{answer.LikeCount}</span>

            <button
              onClick={() => toggleLikeDislike(answer, "dislike")}
              className="hover:text-red-500 transition cursor-pointer"
            >
              {answer.IsDisLiked ? (
                <BiSolidDislike className="w-5 h-5 text-rose-500" />
              ) : (
                <BiDislike className="w-5 h-5 text-rose-500" />
              )}
            </button>
            <span>{answer.DisLikeCount}</span>
          </div>

          {/* Buttons */}
          {userId === answer.CreatedUser?.[0].Id &&
            <div className="flex gap-3">
              <button
                onClick={() => prop.onAnswerSelect()}
                className="btn btn-sm btn-outline-primary flex gap-x-2"
              >
                <MdModeEditOutline />
                Edit
              </button>

              <button
                onClick={handelDelAns}
                className="btn btn-sm btn-outline-danger flex gap-x-2"
              >
                <MdDelete />
                Delete
              </button>
            </div>
          }
        </div>
      </div>
    </>
  );
}

export default AnswerCard;
