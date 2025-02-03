import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Widget Generator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Enter a URL to generate relevant questions for your content
          </p>
        </div>

        {/* Main Input Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Generate Your Widget</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="url"
                placeholder="Enter your URL here..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-grow"
              />
              <Button
                onClick={handleGenerateWidget}
                disabled={isLoading || !url}
                className="whitespace-nowrap"
              >
                {isLoading ? "Generating..." : "Generate Widget"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Questions Display */}
        {questions.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Additional Questions to Ask</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-6">
                {questions.map((item) => (
                  <li key={item.id} className="space-y-3">
                    <button
                      onClick={() => handleQuestionClick(item.id)}
                      className={`w-full text-left p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-200 ${
                        !item.answer && !item.isLoading
                          ? "hover:border-blue-500 hover:shadow-md cursor-pointer"
                          : ""
                      }`}
                      disabled={!!item.answer || item.isLoading}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex-grow">{item.question}</span>
                        {item.isLoading && (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent" />
                        )}
                      </div>
                    </button>

                    {item.answer && (
                      <div className="ml-4 p-4 bg-blue-50 dark:bg-gray-700/50 rounded-lg border border-blue-100 dark:border-gray-600">
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Answer:</p>
                        <div className="prose dark:prose-invert prose-sm max-w-none">
                          <ReactMarkdown>{item.answer}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default App;
