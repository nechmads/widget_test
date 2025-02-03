import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { getAdditionalQuestions, getAnswerForQuestion } from "./lib/api/widget";
import ReactMarkdown from "react-markdown";

interface QuestionWithAnswer {
  id: string;
  question: string;
  answer?: string;
  isLoading?: boolean;
}

function App() {
  const [url, setUrl] = useState("");
  const [questions, setQuestions] = useState<QuestionWithAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRTL] = useState(true); // Default to true for Hebrew

  const handleGenerateWidget = async () => {
    setIsLoading(true);
    try {
      const questionsList = await getAdditionalQuestions(url);
      setQuestions(
        questionsList.map((q, index) => ({
          id: `q-${index}`,
          question: q,
        }))
      );
    } catch (error) {
      console.error("Error generating widget:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionClick = async (questionId: string) => {
    // Don't do anything if the question already has an answer
    const questionToAnswer = questions.find((q) => q.id === questionId);
    if (questionToAnswer?.answer || questionToAnswer?.isLoading) return;

    // Update loading state for this specific question
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) => (q.id === questionId ? { ...q, isLoading: true } : q))
    );

    try {
      const answer = await getAnswerForQuestion(questionToAnswer!.question);
      setQuestions((prevQuestions) =>
        prevQuestions.map((q) => (q.id === questionId ? { ...q, answer, isLoading: false } : q))
      );
    } catch (error) {
      console.error("Error getting answer:", error);
      setQuestions((prevQuestions) =>
        prevQuestions.map((q) => (q.id === questionId ? { ...q, isLoading: false } : q))
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Main Card */}
        <Card className="overflow-hidden bg-white dark:bg-gray-800 rounded-3xl shadow-lg">
          <CardContent className="p-8">
            {/* Title Section */}
            <div className="mb-8">
              <h1
                className="text-4xl font-bold tracking-tight"
                style={{
                  fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                Dive Deeper
              </h1>
            </div>

            {/* Input Section */}
            <div className="flex gap-4 mb-8">
              <Input
                type="url"
                placeholder="Enter your URL here..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-grow rounded-xl border-2 h-12 text-lg"
              />
              <Button
                onClick={handleGenerateWidget}
                disabled={isLoading || !url}
                className="rounded-xl h-12 px-6 text-lg font-medium bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
              >
                {isLoading ? "Generating..." : "Generate"}
              </Button>
            </div>

            {/* Questions Grid */}
            {questions.length > 0 && (
              <div className="space-y-4">
                {questions.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleQuestionClick(item.id)}
                    className={`w-full relative rounded-2xl p-6 ${
                      isRTL ? "text-right" : "text-left"
                    } transition-all ${
                      item.answer
                        ? "bg-blue-50 dark:bg-gray-700"
                        : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                    } ${item.isLoading ? "animate-pulse" : ""}`}
                    disabled={!!item.answer || item.isLoading}
                  >
                    <div className="flex flex-col">
                      <div
                        className={`text-4xl font-bold mb-2 ${isRTL ? "self-end" : "self-start"}`}
                      >
                        {`Q${parseInt(item.id.split("-")[1]) + 1}`}
                      </div>
                      <p
                        className={`text-sm text-gray-600 dark:text-gray-300 ${
                          isRTL ? "text-right" : "text-left"
                        }`}
                        dir={isRTL ? "rtl" : "ltr"}
                      >
                        {item.question}
                      </p>
                      {item.answer && (
                        <div className="mt-4">
                          <div
                            className={`prose dark:prose-invert prose-sm max-w-none ${
                              isRTL ? "text-right" : "text-left"
                            }`}
                            dir={isRTL ? "rtl" : "ltr"}
                          >
                            <ReactMarkdown>{item.answer}</ReactMarkdown>
                          </div>
                        </div>
                      )}
                      {item.isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-white/5 rounded-2xl">
                          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-500 border-t-transparent" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
