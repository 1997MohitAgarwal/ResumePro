import { useState, useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";
import { UploadCloud, Loader, CheckCircle, Send } from "lucide-react";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

//Navbar
function Navbar() {
  return (
    <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center border-b border-gray-100">
      <div className="flex items-center space-x-3">
        <img
          src="/assets/images/Ai.png"
          alt="App Logo"
          width={40}
          height={40}
        />
        <h1 className="text-xl text-rose-500 font-bold">
          Resume<span className="text-gray-800">Pro</span>
        </h1>
      </div>
    </nav>
  );
}

export default function ResumeReview() {
  const [file, setFile] = useState(null);
  const [loadingStep, setLoadingStep] = useState(-1);
  const [analysis, setAnalysis] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const chatContainerRef = useRef(null);

  const steps = [
    "Parsing document...",
    "Analyzing content...",
    "Generating insights...",
  ];

const part1 = "sk-proj-UFAxsDsBEERToW8UejUiNnd5cVxK";
const part2 = "UA2Xj24LvB7BV25cCctcmhnF6BN4kA9_Bdyn";
const part3 = "sFxOuClJMxT3BlbkFJVbL41PZy-2ePEp50aunsbac3Yged0xfazVNyvmkUMV56OvblkjgFIPxsB5P4t68idrvfmkcJcA";
const apiKey = `${part1}${part2}${part3}`;

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileChange = async (event) => {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setAnalysis(null);
    setMessages([]);
    setLoadingStep(0);

    try {
      const text = await extractTextFromPDF(uploadedFile);
      setResumeText(text);
      parseResumeWithAI(text);
    } catch (error) {
      console.error("Error processing file:", error);
      setAnalysis("Error: Unable to process the file. Please try again.");
    }
  };


  // extract data from the resume
  const extractTextFromPDF = async (file) => {
    const fileReader = new FileReader();
    return new Promise((resolve, reject) => {
      fileReader.onload = async () => {
        const typedArray = new Uint8Array(fileReader.result);
        try {
          const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
          let text = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            text += textContent.items.map((item) => item.str).join(" ") + "\n";
          }
          resolve(text);
        } catch (error) {
          reject(error);
        }
      };
      fileReader.readAsArrayBuffer(file);
    });
  };


  //send the data to the AI to generate analysis
  const parseResumeWithAI = async (resumeText) => {
    steps.forEach((_, index) => {
      setTimeout(() => setLoadingStep(index), index * 800);
    });

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "You are an expert resume reviewer. Always provide structured feedback using the following format:\n\n## KEY SKILLS:\n- List skills\n\n## EXPERIENCE:\n- List experience\n\n## EDUCATION:\n- List education\n\n## AREAS FOR IMPROVEMENT:\n- List weaknesses and improvements\n\n## RECOMMENDED ROLES:\n- List roles\n\n## FEEDBACK:\n- Summarize strengths and suggestions",
              },
              { role: "user", content: `Analyze this resume:\n${resumeText}` },
            ],
          }),
        }
      );

      const result = await response.json();
      setTimeout(() => {
        setAnalysis(
          result.choices[0]?.message?.content || "No response from AI."
        );
        setLoadingStep(steps.length);
      }, 800);
    } catch (error) {
      console.error("Error parsing resume with AI:", error);
      setAnalysis(
        "Error: Unable to analyze the resume. Please try again later."
      );
    }
  };


  //Chat with AI regarding the resume- User and AI chat
  const sendMessageToAI = async () => {
    if (!userMessage.trim() || !resumeText) return;

    const newMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setUserMessage("");
    setIsChatLoading(true);

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "You are an expert resume reviewer. Always respond in a structured format with section headers (e.g., ## RESPONSE) unless the question requires a simple answer. Use the resume text and previous conversation for context.",
              },
              { role: "user", content: `Resume Text:\n${resumeText}` },
              ...newMessages,
            ],
          }),
        }
      );

      const result = await response.json();
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            result.choices[0]?.message?.content || "No response from AI.",
        },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Error: Unable to respond. Please try again.",
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Divide the contents based on headings ##Skills, ##Education etc
  const parseStructuredContent = (content) => {
    const sections = [];
    const regex = /##\s*(.+?)\n([\s\S]*?)(?=##|$)/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      const title = match[1].trim();
      const body = match[2].trim();
      if (body) {
        sections.push({ title, content: body });
      }
    }
    return sections.length > 0
      ? sections
      : [{ title: "Response", content: content.trim() }];
  };

  // Render the AI analysis in a structured manner in the UI
  const renderStructuredContent = (content) => {
    const sections = parseStructuredContent(content);
    return sections.map((section, index) => (
      <div key={index} className="mb-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          {section.title}
        </h3>
        <div className="text-gray-600 text-sm whitespace-pre-line">
          {section.content}
        </div>
      </div>
    ));
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col min-h-[calc(100vh-73px)] bg-rose-100">
        <div className="flex-grow flex items-center justify-center p-2">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
              Resume Review Pro
            </h1>

            {/* Prominent Upload Section */}
            <div className="mb-12">
              <label className="w-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-rose-400 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all duration-300 cursor-pointer">
                <UploadCloud className="w-20 h-20 text-rose-300 mb-6" />
                <span className="text-lg lg:text-2xl text-center font-semibold break-words w-full text-gray-800">
                  {file ? file.name : "Upload Your Resume Now"}
                </span>
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {loadingStep >= 0 && loadingStep < steps.length && (
              <div className="flex items-center justify-center mb-8">
                <Loader className="animate-spin w-8 h-8 text-rose-500 mr-4" />
                <span className="text-lg text-gray-700 font-medium">
                  {steps[loadingStep]}
                </span>
              </div>
            )}

            {analysis && (
              <div className="space-y-8">
                <h2 className="text-lg lg:text-2xl font-semibold text-gray-800 mb-6 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
                  Resume Analysis
                </h2>
                <div className="max-h-100 overflow-y-auto p-3 bg-gray-50 rounded-xl">
                  {renderStructuredContent(analysis)}
                </div>

                <h2 className="text-lg lg:text-2xl text-center font-semibold text-gray-800 mt-12 mb-1 lg:mb-6">
                  Chat with AI
                </h2>
                <div
                  ref={chatContainerRef}
                  className="h-72 overflow-y-auto bg-gray-50 rounded-xl p-3 space-y-4"
                >
                  {messages.length === 0 ? (
                    <p className="text-gray-500 text-center">
                      Ask a question about your resume!
                    </p>
                  ) : (
                    messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-xl ${
                          msg.role === "user"
                            ? "bg-rose-100 text-gray-800 self-end"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {msg.role === "user" ? (
                          <div className="text-base">{msg.content}</div>
                        ) : (
                          renderStructuredContent(msg.content)
                        )}
                      </div>
                    ))
                  )}
                  {isChatLoading && (
                    <div className="flex items-center justify-center">
                      <Loader className="animate-spin w-6 h-6 text-rose-500 mr-2" />
                      <span className="text-gray-600">AI is thinking...</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center mt-4">
                  <input
                    type="text"
                    className="flex-grow p-4 bg-gray-50 border border-gray-300 rounded-l-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="Ask about your resume..."
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    disabled={isChatLoading}
                  />
                  <button
                    className="p-4 bg-rose-500 rounded-r-xl hover:bg-rose-600 transition-colors duration-200 disabled:bg-rose-300"
                    onClick={sendMessageToAI}
                    disabled={isChatLoading}
                  >
                    <Send className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
