import { postApi } from "./base";

export async function getAdditionalQuestions(url: string) {
  console.log("Getting additional questions for URL:", url);
  const response = await postApi<{ followUpQuestions: string[] }>(`/widget/getQuestionsForUrl`, {
    url,
  });

  console.log(response);

  return response.followUpQuestions;
}

export async function getAnswerForQuestion(question: string) {
  const response = await postApi<{ answer: string }>(`/widget/getAnswerForQuestion`, {
    question,
  });

  return response.answer;
}
